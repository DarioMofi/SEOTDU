/**
 * Servicio de acceso a datos espaciales y configuración de capas.
 * Centraliza las peticiones para facilitar la futura migración a un backend (ej. Supabase/PostgreSQL).
 */

/**
 * La entrega nueva de cartografía vive en `public/layers/GeoJSON/`, organizada
 * en carpetas y descrita por `catalogo.json`. La vieja son archivos sueltos en
 * `public/layers/`, que se conservan mientras se valida la migración.
 *
 * Son dos cosas distintas y por eso se resuelven distinto:
 *
 * - **De qué archivo se sirve una capa** (`indiceEntregaNueva`): se indexa el
 *   catálogo completo. Es una búsqueda por id y no cambia qué capas existen.
 * - **Qué capas existen** (`getCapasDisponibles`): los mapas de esta lista.
 *   `null` = todos. Ampliarla exigió antes cambiar la resolución de nombres
 *   del volcado viejo, que emparejaba por sufijo y con 112 ids empezaba a
 *   confundir capas de otro monitor.
 *
 * **Para volver atrás**, `public/layers/Referencia monitores antes de
 * migrar.md` tiene cómo se veía cada monitor antes de tocar esto.
 */
const MAPAS_MIGRADOS: string[] | null = null

function estaMigrado(id: string): boolean {
  return MAPAS_MIGRADOS === null || MAPAS_MIGRADOS.includes(id)
}



/**
 * Capas de un módulo migrado que siguen leyéndose del archivo suelto.
 *
 * La red regional es el mismo dato en las dos generaciones —76,897 tramos,
 * misma geometría, mismos campos— pero la entrega nueva pesa 93 MB contra 31
 * del anterior: la diferencia son metadatos repetidos en cada tramo. Como la
 * capa va fija y se carga siempre, se sirve la ligera.
 */
const SERVIDAS_DEL_ARCHIVO_VIEJO: Record<string, string> = {
  c04redregionalimtinegi2024: 'RNC_2025_SURESTE',
}

/**
 * Normaliza para comparar ids entre generaciones: la entrega nueva bajó los
 * nombres a minúscula y les quitó los acentos.
 */
function norm(id: string): string {
  return id
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

interface Catalogo {
  raiz: string
  mapas: Array<{
    id: string
    secciones: Array<{
      capas: Array<{ id: string; ruta: string; categoria?: string | null }>
    }>
  }>
}

function leerCatalogo(): Promise<Catalogo | null> {
  return fetch('/layers/catalogo.json')
    .then((r) => (r.ok ? (r.json() as Promise<Catalogo>) : null))
    .catch(() => null)
}

/** id normalizado -> URL del GeoJSON en la entrega nueva. */
let indicePromesa: Promise<Map<string, string>> | null = null

function indiceEntregaNueva(): Promise<Map<string, string>> {
  // Se resuelve una sola vez por sesión: el catálogo no cambia en caliente y
  // esto se consulta una vez por capa dibujada.
  if (!indicePromesa) {
    indicePromesa = leerCatalogo().then((catalogo) => {
      const indice = new Map<string, string>()
      if (!catalogo) return indice // Sin catálogo se sigue sirviendo lo viejo.
      for (const mapa of catalogo.mapas) {
        for (const seccion of mapa.secciones) {
          for (const capa of seccion.capas) {
            indice.set(norm(capa.id), `${catalogo.raiz}/${capa.ruta}`)
          }
        }
      }
      return indice
    })
  }
  return indicePromesa
}

/**
 * Obtiene la geometría (GeoJSON) de una capa específica.
 *
 * Busca primero en la entrega nueva. El id llega con el nombre que declara el
 * volcado de QGIS (`C04_Aeropuertos_2012`) mientras que el archivo nuevo va en
 * minúscula, así que la búsqueda es por id normalizado.
 */
export async function getCapaGeoJSON(layerId: string): Promise<any> {
  const excepcion = SERVIDAS_DEL_ARCHIVO_VIEJO[norm(layerId)]
  const url = excepcion
    ? `/layers/${excepcion}.geojson`
    : ((await indiceEntregaNueva()).get(norm(layerId)) ?? `/layers/${layerId}.geojson`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GeoJSON no encontrado para ${layerId}`)
  return res.json()
}

/**
 * Obtiene la lista de IDs de capas disponibles.
 *
 * Une las dos generaciones: los archivos sueltos de `available.json` y las
 * capas de los módulos ya migrados. `ModuleLayerSelector` descarta lo que no
 * esté en esta lista, así que sin la unión las capas nuevas no aparecerían.
 */
export async function getCapasDisponibles(): Promise<string[]> {
  const res = await fetch('/layers/available.json')
  if (!res.ok) throw new Error('No se pudo cargar la lista de capas disponibles')
  const sueltas: string[] = await res.json()

  const catalogo = await leerCatalogo()
  if (!catalogo) return sueltas

  const nuevas = catalogo.mapas
    .filter((m) => estaMigrado(m.id))
    .flatMap((m) => m.secciones.flatMap((s) => s.capas.map((c) => c.id)))

  // Varias capas existen en las dos generaciones con el mismo nombre
  // (`C04_Aeropuertos_2012` y `c04_aeropuertos_2012`). En un módulo migrado
  // manda la entrega nueva, así que la suelta se retira de la lista: si se
  // quedara, `ModuleLayerSelector` la resolvería por coincidencia exacta y el
  // id acabaría siendo el viejo, que ya no coincide con `defaultLayers`.
  const migradas = new Set(nuevas.map(norm))
  const sinDuplicar = sueltas.filter((id) => !migradas.has(norm(id)))
  return [...new Set([...sinDuplicar, ...nuevas])]
}

/**
 * Cómo clasifica la cartografía cada capa: `Diagnostico`, `Estrategia` o
 * `Mapa_Base`.
 *
 * Sale del atributo `categoria` del propio GeoJSON, precalculado en el
 * catálogo: el menú necesita agrupar las capas antes de descargarlas.
 *
 * La clave es el id normalizado, porque el volcado de QGIS nombra las capas
 * con el nombre original y el catálogo con el del archivo.
 */
export async function getCategoriasDeCapas(): Promise<Record<string, string>> {
  const catalogo = await leerCatalogo()
  if (!catalogo) return {}
  const out: Record<string, string> = {}
  for (const mapa of catalogo.mapas) {
    for (const seccion of mapa.secciones) {
      for (const capa of seccion.capas) {
        if (capa.categoria) out[norm(capa.id)] = capa.categoria
      }
    }
  }
  return out
}

/**
 * Obtiene la configuración de simbología para un módulo o archivo específico.
 */
export async function getEstiloModulo(archivo: string): Promise<any> {
  const res = await fetch(`/estilos/${archivo}`)
  if (!res.ok) throw new Error(`Estilo no encontrado: ${archivo}`)
  return res.json()
}
