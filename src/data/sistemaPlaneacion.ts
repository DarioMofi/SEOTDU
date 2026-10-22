// Instrumentos del sistema de planeación territorial y su vinculación jurídica.
//
// Metodología de la vinculación (se muestra al usuario tal cual):
// - Fundamento: ley y artículo que crean o regulan al instrumento.
// - Congruencia: instrumentos de jerarquía superior con los que debe alinearse
//   (LGAHOTDU, arts. 23, 28 y 29, fracc. I y II; art. 40).
// - Orienta: instrumentos que se derivan de él o que debe guiar.
// Las tres relaciones salen de estos datos; la tarjeta de la pirámide y la
// matriz completa se calculan de aquí, no de tablas paralelas.
//
// PROVISIONAL: los enlaces abren la ley completa. Anclar al artículo exacto
// exige un documento con anclas (HTML o PDF con marcadores); la versión de la
// Cámara de Diputados es un PDF sin ellos. Cambiar `url` aquí basta.

export type OrdenGobierno = 'Federal' | 'Estatal' | 'Municipal'

export const ORDEN_COLORES: Record<OrdenGobierno, string> = {
  Federal: '#235B4E',
  Estatal: '#9F2241',
  Municipal: '#BC955B',
}

export type LeyId = 'CPEUM' | 'LP' | 'LGAHOTDU' | 'LGEEPA' | 'LGMSV'

export const LEYES: Record<LeyId, { nombre: string; siglas: string; url: string }> = {
  CPEUM: {
    siglas: 'CPEUM',
    nombre: 'Constitución Política de los Estados Unidos Mexicanos',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf',
  },
  LP: {
    siglas: 'LP',
    nombre: 'Ley de Planeación',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LPlan.pdf',
  },
  LGAHOTDU: {
    siglas: 'LGAHOTDU',
    nombre: 'Ley General de Asentamientos Humanos, Ordenamiento Territorial y Desarrollo Urbano',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGAHOTDU.pdf',
  },
  LGEEPA: {
    siglas: 'LGEEPA',
    nombre: 'Ley General del Equilibrio Ecológico y la Protección al Ambiente',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGEEPA.pdf',
  },
  LGMSV: {
    siglas: 'LGMSV',
    nombre: 'Ley General de Movilidad y Seguridad Vial',
    url: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LGMSV.pdf',
  },
}

/** Instrumentos de referencia que no son escalones de la pirámide */
export const INSTRUMENTOS_EXTERNOS = {
  PND: 'Plan Nacional de Desarrollo',
  PED: 'Plan Estatal de Desarrollo',
  POE: 'Programas de Ordenamiento Ecológico',
} as const
export type ExternoId = keyof typeof INSTRUMENTOS_EXTERNOS

export interface Fundamento {
  ley: LeyId
  articulo: string
}

export interface PyramidTier {
  id: number
  number: string
  /** Sigla corta para diagramas y matriz */
  sigla: string
  title: string
  level: string
  orden: OrdenGobierno
  widthPercent: number // 100% arriba -> 60% abajo
  bgColor: string
  textColor: string
  description: string
  fundamento: Fundamento[]
  /** Fundamento sin artículo confirmado: se muestra como pendiente */
  fundamentoPendiente?: string
  congruencia: (number | ExternoId)[]
  orienta: number[]
  orientaTexto?: string
}

export const PYRAMID_TIERS: PyramidTier[] = [
  {
    id: 1, number: '01', sigla: 'ENOT',
    title: 'Estrategia Nacional de Ordenamiento Territorial 2021-2024 (ENOT)',
    level: 'Nacional Rector', orden: 'Federal', widthPercent: 100,
    bgColor: '#E8E2D5', textColor: '#2B2317',
    description:
      'Configura la dimensión espacial del desarrollo del país en el mediano y largo plazo. Establece el marco básico de referencia y congruencia territorial con el Plan Nacional de Desarrollo y los programas sectoriales y regionales, y promueve la utilización racional del territorio y el desarrollo equilibrado del país, con una visión de largo plazo que se revisa periódicamente.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. I y 24' }, { ley: 'CPEUM', articulo: '26 y 27' }, { ley: 'LP', articulo: '3' }],
    congruencia: ['PND'],
    orienta: [2, 3],
  },
  {
    id: 2, number: '02', sigla: 'PNOTDU',
    title: 'Programa Nacional de Ordenamiento Territorial y Desarrollo Urbano (PNOTDU) 2026-2030',
    level: 'Nacional Sectorial', orden: 'Federal', widthPercent: 96,
    bgColor: '#DFD8CB', textColor: '#2B2317',
    description:
      'Se sujeta a las previsiones del Plan Nacional de Desarrollo y de la Estrategia Nacional. Contiene el diagnóstico del ordenamiento territorial y el desarrollo urbano del país, sus políticas, objetivos y lineamientos estratégicos, la estructura de los sistemas urbanos y rurales, y las orientaciones para el desarrollo sustentable de las regiones en función de sus recursos naturales y actividades productivas.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '26' }, { ley: 'LP', articulo: '22' }],
    congruencia: ['PND', 1],
    orienta: [3, 5],
  },
  {
    id: 3, number: '03', sigla: 'PEOTDU',
    title: 'Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano (PEOTDU)',
    level: 'Estatal Rector', orden: 'Estatal', widthPercent: 92,
    bgColor: '#C7BBA5', textColor: '#251E13',
    description:
      'Instrumento rector del Estado. Lo aprueban, ejecutan, controlan, evalúan y modifican las autoridades locales. Debe contener el análisis de la situación y sus tendencias, las estrategias de mediano y largo plazo, las acciones y proyectos estratégicos, las metas y mecanismos de evaluación, los instrumentos para su ejecución y la congruencia con el atlas nacional de riesgos. Sus directrices son vinculantes para los 13 municipios.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. II; 28 a 30' }, { ley: 'LGEEPA', articulo: '20 bis 2' }, { ley: 'LGMSV', articulo: '1' }],
    congruencia: [1, 2, 'PED', 'POE'],
    orienta: [4, 5, 6, 7],
  },
  {
    id: 4, number: '04', sigla: 'PR',
    title: 'Programas Regionales de Desarrollo Urbano',
    level: 'Regional', orden: 'Estatal', widthPercent: 88,
    bgColor: '#B1A187', textColor: '#1C1710',
    description:
      'Coordinan el ordenamiento de dos o más municipios que comparten cuencas, dinámicas socioeconómicas o corredores de infraestructura estratégica. Traducen las directrices del PEOTDU a una escala intermedia entre el Estado y los municipios.',
    fundamento: [],
    fundamentoPendiente: 'Legislación estatal de desarrollo urbano (artículo por confirmar)',
    congruencia: [3, 'PED'],
    orienta: [7],
  },
  {
    id: 5, number: '05', sigla: 'PZM',
    title: 'Programas de Zonas Metropolitanas o Conurbaciones',
    level: 'Metropolitano', orden: 'Estatal', widthPercent: 84,
    bgColor: '#9A896B', textColor: '#FFFFFF',
    description:
      'Cuando centros urbanos de dos o más municipios forman una continuidad física y demográfica, los órdenes de gobierno planean y regulan su desarrollo de manera conjunta. Atienden las materias de interés metropolitano: suelo y reservas territoriales, movilidad, agua, infraestructura y equipamiento, riesgos y medio ambiente.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. III; 31 a 36' }, { ley: 'CPEUM', articulo: '115, fr. VI' }],
    congruencia: [2, 3],
    orienta: [7, 8],
  },
  {
    id: 6, number: '06', sigla: 'PS',
    title: 'Programa Sectorial de Ordenamiento Territorial, Desarrollo Urbano y Movilidad',
    level: 'Sectorial', orden: 'Estatal', widthPercent: 80,
    bgColor: '#847353', textColor: '#FFFFFF',
    description:
      'Programa derivado que alinea la política territorial con sectores específicos —movilidad, vivienda, infraestructura y desarrollo productivo— para que la inversión sectorial siga las directrices del ordenamiento territorial.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. V' }, { ley: 'LGMSV', articulo: '1, fr. VI' }, { ley: 'LP', articulo: '22' }],
    congruencia: [3, 'PED'],
    orienta: [7, 8],
  },
  {
    id: 7, number: '07', sigla: 'PMDU',
    title: 'Programas Municipales de Desarrollo Urbano (PMDU)',
    level: 'Municipal', orden: 'Municipal', widthPercent: 75,
    bgColor: '#736243', textColor: '#FFFFFF',
    description:
      'Señalan las acciones específicas para la conservación, mejoramiento y crecimiento de los centros de población y establecen la zonificación correspondiente: usos de suelo permitidos, reservas, destinos y áreas no urbanizables del municipio.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. IV; 40' }, { ley: 'CPEUM', articulo: '115, fr. V' }],
    congruencia: [3, 5, 'POE'],
    orienta: [8, 9],
  },
  {
    id: 8, number: '08', sigla: 'PDUCP',
    title: 'Programas de Desarrollo Urbano de Centros de Población (PDUCP)',
    level: 'Centro de Población', orden: 'Municipal', widthPercent: 70,
    bgColor: '#544632', textColor: '#FFFFFF',
    description:
      'Programas derivados que detallan, para cada ciudad o localidad, la zonificación secundaria, densidades, estructura vial y equipamiento, en congruencia con el programa municipal.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. V; 40' }],
    congruencia: [7],
    orienta: [9, 10],
  },
  {
    id: 9, number: '09', sigla: 'PP',
    title: 'Programas Parciales de Desarrollo Urbano',
    level: 'Parcial', orden: 'Municipal', widthPercent: 65,
    bgColor: '#423625', textColor: '#FFFFFF',
    description:
      'El Estado y los municipios promueven su elaboración para llevar a cabo acciones específicas de crecimiento, mejoramiento y conservación en zonas determinadas —centros históricos, barrios, zonas de regeneración— y para la formación de conjuntos urbanos y barrios integrales.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '23, fr. V; 41' }],
    congruencia: [7, 8],
    orienta: [10],
  },
  {
    id: 10, number: '10', sigla: 'PA',
    title: 'Polígonos de Actuación',
    level: 'Local Operativo', orden: 'Municipal', widthPercent: 60,
    bgColor: '#352B1D', textColor: '#FFFFFF',
    description:
      'Delimitaciones operativas que permiten ejecutar acciones específicas en el suelo: proyectos urbanos público-privados, relotificación, reagrupamiento parcelario y transferencia de potencialidades de desarrollo.',
    fundamento: [{ ley: 'LGAHOTDU', articulo: '41' }],
    congruencia: [8, 9],
    orienta: [],
    orientaTexto: 'Acciones, obras y proyectos específicos',
  },
]

export const tierById = (id: number) => PYRAMID_TIERS.find((t) => t.id === id)

/** Sigla corta (chips y matriz); el nombre completo va en `tituloReferencia` */
export const nombreReferencia = (ref: number | ExternoId) =>
  typeof ref === 'number' ? tierById(ref)?.sigla ?? String(ref) : ref

export const tituloReferencia = (ref: number | ExternoId) =>
  typeof ref === 'number' ? tierById(ref)?.title ?? String(ref) : INSTRUMENTOS_EXTERNOS[ref]
