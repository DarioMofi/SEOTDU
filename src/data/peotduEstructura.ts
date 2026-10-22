// Estructura del PEOTDU Campeche 2023 (Periódico Oficial del Estado, 17 de junio de 2024).
//
// `pagina` es la página del PDF publicado (public/Instrumentos/PEOTDU-CAM-2023.pdf)
// donde inicia cada capítulo; se usa como ancla #page=N, que respetan los visores
// de PDF de Chrome, Edge y Firefox. Se obtuvo del índice del documento (página
// impresa + 17 de portada y preliminares) y se comprobó contra el PDF.
// `modulo` enlaza al geovisor cuando el capítulo tiene cartografía publicada.

export const PEOTDU_PDF_OFICIAL = '/Instrumentos/PEOTDU-CAM-2023.pdf'

// PROVISIONAL: la versión condensada aún no existe. Cuando se tenga, dejarla en
// public/Instrumentos/ y poner aquí su ruta; mientras sea null el botón se
// muestra deshabilitado como «Próximamente».
export const PEOTDU_PDF_CONDENSADA: string | null = null

export const PEOTDU_PORTADA = '/img/peotdu/portada-peotdu.png'

export const PEOTDU_PUNTOS: string[] = [
  'Establece el diagnóstico, las políticas, estrategias y proyectos prioritarios que orientan el ordenamiento territorial y el desarrollo urbano sustentable del estado. Se formula con base en estudios técnicos y mediante la participación de la ciudadanía, los municipios y las autoridades.',
  'Define instrumentos para su implementación, seguimiento y evaluación, y articula la coordinación entre los distintos órdenes de gobierno y sectores de la sociedad.',
  'Permite anticipar los retos del desarrollo urbano y ambiental bajo principios de conservación, bienestar, resiliencia y con la más amplia participación de la sociedad campechana.',
  'Establece la responsabilidad del Estado frente a las necesidades halladas y se traduce en un esfuerzo histórico, al ser el primer instrumento de escala estatal con el que contará el estado de Campeche.',
  'Es un instrumento de gobernanza que estimula el rendimiento del medio, de los espacios y las actividades económicas y sociales que se llevan a cabo en el territorio de Campeche. Sienta las bases, disposiciones y directrices que las autoridades municipales encargadas de la planeación deberán seguir y mantener de manera vinculante.',
]

export const PEOTDU_FASES_TEXTO =
  'La estructura del PEOTDU está integrada por 5 fases de desarrollo que integran 10 capítulos del documento, donde la primera corresponde a la fundamentación, que establece la metodología de elaboración, el marco jurídico y los instrumentos de planeación que sustentan el programa. La segunda comprende el diagnóstico integral, que incorpora el análisis ciudadano y territorial para identificar las dinámicas, problemáticas y potencialidades del Estado. La tercera desarrolla la prospectiva territorial, evaluando escenarios futuros y la aptitud del territorio como base para la construcción del Modelo de Ordenamiento Territorial (MOT) y Urbano. La cuarta define la estrategia de implementación, mediante la programación de inversiones, proyectos prioritarios e instrumentos de gestión. Finalmente, la quinta fase establece el seguimiento y evaluación, mediante indicadores que permiten monitorear el cumplimiento de los objetivos y facilitar la mejora continua del programa (SEDATU, 2023).'

export interface FasePeotdu {
  numero: number
  nombre: string
}

export const PEOTDU_FASES: FasePeotdu[] = [
  { numero: 1, nombre: 'Fundamentación' },
  { numero: 2, nombre: 'Diagnóstico integral' },
  { numero: 3, nombre: 'Prospectiva territorial' },
  { numero: 4, nombre: 'Estrategia de implementación' },
  { numero: 5, nombre: 'Seguimiento y evaluación' },
]

export interface CapituloPeotdu {
  numero: number
  romano: string
  titulo: string
  /** Nombre corto para la tabla de contenido */
  corto: string
  descripcion: string
  fase: number
  pagina: number
  modulo?: string
}

export const PEOTDU_CAPITULOS: CapituloPeotdu[] = [
  { numero: 1, romano: 'I', titulo: 'Introducción', corto: 'Introducción', fase: 1, pagina: 21,
    descripcion: 'Explica qué es el programa, por qué existe y cómo está organizado.' },
  { numero: 2, romano: 'II', titulo: 'Metodología', corto: 'Metodología', fase: 1, pagina: 23,
    descripcion: 'Cómo se elaboró el plan, qué enfoques se usaron y cómo participó la ciudadanía.' },
  { numero: 3, romano: 'III', titulo: 'Fundamentación jurídica', corto: 'Marco legal', fase: 1, pagina: 40,
    descripcion: 'Las leyes y normas internacionales, nacionales y estatales que respaldan el programa.' },
  { numero: 4, romano: 'IV', titulo: 'Diagnóstico ciudadano', corto: 'Diagnóstico ciudadano', fase: 2, pagina: 70,
    descripcion: 'Lo que la propia población de Campeche dijo que necesita y le preocupa.' },
  { numero: 5, romano: 'V', titulo: 'Diagnóstico del sistema territorial', corto: 'Diagnóstico territorial', fase: 2, pagina: 105,
    descripcion: 'El análisis técnico del estado actual del territorio: suelo, agua, ecosistemas, ciudades, economía.',
    modulo: 'ambiental' },
  { numero: 6, romano: 'VI', titulo: 'Análisis prospectivo y aptitud territorial', corto: 'Análisis prospectivo', fase: 3, pagina: 477,
    descripcion: 'Las proyecciones de crecimiento y los escenarios posibles de futuro.', modulo: 'aptitud' },
  { numero: 7, romano: 'VII', titulo: 'Modelo de ordenamiento territorial', corto: 'Modelo de Ordenamiento Territorial (MOT)', fase: 3, pagina: 499,
    descripcion: 'El corazón del plan: cómo se propone organizar el uso del territorio.', modulo: 'normatividad' },
  { numero: 8, romano: 'VIII', titulo: 'Matriz de programación de inversiones, corresponsabilidad de programas y proyectos', corto: 'Programación de inversiones', fase: 4, pagina: 608,
    descripcion: 'Qué obras y proyectos se proponen, cuánto cuestan y quién los financia.', modulo: 'infraestructura' },
  { numero: 9, romano: 'IX', titulo: 'Instrumentos', corto: 'Instrumentos', fase: 4, pagina: 668,
    descripcion: 'Las herramientas legales, fiscales y de gestión para que el plan se cumpla.' },
  { numero: 10, romano: 'X', titulo: 'Indicadores', corto: 'Sistema de evaluación y seguimiento', fase: 5, pagina: 674,
    descripcion: 'Cómo se va a medir si el plan está funcionando o no.' },
]
