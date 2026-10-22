// Acceso único a las tablas del programa (seguimiento de proyectos, estrategia
// e indicadores, publicaciones de instrumentos).
//
// PROVISIONAL: hoy son JSON estáticos en public/datos/, generados desde los
// Excel de datos-fuente/ con `python scripts/actualizar-datos.py`. En la
// versión final serán tablas de Supabase; cambiar el `fetch` de aquí basta.

import { norm } from './cartografia'

export interface ProyectoSeguimiento {
  id: string
  clave: string | null
  estrategia: string | null
  /** Ambiental, Social, Infraestructura o Económico */
  monitor: string
  /** Módulo del geovisor que lo contiene */
  modulo: string | null
  nombre: string
  ubicacion: string | null
  linea: string | null
  monto: string | null
  publico: boolean
  privado: boolean
  plazo: string | null
  prioridad: string | null
  responsable: string | null
  coordinacion: string | null
  poblacion: string | null
  financiamiento: string | null
  /** Archivos (.gpkg) de las capas que lo representan */
  capas: string[]
}

export interface EstrategiaIndicador {
  clave: string | null
  estrategia: string
  monitor: string
  modulo: string | null
  principio: string | null
  archivo: string
  capaNorm: string
  nombreCapa: string | null
  linea: string | null
  accion: string | null
  dimension: string | null
  indicador: string | null
  definicion: string | null
  metodo: string | null
  unidadMedida: string | null
  unidadAnalisis: string | null
  frecuencia: string | null
  lineaBase: string | null
  lineaAprobatoria: string | null
  meta: string | null
  sentido: string | null
  semaforizacion: string | null
  justificacion: string | null
  responsable: string | null
  fuente: string | null
}

export interface PublicacionInstrumento {
  linkPublicacion: string | null
  /** Texto cuando no hay enlace («No disponible en sistema…») */
  notaPublicacion: string | null
  linkRepositorio: string | null
  linkPdfExterno: string | null
}

import { assetUrl } from './assetUrl'

const cache = new Map<string, Promise<unknown>>()

function cargar<T>(archivo: string, vacio: T): Promise<T> {
  if (!cache.has(archivo)) {
    cache.set(
      archivo,
      fetch(assetUrl(`/datos/${archivo}`))
        .then((r) => (r.ok ? r.json() : vacio))
        .catch((err) => {
          console.error(`No se pudo leer /datos/${archivo}`, err)
          return vacio
        }),
    )
  }
  return cache.get(archivo) as Promise<T>
}

export const getProyectosSeguimiento = () =>
  cargar<ProyectoSeguimiento[]>('proyectos-seguimiento.json', [])

export const getEstrategiaIndicadores = () =>
  cargar<EstrategiaIndicador[]>('estrategia-indicadores.json', [])

export const getPublicacionesInstrumentos = () =>
  cargar<Record<string, PublicacionInstrumento>>('publicaciones-instrumentos.json', {})

/** Misma capa aunque cambien acentos, mayúsculas o separadores */
export const esMismaCapa = (a: string, b: string) => norm(a) === norm(b)

export function indicadoresDeCapa(todos: EstrategiaIndicador[], layerId: string) {
  const n = norm(layerId)
  return todos.filter((x) => x.capaNorm === n)
}

export function proyectosDeCapa(todos: ProyectoSeguimiento[], layerId: string) {
  return todos.filter((p) => p.capas.some((c) => esMismaCapa(c, layerId)))
}

// ─── Trazabilidad modular: narrativa y analítica por tema ──────────────────
// Generado desde datos-fuente/Trazabilidad modular-SEOTDU.docx con
// `python scripts/extraer-trazabilidad.py`.

export interface SerieTema {
  titulo: string | null
  unidad: string | null
  datos: { etiqueta: string; valor: number }[]
}

export interface TemaTrazabilidad {
  id: string
  /** Módulo del geovisor (ambiental, social, infraestructura, aptitud, normatividad) */
  monitor: string
  subsistema: string
  vista: 'desempeno' | 'estrategia'
  seccion: string | null
  tema: string
  titulo: string
  descripcion: string
  variables: string
  capasTexto: string
  /** Capas vinculadas, con id normalizado (ver norm() de cartografia.ts) */
  capas: string[]
  analitica: string
  narrativa: string
  series: SerieTema[]
}

export const getTemasTrazabilidad = () =>
  cargar<TemaTrazabilidad[]>('trazabilidad-temas.json', [])

export function temasDeCapa(todos: TemaTrazabilidad[], layerId: string) {
  const n = norm(layerId)
  return todos.filter((t) => t.capas.includes(n))
}

// ─── Completitud del panel por capa ────────────────────────────────────────
// Qué pestañas de PanelCapa tienen contenido para cada capa. Cada rama usa las
// suyas: Desempeño territorial → Narrativa y Analítica (trazabilidad modular de
// los insumos); Estrategia territorial → Estrategia (indicadores y proyectos).

export interface CompletitudCapa {
  narrativa: boolean
  analitica: boolean
  estrategia: boolean
}

/** id normalizado de capa → pestañas con contenido. Solo incluye capas con al menos una. */
export async function getCompletitudCapas(): Promise<Map<string, CompletitudCapa>> {
  const [temas, indicadores, proyectos] = await Promise.all([
    getTemasTrazabilidad(),
    getEstrategiaIndicadores(),
    getProyectosSeguimiento(),
  ])
  const out = new Map<string, CompletitudCapa>()
  const de = (id: string) => {
    if (!out.has(id)) out.set(id, { narrativa: false, analitica: false, estrategia: false })
    return out.get(id)!
  }
  // Solo los temas de diagnóstico: la trazabilidad describe los insumos
  for (const t of temas.filter((x) => x.vista === 'desempeno')) {
    for (const c of t.capas) {
      const x = de(c)
      if ((t.narrativa || t.descripcion).trim()) x.narrativa = true
      if (t.analitica.trim() || t.series.length > 0) x.analitica = true
    }
  }
  for (const i of indicadores) if (i.capaNorm) de(i.capaNorm).estrategia = true
  for (const p of proyectos) for (const c of p.capas) de(norm(c)).estrategia = true
  return out
}

export type VistaCapa = 'desempeno' | 'estrategia'
export type PestanaPanel = keyof CompletitudCapa

/** Pestañas del panel que corresponden a una capa según su rama */
export const pestanasDeVista = (v: VistaCapa): PestanaPanel[] =>
  v === 'desempeno' ? ['narrativa', 'analitica'] : ['estrategia']

/** ¿La capa tiene contenido en todas las pestañas de su rama? */
export const completaEnVista = (c: CompletitudCapa | undefined, v: VistaCapa) =>
  !!c && pestanasDeVista(v).every((p) => c[p])

/** ¿Hay algo que mostrar en el panel para la capa en su rama? */
export const tieneContenido = (c: CompletitudCapa | undefined, v: VistaCapa | undefined) =>
  !!c && (v ? pestanasDeVista(v).some((p) => c[p]) : c.narrativa || c.analitica || c.estrategia)

// ─── Incidencias de cartografía ────────────────────────────────────────────
// Capas citadas en el PEOTDU que aún no se pueden desplegar (archivo
// inexistente, tabla vacía…). Fuente: datos-fuente/Incidencias EN CARTOGRAFIA
// - SEOTDU.xlsx con `python scripts/extraer-incidencias.py`.

export interface IncidenciaCapa {
  modulo: string
  subsistema: string | null
  tematica: string | null
  nombre: string
  archivo: string | null
  capaNorm: string | null
  vista: VistaCapa
  estatus: string
  incidencia: string | null
  observaciones: string | null
}

let incidencias: Promise<IncidenciaCapa[]> | null = null
export const getIncidenciasCartografia = () =>
  (incidencias ??= import('../data/incidencias-cartografia.json').then((m) => m.default as IncidenciaCapa[]))
