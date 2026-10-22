// Limpieza de textos para rótulos y fichas: nombres completos en lugar de
// claves, abreviaturas y siglas. Lógica pura (sin DOM, Leaflet ni React) para
// que sobreviva a la migración a Supabase o pueda correr en el servidor.
//
// PROVISIONAL: el diccionario de campos cubre solo las variables del SCINCE
// 2020 cuyo significado se verificó contra los datos (las sumas cuadran). El
// resto se muestra con su clave hasta incorporar el «Descriptor de variables»
// oficial del INEGI; en SQL esto será una tabla de diccionario, no código.

import { LOCALIDADES_URBANAS } from '../data/localidadesUrbanas'

export const DICCIONARIO_CAMPOS: Record<string, string> = {
  // Identificación
  nomgeo: 'Nombre',
  nom_loc: 'Localidad',
  nom_mun: 'Municipio',
  nom_ent: 'Entidad federativa',
  cvegeo: 'Clave geoestadística',
  cve_ageb: 'Clave del área geoestadística básica (AGEB)',
  cve_ent: 'Clave de la entidad',
  cve_mun: 'Clave del municipio',
  cve_met: 'Clave de la zona metropolitana',
  nom_met: 'Zona metropolitana',
  tipo_met: 'Tipo de zona metropolitana',
  // Población (SCINCE 2020)
  pob1: 'Población total',
  pob8: 'Población de 0 a 14 años',
  pob12: 'Población de 15 a 64 años',
  pob24: 'Población de 65 años y más',
  pob42: 'Población femenina',
  pob84: 'Población masculina',
  pob42_r: 'Porcentaje de población femenina',
  pob84_r: 'Porcentaje de población masculina',
  pob126_r: 'Relación de dependencia total',
  pob127_r: 'Relación de dependencia infantil',
  pob128_r: 'Relación de dependencia de la vejez',
  pob129_r: 'Edad mediana',
  pob130_r: 'Edad mediana de las mujeres',
  pob131_r: 'Edad mediana de los hombres',
  afro1: 'Población afromexicana o afrodescendiente',
  disc1: 'Población con discapacidad',
  salud1: 'Población afiliada a servicios de salud',
  salud2: 'Población sin afiliación a servicios de salud',
  // Vivienda y densidad
  viv0: 'Total de viviendas',
  viv1: 'Viviendas habitadas',
  viv2: 'Viviendas particulares habitadas',
  area_ha: 'Superficie (hectáreas)',
  dens_hab: 'Densidad de población (habitantes por hectárea)',
  dens_viv: 'Densidad de vivienda (viviendas por hectárea)',
  // Metadatos de la entrega
  denominacion_oficial: 'Denominación oficial',
  modulo_asignado: 'Módulo asignado',
  instrumento_vigencia: 'Vigencia del instrumento',
  fecha_actualizacion: 'Fecha de actualización',
  fuente_custodio: 'Fuente o custodio',
  responsable_institucional: 'Responsable institucional',
  proyeccion_original: 'Proyección original',
  proyeccion_actual: 'Proyección actual',
  cobertura_territorial: 'Cobertura territorial',
  restricciones_uso: 'Restricciones de uso',
  periodicidad_orig: 'Periodicidad',
}

/** Siglas que aparecen en valores y nombres de capa, con su nombre completo */
export const SIGLAS: Record<string, string> = {
  INEGI: 'Instituto Nacional de Estadística y Geografía',
  SCINCE: 'Sistema para la Consulta de Información Censal',
  CONANP: 'Comisión Nacional de Áreas Naturales Protegidas',
  CONABIO: 'Comisión Nacional para el Conocimiento y Uso de la Biodiversidad',
  CONAPO: 'Consejo Nacional de Población',
  SEDATU: 'Secretaría de Desarrollo Agrario, Territorial y Urbano',
  IMT: 'Instituto Mexicano del Transporte',
  ARTF: 'Agencia Reguladora del Transporte Ferroviario',
  INPI: 'Instituto Nacional de los Pueblos Indígenas',
  ANP: 'Área Natural Protegida',
  AGEB: 'Área Geoestadística Básica',
}

/** Abreviaturas frecuentes en toponimia y domicilios (exigen el punto final) */
const ABREVIATURAS: Array<[RegExp, string]> = [
  [/\bCd\./g, 'Ciudad'],
  [/\bCol\./g, 'Colonia'],
  [/\bFracc\./g, 'Fraccionamiento'],
  [/\bEj\./g, 'Ejido'],
  [/\bLoc\./g, 'Localidad'],
  [/\bMpio\./g, 'Municipio'],
  [/\bEdo\./g, 'Estado'],
  [/\bAv\./g, 'Avenida'],
  [/\bCarr\./g, 'Carretera'],
  [/\bGral\./g, 'General'],
  [/\bSta\./g, 'Santa'],
  [/\bSto\./g, 'Santo'],
  [/\bHda\./g, 'Hacienda'],
  [/\bRch\./g, 'Rancho'],
  [/\bNvo\./g, 'Nuevo'],
  [/\bNva\./g, 'Nueva'],
  [/\bPto\./g, 'Puerto'],
  [/\bPob\./g, 'Población'],
  [/\bHab\./g, 'Habitantes'],
  [/\bS\/N\b/g, 'Sin número'],
]

/** Valores codificados con guion bajo y sin acentos en la entrega */
const VALORES: Record<string, string> = {
  Cada_10_anios: 'Cada 10 años',
  'Cada 10 anios (Censo de Poblacion y Vivienda)': 'Cada 10 años (Censo de Población y Vivienda)',
  Mapa_Base: 'Mapa Base',
  Economico: 'Económico',
  No_aplica: 'No aplica',
  Publico: 'Público',
  Poligono: 'Polígono',
  'N/A': 'No aplica',
  'N/D': 'No disponible',
}

/**
 * Repara texto con doble codificación UTF-8 leído como Latin-1
 * («ChampotÃƒÂ³n» → «Champotón»). Viene así en algunas capas de la entrega;
 * se corrige al mostrarlo y debe corregirse en origen.
 */
// Caracteres de Windows-1252 en 0x80–0x9F (el resto coincide con Latin-1)
const CP1252: Record<string, number> = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89,
  'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95,
  '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
}

export function repararCodificacion(texto: string): string {
  let t = texto
  for (let i = 0; i < 3 && /Ã|Â/.test(t); i++) {
    try {
      const bytes = Uint8Array.from(Array.from(t, (c) => CP1252[c] ?? c.charCodeAt(0) & 0xff))
      const dec = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      if (dec === t) break
      t = dec
    } catch {
      break
    }
  }
  return t
}

export function expandirAbreviaturas(texto: string): string {
  let t = repararCodificacion(texto)
  for (const [re, completo] of ABREVIATURAS) t = t.replace(re, completo)
  return t
}

/** Etiqueta completa de un campo; si no está en el diccionario, se humaniza */
export function etiquetaCampo(clave: string): string {
  const k = clave.toLowerCase()
  if (DICCIONARIO_CAMPOS[k]) return DICCIONARIO_CAMPOS[k]
  // Variables del SCINCE sin descriptor cargado: se dejan reconocibles
  if (/^[a-z]+\d+(_r)?$/.test(k)) return `Variable censal ${clave.toUpperCase()}`
  const humano = k.replace(/_/g, ' ')
  return humano.charAt(0).toUpperCase() + humano.slice(1)
}

/** Sustituye siglas conocidas por «Nombre completo (SIGLA)» */
export function expandirSiglas(texto: string): string {
  return texto.replace(/\b([A-Z]{3,})(?:_(\d{4}))?\b/g, (m, sigla: string, anio?: string) => {
    const nombre = SIGLAS[sigla]
    if (!nombre) return m
    return `${nombre} (${sigla})${anio ? ` ${anio}` : ''}`
  })
}

/** Valor listo para mostrar en una ficha */
export function valorLegible(clave: string, valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return 'No disponible'
  if (typeof valor === 'number') {
    // El INEGI reserva con códigos negativos los datos protegidos por
    // confidencialidad (localidades de 1 o 2 viviendas).
    if (valor < 0 && /^(pob|viv|eco|edu|salud|disc|afro|indi)/i.test(clave)) return 'Dato reservado por confidencialidad'
    const esPorcentaje = /_r$/i.test(clave) && /(pob42|pob84)_r$/i.test(clave)
    const txt = valor.toLocaleString('es-MX', { maximumFractionDigits: 2 })
    return esPorcentaje ? `${txt} %` : txt
  }
  const texto = String(valor)
  if (VALORES[texto]) return VALORES[texto]
  // La entrega guardó algunas claves como número y perdieron el 0 inicial
  if (/^cvegeo$/i.test(clave) && /^\d{15}$/.test(texto)) return texto.padStart(16, '0')
  if (/^denominacion_oficial$/i.test(clave)) return nombreCapaLegible(texto)
  const limpio = expandirAbreviaturas(texto.replace(/_/g, ' '))
  // Las siglas se expanden en valores cortos (fuente, custodio); dentro de un
  // texto largo la expansión lo vuelve ilegible.
  return limpio.length <= 40 ? expandirSiglas(limpio) : limpio
}

/** Clave de localidad de 9 dígitos a partir de cualquier CVEGEO de la entrega */
function claveLocalidad(cvegeo: unknown): string | null {
  if (cvegeo === null || cvegeo === undefined) return null
  const s = String(cvegeo).replace(/\D/g, '')
  if (s.length === 13) return s.slice(4) // localidad urbana: '0000' + 9 dígitos
  if (s.length >= 15) return s.padStart(16, '0').slice(0, 9) // manzana (se perdió el 0 inicial)
  if (s.length === 9 || s.length === 8) return s.padStart(9, '0')
  return null
}

/** Nombre del elemento: localidad, zona o municipio, sin abreviaturas */
export function nombreElemento(props: Record<string, unknown>): string | null {
  const directo = props.nomgeo ?? props.NOMGEO ?? props.nom_loc ?? props.NOM_LOC ?? props.nombre ?? props.nom_met
  // El INEGI registra como «Ninguno» las localidades sin nombre
  if (directo && !/^ninguno$/i.test(String(directo).trim())) return expandirAbreviaturas(String(directo))
  if (directo) return null
  const clave = claveLocalidad(props.cvegeo ?? props.CVEGEO)
  if (clave && LOCALIDADES_URBANAS[clave]) return LOCALIDADES_URBANAS[clave]
  return null
}

export function esManzana(props: Record<string, unknown>): boolean {
  const s = String(props.cvegeo ?? props.CVEGEO ?? '').replace(/\D/g, '')
  return s.length >= 15
}

/** Población total del elemento, si el dato existe y no está reservado */
export function poblacionElemento(props: Record<string, unknown>): number | null {
  const v = props.pob1 ?? props.POB1 ?? props.pobtot ?? props.POBTOT
  return typeof v === 'number' && v >= 0 ? v : null
}

const CAMPOS_BASICOS = new Set([
  'nomgeo', 'nom_loc', 'nom_mun', 'nom_ent', 'nombre', 'nom_met', 'tipo_met', 'pob1', 'pob42', 'pob84', 'cvegeo',
])

const CAMPOS_OCULTOS = new Set([
  'fid', 'oid', 'objectid', 'titulo', 'tipo_dato', 'geometria', 'categoria', 'categoria_estrategia',
  'tema_subgrupo', 'restricciones', 'proyeccion', 'estatus', 'tipo_geometria_detectado',
  'tamanio_archivo_kb', 'extension_norte', 'extension_sur', 'extension_este', 'extension_oeste',
])

export interface FilaFicha { clave: string; etiqueta: string; valor: string }

/** Campos de control de la entrega: van al final de la información específica */
const CAMPOS_METADATOS = new Set([
  'denominacion_oficial', 'modulo_asignado', 'instrumento_vigencia', 'fecha_actualizacion',
  'fuente_custodio', 'responsable_institucional', 'proyeccion_original', 'proyeccion_actual',
  'cobertura_territorial', 'restricciones_uso', 'periodicidad_orig',
])

/** Reparte los atributos en información básica y específica */
export function separarFicha(props: Record<string, unknown>) {
  const basica: FilaFicha[] = []
  const especifica: FilaFicha[] = []
  for (const [clave, valor] of Object.entries(props)) {
    const k = clave.toLowerCase()
    if (CAMPOS_OCULTOS.has(k) || k.startsWith('objectid')) continue
    const fila = { clave, etiqueta: etiquetaCampo(clave), valor: valorLegible(clave, valor) }
    ;(CAMPOS_BASICOS.has(k) ? basica : especifica).push(fila)
  }
  // Primero los datos del elemento; los metadatos de la entrega al final
  especifica.sort((a, b) =>
    Number(CAMPOS_METADATOS.has(a.clave.toLowerCase())) - Number(CAMPOS_METADATOS.has(b.clave.toLowerCase())))
  return { basica, especifica }
}

// ─── Nombres de capa ────────────────────────────────────────────────────
// Los nombres técnicos llevan prefijo, fuente y año pegados
// («C04_Lim_Edo_2024_INEGI_2024»). Para el menú y la leyenda se quitan el
// prefijo y las siglas de la fuente (ya salen en la ficha técnica), se
// separan las palabras y se expanden las abreviaturas conocidas. El año del
// dato se conserva entre paréntesis. LAYER_ALIASES sigue mandando sobre esto.

/** Siglas de fuente o custodio: se retiran del nombre de la capa */
const FUENTES_CAPA = new Set([
  'INEGI', 'SCINCE', 'CONANP', 'CONABIO', 'CONAPO', 'SEDATU', 'ARTF', 'OPMATPG', 'SDA', 'SIC',
  'DENUE', 'CLUES', 'INEE', 'DFI', 'CNH', 'CENAPRED', 'NOAA', 'SEMABICCE', 'CONAGUA', 'FONATUR',
  'INPI', 'IMT', 'PEPGIRSSU', 'CENEGAS', 'GEOCOMUNES', 'FTM', 'SICM', 'ITER', 'OP', 'PG', 'CP',
])

/** Abreviaturas propias de los nombres de capa */
const TOKENS_CAPA: Record<string, string> = {
  lim: 'Límite',
  edo: 'Estatal',
  corr: 'Corrientes de',
  loc: 'Localidades',
  rfn: 'Red Ferroviaria Nacional',
  rfn25: 'de la Red Ferroviaria Nacional',
  tm: 'del Tren Maya',
  anp: 'Áreas Naturales Protegidas',
  rpt: 'Regiones Prioritarias Terrestres',
  advc: 'Áreas Destinadas Voluntariamente a la Conservación',
  ptar: 'Plantas de Tratamiento de Aguas Residuales',
  area: 'Área',
  rio: 'Río',
  bufer: 'Búfer',
}

/** Palabras que la entrega escribe sin acento (o con errata) */
const ACENTOS: Record<string, string> = {
  construccion: 'construcción', apicola: 'apícola', relacion: 'relación', gneral: 'general',
  cds: 'ciudades', conservacion: 'conservación', restauracion: 'restauración', proteccion: 'protección',
  reconversion: 'reconversión', captacion: 'captación', sustitucion: 'sustitución', ingenierias: 'ingenierías',
  preinversion: 'preinversión', energias: 'energías', energetico: 'energético', electrica: 'eléctrica',
  electricas: 'eléctricas', hopelchen: 'Hopelchén', ciclovia: 'ciclovía', hidroagricola: 'hidroagrícola',
  produccion: 'producción', solidos: 'sólidos', anidacion: 'anidación', transmision: 'transmisión',
  arqueologicas: 'arqueológicas', generacion: 'generación', concentracion: 'concentración',
  economica: 'económica', economicas: 'económicas', turisticos: 'turísticos', region: 'región',
  tecnologica: 'tecnológica', innovacion: 'innovación', asignacion: 'asignación', vulnerabilidad: 'vulnerabilidad',
  karst: 'karst', inmble: 'inmueble', disp: 'disposición', tec: 'tecnológica', mun: 'municipal',
  orden1: 'orden 1', orden3: 'orden 3', urb: 'urbana', est: 'estaciones',
}

/** Conectores que faltan entre palabras de la entrega */
const FRASES_CAPA: Array<[RegExp, string]> = [
  [/\bCuerpos Agua\b/gi, 'Cuerpos de agua'],
  [/\bModelo Ordenamiento\b/gi, 'Modelo de Ordenamiento'],
  [/\bCentros abasto\b/gi, 'Centros de abasto'],
  [/\bManejo integral residuos\b/gi, 'Manejo integral de residuos'],
  [/\bSitios Disposición Residuos\b/gi, 'Sitios de disposición de residuos'],
]

export function nombreCapaLegible(tecnico: string): string {
  const crudo = tecnico.replace(/^[cC]\d+_/, '')
  const partes = crudo
    .split(/_+/)
    .flatMap((p) => p.replace(/([a-záéíóúñ])([A-Z])/g, '$1 $2').split(' '))
    .filter(Boolean)

  let anio: string | null = null
  const palabras: string[] = []
  for (const p of partes) {
    if (/^(19|20)\d\d$/.test(p)) { anio ??= p; continue }
    // Fuente en mayúsculas, o en minúsculas cuando todo el nombre lo está
    if (FUENTES_CAPA.has(p.toUpperCase()) && (p === p.toUpperCase() || crudo === crudo.toLowerCase())) continue
    const k = p.toLowerCase()
    if (TOKENS_CAPA[k]) { palabras.push(TOKENS_CAPA[k]); continue }
    if (SIGLAS[p]) { palabras.push(SIGLAS[p]); continue }
    const acentuada = ACENTOS[k]
    if (acentuada) {
      palabras.push(p[0] === p[0].toUpperCase() ? acentuada.charAt(0).toUpperCase() + acentuada.slice(1) : acentuada)
      continue
    }
    // Siglas sin expansión conocida se dejan; lo demás conserva su caja
    palabras.push(p)
  }
  if (palabras.length === 0) return tecnico
  let texto = palabras.join(' ').replace(/\s+/g, ' ').trim()
  for (const [re, rep] of FRASES_CAPA) texto = texto.replace(re, rep)
  const capital = texto.charAt(0).toUpperCase() + texto.slice(1)
  return anio ? `${capital} (${anio})` : capital
}
