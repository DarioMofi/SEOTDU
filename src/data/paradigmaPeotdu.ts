// Paradigma teórico-metodológico del PEOTDU (Ilustración 1 del programa,
// cap. II, apartado 2.2): siete subsistemas del sistema territorial, envueltos
// por el entorno, la cuenca y la transversalidad de los derechos humanos.
//
// PROVISIONAL: la agrupación de los subsistemas en tres dimensiones
// (Estructura, Desarrollo y Gobernanza territorial) es una propuesta de diseño
// para el onboarding; el PEOTDU no la formula así. Se acordó usarla mientras
// no exista una versión oficial; cambiarla es editar `dimension` aquí.

import { assetUrl } from '../lib/assetUrl'

export type DimensionId = 'estructura' | 'desarrollo' | 'gobernanza'
export type SubsistemaId =
  | 'fisico-natural' | 'urbano-rural' | 'movilidad'
  | 'economico' | 'patrimonio' | 'sociodemografico'
  | 'institucional'
export type Vista = 'desempeno' | 'estrategia'

export interface Dimension {
  id: DimensionId
  nombre: string
  color: string
  explicacion: string
}

export interface Subsistema {
  id: SubsistemaId
  nombre: string
  dimension: DimensionId
  /** Módulo (monitor) del geovisor que agrupa al subsistema */
  modulo: string
  /** Nombre del monitor en la página de inicio */
  monitor: string
  /**
   * Módulo donde viven sus INSUMOS (Desempeño territorial). Solo difiere en
   * Institucionalidad y gobernanza: sus capas de diagnóstico publicadas
   * (franjas de seguridad, restricciones, equipamiento administrativo) están
   * en Infraestructura, mientras su salida es el MOT.
   */
  moduloInsumos?: string
  descripcion: string
}

export const DIMENSIONES: Dimension[] = [
  {
    id: 'estructura',
    nombre: 'Estructura territorial',
    color: '#2E8C8A',
    explicacion:
      'El soporte físico y funcional del territorio: el medio natural, el sistema urbano-rural y la movilidad que los conecta. Define dónde y cómo puede ocuparse el territorio.',
  },
  {
    id: 'desarrollo',
    nombre: 'Desarrollo territorial',
    color: '#2C5D86',
    explicacion:
      'Las personas y sus oportunidades: población, actividad económica y patrimonio cultural y biocultural. Orienta para quién y para qué se planea el territorio.',
  },
  {
    id: 'gobernanza',
    nombre: 'Gobernanza territorial',
    color: '#D2873A',
    explicacion:
      'Asegura la coordinación entre actores —gobierno, sociedad y sector privado— para dar viabilidad política y legal a las estrategias del PEOTDU.',
  },
]

// El orden es el del círculo, en sentido horario desde arriba: cada dimensión
// ocupa un arco continuo.
export const SUBSISTEMAS: Subsistema[] = [
  { id: 'fisico-natural', nombre: 'Físico natural', dimension: 'estructura', modulo: 'ambiental', monitor: 'Ambiental',
    descripcion: 'Relieve, suelos, clima, agua, vegetación, biodiversidad y riesgos ambientales del estado.' },
  { id: 'urbano-rural', nombre: 'Urbano-rural', dimension: 'estructura', modulo: 'infraestructura', monitor: 'Infraestructura',
    descripcion: 'Sistema de ciudades y localidades, servicios, infraestructura y logística que las sostienen.' },
  { id: 'movilidad', nombre: 'Movilidad', dimension: 'estructura', modulo: 'infraestructura', monitor: 'Infraestructura',
    descripcion: 'Red carretera, transporte público, movilidad activa y accesibilidad a servicios básicos.' },
  { id: 'economico', nombre: 'Económico', dimension: 'desarrollo', modulo: 'aptitud', monitor: 'Económico',
    descripcion: 'Estructura económica, vocaciones productivas, empleo y turismo.' },
  { id: 'patrimonio', nombre: 'Patrimonio cultural, natural y biocultural', dimension: 'desarrollo', modulo: 'social', monitor: 'Social',
    descripcion: 'Pueblos originarios, patrimonio tangible e inmaterial y su relación con el territorio.' },
  { id: 'sociodemografico', nombre: 'Sociodemográfico', dimension: 'desarrollo', modulo: 'social', monitor: 'Social',
    descripcion: 'Dinámica poblacional, marginación, vivienda, equipamiento y servicios básicos.' },
  { id: 'institucional', nombre: 'Institucionalidad y gobernanza', dimension: 'gobernanza', modulo: 'normatividad', monitor: 'Gobernanza (MOT)', moduloInsumos: 'infraestructura',
    descripcion: 'Estructura agraria, participación ciudadana, capacidades administrativas y el Modelo de Ordenamiento Territorial.' },
]

export const ANILLOS = [
  { id: 'subsistema', nombre: 'Subsistema territorial',
    explicacion: 'Los siete subsistemas se analizan en sus relaciones e interdependencias (planeación sistémica-estratégica).' },
  { id: 'entorno', nombre: 'Entorno',
    explicacion: 'Enfoque multiescalar: Campeche en relación con las entidades vecinas y la región Sur-Sureste.' },
  { id: 'cuenca', nombre: 'Cuenca',
    explicacion: 'Enfoque de cuenca: la relación del territorio con su cuenca y los servicios ecosistémicos que provee.' },
  { id: 'derechos', nombre: 'Derechos humanos e interseccionalidad',
    explicacion: 'Desarrollo de abajo hacia arriba: derechos humanos, perspectiva de género y énfasis en grupos vulnerables en todas las etapas.' },
] as const

export const VISTAS: Record<Vista, { nombre: string; lado: string; explicacion: string }> = {
  desempeno: {
    nombre: 'Desempeño territorial',
    lado: 'Insumos',
    explicacion: 'El estado encontrado: diagnóstico, datos y mapas del territorio (2024).',
  },
  estrategia: {
    nombre: 'Estrategia territorial',
    lado: 'Salidas',
    explicacion: 'El futuro propuesto: estrategias, proyecciones, proyectos y la nueva estructura territorial.',
  },
}

export const dimensionDe = (id: DimensionId) => DIMENSIONES.find((d) => d.id === id)!

/** Módulo del geovisor según la vista: los insumos de un subsistema pueden vivir en otro monitor */
export const moduloDeSubsistema = (s: Subsistema, vista: Vista) =>
  vista === 'desempeno' ? (s.moduloInsumos ?? s.modulo) : s.modulo

// ─── Larguillo de insumos ──────────────────────────────────────────────────
// Siete fachadas (src/assets/larguillo-subsistemas, copia de public/Larguillo_2)
// = siete subsistemas, agrupados por monitor: las casas de un mismo monitor
// quedan contiguas. Institucionalidad y gobernanza va con el MOT (Gobernanza).

export interface MonitorInsumos {
  modulo: string
  nombre: string
  /** Color del monitor (el mismo del larguillo de monitores) */
  color: string
  /** Texto legible sobre ese color */
  tinta: string
  subsistemas: SubsistemaId[]
}

export const MONITORES_INSUMOS: MonitorInsumos[] = [
  { modulo: 'ambiental', nombre: 'Monitor Ambiental', color: '#77923B', tinta: '#FFFFFF', subsistemas: ['fisico-natural'] },
  { modulo: 'social', nombre: 'Monitor Social', color: '#006FC0', tinta: '#FFFFFF', subsistemas: ['sociodemografico', 'patrimonio'] },
  { modulo: 'infraestructura', nombre: 'Monitor Infraestructura', color: '#C00000', tinta: '#FFFFFF', subsistemas: ['urbano-rural', 'movilidad'] },
  { modulo: 'aptitud', nombre: 'Monitor Económico', color: '#FFC000', tinta: '#3A2E00', subsistemas: ['economico'] },
  { modulo: 'normatividad', nombre: 'Monitor de Gobernanza (MOT)', color: '#1C334E', tinta: '#FFFFFF', subsistemas: ['institucional'] },
]

/**
 * Orden único de los monitores: larguillo de subsistemas, larguillo de
 * monitores y cajas del geovisor siguen esta secuencia.
 */
export const ORDEN_MONITORES = MONITORES_INSUMOS.map((m) => m.modulo)

// Las fachadas pasan por el bundler y no por public/: el servidor de
// desarrollo ignora public/ en su watcher (vite.config.ts), así que una imagen
// agregada ahí con el servidor encendido no se sirve hasta reiniciarlo.
// Importadas, aparecen al instante y en producción salen con hash de caché.
const IMAGENES_FACHADA = import.meta.glob<string>('../assets/larguillo-subsistemas/*SoloCasa.png', {
  eager: true,
  import: 'default',
})
const imagenFachada = (n: number) =>
  IMAGENES_FACHADA[`../assets/larguillo-subsistemas/${n}SoloCasa.png`] ?? assetUrl(`/Larguillo_2/${n}SoloCasa.png`)

// Cada subsistema conserva su fachada aunque cambie el orden de la calle
const NUMERO_FACHADA: Record<SubsistemaId, number> = {
  'fisico-natural': 1, 'urbano-rural': 2, movilidad: 3, economico: 4,
  sociodemografico: 5, patrimonio: 6, institucional: 7,
}

/** Fachada de cada subsistema, en el orden de la calle */
export const FACHADAS: { subsistema: SubsistemaId; img: string }[] = MONITORES_INSUMOS
  .flatMap((m) => m.subsistemas)
  .map((subsistema) => ({ subsistema, img: imagenFachada(NUMERO_FACHADA[subsistema]) }))
