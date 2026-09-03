import { useState, useEffect, useLayoutEffect, useRef } from 'react'

interface Layer {
  id: string
  label: string
  desc: string
  simbologia?: any
  isFixed?: boolean
}

/** Varias capas que el menú maneja como una sola entrada. */
interface LayerGroup {
  id: string
  label: string
  layers: string[]
}

interface Module {
  id: string
  title: string
  icon: React.ReactNode
  colorClass: string
  themeColor: string
  themeBg: string
  themeHover: string
  layers: Layer[]
  /** Capas que se encienden al activar el módulo. Sin lista, se encienden todas. */
  defaultLayers?: string[]
  groups?: LayerGroup[]
  /** Solo el MOT: agrupa sus capas en Estrategia → Línea estratégica. */
  arbol?: { label: string; lineas: { label: string; layers: string[] }[] }[]
}

/**
 * Una fila del menú: o una capa suelta, o un grupo. El resto del componente
 * trabaja contra esto y no contra capas, así que un grupo se prende, se apaga,
 * se reordena y cambia de opacidad como una unidad.
 */
interface Entrada {
  key: string
  label: string
  desc: string
  /** Capas que controla. Una sola cuando no es grupo. */
  ids: string[]
  esGrupo: boolean
}

import { appConfig } from '../../config/appConfig'
import { getCapasDisponibles, getEstiloModulo } from '../../lib/cartografia'

function getModuleIcon(iconName: string) {
  switch(iconName) {
    case 'mapa_base':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
          <line x1="8" y1="2" x2="8" y2="18"></line>
          <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
      )
    case 'ambiental':
      return (
        <svg className="w-5 h-5" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M216-176q-45-45-70.5-104T120-402q0-63 24-124.5T222-642q35-35 86.5-60t122-39.5Q501-756 591.5-759t202.5 7q8 106 5 195t-16.5 160.5q-13.5 71.5-38 125T684-182q-53 53-112.5 77.5T450-80q-65 0-127-25.5T216-176Zm112-16q29 17 59.5 24.5T450-160q46 0 91-18.5t86-59.5q18-18 36.5-50.5t32-85Q709-426 716-500.5t2-177.5q-49-2-110.5-1.5T485-670q-61 9-116 29t-90 55q-45 45-62 89t-17 85q0 59 22.5 103.5T262-246q42-80 111-153.5T534-520q-72 63-125.5 142.5T328-192Zm0 0Zm0 0Z" />
        </svg>
      )
    case 'social':
      return (
        <svg className="w-5 h-5" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" />
        </svg>
      )
    case 'infraestructura':
      return (
        <svg className="w-5 h-5" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M247-167q-47-47-47-113v-327q-35-13-57.5-43.5T120-720q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 69.5T280-607v327q0 33 23.5 56.5T360-200q33 0 56.5-23.5T440-280v-400q0-66 47-113t113-47q66 0 113 47t47 113v327q35 13 57.5 43.5T840-240q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-327q0-33-23.5-56.5T600-760q-33 0-56.5 23.5T520-680v400q0 66-47 113t-113 47q-66 0-113-47Zm-7-513q17 0 28.5-11.5T280-720q0-17-11.5-28.5T240-760q-17 0-28.5 11.5T200-720q0 17 11.5 28.5T240-680Zm480 480q17 0 28.5-11.5T760-240q0-17-11.5-28.5T720-280q-17 0-28.5 11.5T680-240q0 17 11.5 28.5T720-200ZM240-720Zm480 480Z" />
        </svg>
      )
    case 'aptitud':
      return (
        <svg className="w-5 h-5" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
        </svg>
      )
    case 'normatividad':
      return (
        <svg className="w-5 h-5" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z" />
        </svg>
      )
    default:
      return <div />
  }
}

interface StyleNode {
  tipo: string
  nombre: string
  capas?: StyleNode[]
  simbologia?: any
}

/**
 * El volcado nuevo de QGIS es plano —`{modulo, total_capas, capas[]}`— en vez
 * del árbol de grupos del viejo, y cada capa declara su `nombre_tabla`, que es
 * exactamente el nombre del GeoJSON. Eso elimina la adivinación de nombres que
 * hace falta con el formato viejo.
 */
function esFormatoNuevo(json: any): boolean {
  return Array.isArray(json?.capas) && typeof json?.modulo === 'string'
}

/**
 * Compara ids entre las dos generaciones de cartografía: el volcado de QGIS
 * conserva el nombre original (`C04_Lim_Edo_2024_INEGI_2024`) y la entrega
 * nueva lo bajó a minúscula y sin acentos. Misma normalización que usa
 * `cartografia.ts` para resolver la URL del GeoJSON.
 */
function norm(id: string): string {
  return id
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Aplica los ajustes de `appConfig.STYLE_OVERRIDES` a la simbología de una capa.
 *
 * Se hace aquí, sobre el volcado ya leído, para no tocar el archivo exportado
 * de QGIS: ese se regenera y perdería los cambios. Trabaja sobre una copia.
 */
function aplicarAjustes(id: string, simbologia: any): any {
  const ajuste = appConfig.STYLE_OVERRIDES[id]
  if (!ajuste || !simbologia) return simbologia
  let s = structuredClone(simbologia)

  if (ajuste.colorPlano) {
    // Se descarta la clasificación entera: un solo símbolo para toda la capa,
    // tomando el de la primera clase como base para conservar trazo y forma.
    const base = s.categorias?.[0]?.simbolo ?? s.rangos?.[0]?.simbolo ?? s.simbolo_unico
    if (base) {
      for (const capa of base.capas_simbolo ?? []) {
        const props = capa.props ?? capa.propiedades
        if (props?.color) props.color = `${ajuste.colorPlano},255`
      }
      s = { tipo: 'singleSymbol', campo: null, simbolo_unico: base }
    }
  }

  if (ajuste.svgMarcador || ajuste.colorSvg || ajuste.colorContornoSvg) {
    const ponerSvg = (nodo: any): void => {
      if (Array.isArray(nodo)) return nodo.forEach(ponerSvg)
      if (!nodo || typeof nodo !== 'object') return
      const props = nodo.props ?? nodo.propiedades
      if ((nodo.clase ?? nodo.tipo) === 'QgsSvgMarkerSymbolLayer' && props) {
        if (ajuste.svgMarcador) props.name = ajuste.svgMarcador
        if (ajuste.colorSvg) props.color = `${ajuste.colorSvg},255`
        if (ajuste.colorContornoSvg) props.outline_color = `${ajuste.colorContornoSvg},255`
      }
      Object.values(nodo).forEach(ponerSvg)
    }
    ponerSvg(s)
  }

  if (ajuste.categoriasVisibles) {
    // Apagar la clase es el mecanismo propio de QGIS: `resolveSymbol` no la
    // dibuja y `resolveLegend` no la lista, sin tocar ninguno de los dos.
    for (const categoria of s.categorias ?? []) {
      categoria.activo = ajuste.categoriasVisibles.includes(String(categoria.valor))
    }
  }

  if (ajuste.escalaPunto) {
    const escalar = (nodo: any): void => {
      if (Array.isArray(nodo)) return nodo.forEach(escalar)
      if (!nodo || typeof nodo !== 'object') return
      const props = nodo.props ?? nodo.propiedades
      if (props?.size) props.size = String(Number(props.size) * ajuste.escalaPunto!)
      Object.values(nodo).forEach(escalar)
    }
    escalar(s)
  }

  return s
}

function extractLayersFromNewStyle(json: any, availableLayers: string[]): Layer[] {
  return (json.capas as any[]).flatMap((capa) => {
    // Los rásteres del proyecto QGIS (mapas base de Carto) no son capas
    // vectoriales del visor: no tienen GeoJSON ni pila de símbolos.
    if (capa?.tipo === 'raster') return []

    // `nombre_tabla` debería ser el nombre real de la tabla, pero en el módulo
    // Mapa Base el volcado nuevo pone ahí el nombre del árbol de QGIS, que va
    // sin el prefijo `C04_`. Se prueba el prefijo antes de descartar la capa.
    const bruto = capa?.nombre_tabla || capa?.nombre
    if (!bruto) return []
    const declarado = appConfig.TABLE_ALIASES[bruto] ?? bruto
    const id = availableLayers.includes(declarado)
      ? declarado
      : availableLayers.includes(`C04_${declarado}`)
        ? `C04_${declarado}`
        : // La entrega nueva trae el mismo id en minúscula.
          (availableLayers.find((a) => norm(a) === norm(declarado)) ?? declarado)
    if (availableLayers.length > 0 && !availableLayers.includes(id)) return []
    if (appConfig.EXCLUDED_LAYERS.includes(id)) return []

    const cleanLabel = String(capa.nombre ?? id).replace(/^C\d+_/, '').replace(/_/g, ' ')
    return [{
      id,
      label: appConfig.LAYER_ALIASES[id] || cleanLabel,
      desc: 'Capa dinámica',
      simbologia: aplicarAjustes(id, capa.simbologia),
      isFixed: appConfig.FIXED_LAYERS.includes(id)
    }]
  })
}

function extractLayersFromStyle(node: StyleNode, availableLayers: string[] = []): Layer[] {
  let result: Layer[] = []
  if (node.tipo === 'capa') {
    // Resolver la id real que coincide con el archivo GeoJSON disponible
    let realId = appConfig.TABLE_ALIASES[node.nombre] ?? node.nombre
    if (availableLayers.length > 0) {
      if (availableLayers.includes(realId)) {
        // ya resuelto por alias o por coincidencia exacta
      } else if (availableLayers.includes(node.nombre)) {
        realId = node.nombre
      } else if (availableLayers.includes(`C04_${node.nombre}`)) {
        realId = `C04_${node.nombre}`
      } else {
        const matched = availableLayers.find(avail => 
          avail.toLowerCase().endsWith(node.nombre.toLowerCase()) || 
          node.nombre.toLowerCase().endsWith(avail.toLowerCase())
        )
        if (matched) realId = matched
      }
    }

    // Identificar capas fijas
    const isFixed = appConfig.FIXED_LAYERS.includes(realId) || appConfig.FIXED_LAYERS.includes(node.nombre)

    // Formatear etiqueta limpia para la UI y aplicar ALIAS de configuración si existe
    const cleanLabel = node.nombre.replace(/^C\d+_/, '').replace(/_/g, ' ')
    const label = appConfig.LAYER_ALIASES[realId] || appConfig.LAYER_ALIASES[node.nombre] || cleanLabel
    
    result.push({
      id: realId,
      label,
      desc: 'Capa dinámica',
      simbologia: node.simbologia,
      isFixed
    })
  } else if (node.tipo === 'grupo' && node.capas) {
    for (const child of node.capas) {
      result = result.concat(extractLayersFromStyle(child, availableLayers))
    }
  }
  return result
}

/** Una línea estratégica: el nivel más hondo del árbol, el que ya trae capas. */
interface Linea {
  label: string
  layers: string[]
}

/** Una estrategia: agrupa líneas. */
interface Estrategia {
  label: string
  lineas: Linea[]
}

interface ModuleConfig {
  stylesFrom?: string[]
  defaultLayers?: string[]
  groups?: LayerGroup[]
  arbol?: Estrategia[]
  fuentesDeCapas?: string[]
}

/**
 * Reacomoda `ids` para que las capas de un mismo grupo queden contiguas, en la
 * posición de la primera de ellas.
 *
 * Hace falta porque el grupo es una sola fila del menú: si sus capas siguieran
 * dispersas en la pila, las flechas de orden no tendrían un significado claro.
 * El bloque hereda la prioridad más alta que tenía cualquiera de sus capas y
 * conserva el orden relativo del árbol de QGIS, así que lo único que cambia es
 * que las capas del grupo se juntan.
 */
function agruparContiguas(ids: string[], groups: LayerGroup[] = []): string[] {
  if (groups.length === 0) return ids

  const grupoDe = new Map<string, LayerGroup>()
  for (const g of groups) for (const id of g.layers) grupoDe.set(id, g)

  const salida: string[] = []
  const puestos = new Set<string>()
  for (const id of ids) {
    if (puestos.has(id)) continue
    const grupo = grupoDe.get(id)
    if (!grupo) {
      salida.push(id)
      puestos.add(id)
      continue
    }
    for (const miembro of ids.filter((x) => grupoDe.get(x) === grupo)) {
      salida.push(miembro)
      puestos.add(miembro)
    }
  }
  return salida
}

/** Lee un volcado en cualquiera de los dos formatos y devuelve sus capas con datos. */
function leerEstilo(json: any, availableLayers: string[]): Layer[] {
  return esFormatoNuevo(json)
    ? extractLayersFromNewStyle(json, availableLayers)
    : extractLayersFromStyle(json as StyleNode, availableLayers).filter(
        (l) => availableLayers.length === 0 || availableLayers.includes(l.id)
      )
}

interface Props {
  activeLayers: string[]
  onChangeLayers: (layers: string[]) => void
  initialModule?: string | null
  layerOpacity: Record<string, number>
  onChangeOpacity: (layerId: string, opacity: number) => void
  layerOrder: string[]
  onChangeOrder: (order: string[]) => void
  /** Emite la simbología y las etiquetas de todas las capas, indexadas por id. */
  onStylesLoaded?: (styles: Record<string, any>, labels: Record<string, string>) => void
  onInfoClick?: (entrada: Entrada) => void
  onActiveModuleChange?: (title: string) => void
}

export default function ModuleLayerSelector({
  activeLayers,
  onChangeLayers,
  initialModule,
  layerOpacity,
  onChangeOpacity,
  layerOrder,
  onChangeOrder,
  onStylesLoaded,
  onInfoClick,
  onActiveModuleChange
}: Props) {
  // Módulo activo: sus capas son las que están dibujadas. Solo uno a la vez.
  // Es independiente del acordeón, que arranca cerrado.
  const [activeModule, setActiveModule] = useState<string>(initialModule ?? appConfig.DEFAULT_MODULE)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  /* Secciones abiertas del árbol (MOT). La clave es la ruta completa, así una
     línea de E1 y otra de E4 con el mismo nombre no se abren juntas. */
  const [ramasAbiertas, setRamasAbiertas] = useState<string[]>([])
  const alternarRama = (clave: string) =>
    setRamasAbiertas((prev) =>
      prev.includes(clave) ? prev.filter((c) => c !== clave) : [...prev, clave]
    )

  const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const prevPositions = useRef<Map<string, number>>(new Map())

  /**
   * Capas que se encienden al activar un módulo: las declaradas en
   * `defaultLayers` que además tengan datos, o todas si no hay lista.
   *
   * El orden sale del árbol de QGIS (`module.layers`), no del orden en que se
   * escribió la configuración: la primera capa del árbol se dibuja encima.
   */
  const capasEncendidas = (modulo: Module): string[] => {
    const ids = agruparContiguas(modulo.layers.map((l) => l.id), modulo.groups)
    if (!modulo.defaultLayers) return ids
    const encendidas = modulo.defaultLayers
    return ids.filter((id) => encendidas.includes(id))
  }

  // Cargar las capas dinámicamente desde los archivos JSON
  useEffect(() => {
    async function fetchModules() {
      let availableLayers: string[] = []
      try {
        availableLayers = await getCapasDisponibles()
      } catch (e) {
        console.error('No se pudo cargar la lista de capas disponibles', e)
      }

      const allStyles: Record<string, any> = {}
      const allLabels: Record<string, string> = {}

      const loadedModules = await Promise.all(
        appConfig.MODULES_CONFIG.map(async (modConfig) => {
          try {
            const json = await getEstiloModulo(modConfig.file)
            let extractedLayers = leerEstilo(json, availableLayers)

            // `stylesFrom` deja que un volcado aporte el árbol y el orden de
            // dibujo mientras otro conserva la simbología. Sirve para ampliar un
            // módulo con capas nuevas sin perder el detalle de las que ya
            // estaban: el volcado nuevo trae más capas, pero dejó de exportar la
            // forma del marcador, el desplazamiento y el ángulo.
            for (const archivo of (modConfig as ModuleConfig).stylesFrom ?? []) {
              try {
                const altJson = await getEstiloModulo(archivo)
                const preferida = new Map(
                  leerEstilo(altJson, availableLayers).map((l) => [l.id, l.simbologia])
                )
                extractedLayers = extractedLayers.map((l) =>
                  preferida.has(l.id) ? { ...l, simbologia: preferida.get(l.id) } : l
                )
              } catch (e) {
                console.error(`No se pudo leer la simbología preferida ${archivo}`, e)
              }
            }


            // Un módulo con árbol reúne capas que viven en otros monitores:
            // se agregan aquí, tomando su simbología de `fuentesDeCapas`.
            const arbol = (modConfig as ModuleConfig).arbol
            if (arbol) {
              // El árbol nombra las capas con el id del catálogo (minúsculas)
              // y los volcados con el nombre original de QGIS, así que el
              // emparejamiento es por id normalizado. La capa se agrega con el
              // id del árbol: es el que resuelve el archivo nuevo.
              const deseadas = new Map(
                arbol.flatMap((e) => e.lineas.flatMap((l) => l.layers)).map((id) => [norm(id), id])
              )
              const yaEstan = new Set(extractedLayers.map((l) => norm(l.id)))
              for (const archivo of (modConfig as ModuleConfig).fuentesDeCapas ?? []) {
                try {
                  const fuente = await getEstiloModulo(archivo)
                  for (const capa of leerEstilo(fuente, [])) {
                    const idArbol = deseadas.get(norm(capa.id))
                    if (!idArbol || yaEstan.has(norm(capa.id))) continue
                    yaEstan.add(norm(capa.id))
                    extractedLayers.push({ ...capa, id: idArbol })
                  }
                } catch (e) {
                  console.error(`No se pudieron leer las capas de ${archivo}`, e)
                }
              }
            }

            extractedLayers.forEach(l => {
              if (l.simbologia) allStyles[l.id] = l.simbologia
              allLabels[l.id] = l.label
            })
            
            return {
              id: modConfig.id,
              title: modConfig.title,
              colorClass: modConfig.colorClass,
              themeColor: (modConfig as any).themeColor || '#9F2241',
              themeBg: (modConfig as any).themeBg || 'rgba(159,34,65,0.02)',
              themeHover: (modConfig as any).themeHover || 'rgba(159,34,65,0.04)',
              icon: getModuleIcon(modConfig.icon),
              layers: extractedLayers,
              defaultLayers: (modConfig as ModuleConfig).defaultLayers,
              groups: (modConfig as ModuleConfig).groups,
              arbol: (modConfig as ModuleConfig).arbol
            }
          } catch (error) {
            console.error(`Error loading styles for ${modConfig.id}:`, error)
            return {
              id: modConfig.id,
              title: modConfig.title,
              colorClass: modConfig.colorClass,
              themeColor: (modConfig as any).themeColor || '#9F2241',
              themeBg: (modConfig as any).themeBg || 'rgba(159,34,65,0.02)',
              themeHover: (modConfig as any).themeHover || 'rgba(159,34,65,0.04)',
              icon: getModuleIcon(modConfig.icon),
              layers: [],
              defaultLayers: (modConfig as ModuleConfig).defaultLayers,
              groups: (modConfig as ModuleConfig).groups,
              arbol: (modConfig as ModuleConfig).arbol
            }
          }
        })
      )

      setModules(loadedModules)
      if (onStylesLoaded) {
        onStylesLoaded(allStyles, allLabels)
      }

      // Encender el módulo inicial: hasta aquí no se conocían sus capas.
      const inicial = loadedModules.find((m) => m.id === activeModule)
      if (inicial) {
        const ids = capasEncendidas(inicial)
        onChangeLayers(ids)
        onChangeOrder(ids)
        if (onActiveModuleChange) onActiveModuleChange(inicial.title)
      }
    }
    fetchModules()
  }, [])

  // Animación FLIP (First, Last, Invert, Play) para deslizamiento y descenso continuo al apagar o reordenar capas
  useLayoutEffect(() => {
    itemRefs.current.forEach((el, id) => {
      if (!el) return
      const currentTop = el.getBoundingClientRect().top
      const prevTop = prevPositions.current.get(id)

      if (prevTop !== undefined) {
        const deltaY = prevTop - currentTop
        if (deltaY !== 0) {
          el.style.transform = `translateY(${deltaY}px)`
          el.style.transition = 'none'

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.transform = 'translateY(0px)'
              el.style.transition = 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)'
            })
          })
        }
      }
      prevPositions.current.set(id, currentTop)
    })
  }, [activeLayers, layerOrder, expandedModule])

  // Removido auto-expandir el módulo para permitir que inicie cerrado

  /**
   * Clic en el encabezado de un módulo.
   *
   * Si es otro módulo, se vuelve el activo: se encienden todas sus capas y se
   * apagan las del anterior, porque cada módulo es el mapa base de su tema y
   * solo puede haber uno a la vez. Si ya era el activo, el clic solo abre o
   * cierra el acordeón y no toca las capas.
   */
  const selectModule = (moduleId: string) => {
    if (moduleId === activeModule) {
      setExpandedModule(expandedModule === moduleId ? null : moduleId)
      return
    }

    const modulo = modules.find((m) => m.id === moduleId)
    if (!modulo) return

    // El orden del árbol de QGIS es el orden de dibujo: el primero va encima.
    const ids = capasEncendidas(modulo)
    setActiveModule(moduleId)
    setExpandedModule(moduleId)
    onChangeLayers(ids)
    onChangeOrder(ids)
    if (onActiveModuleChange) onActiveModuleChange(modulo.title)
  }

  /** Prende o apaga una entrada completa: un grupo viaja con todas sus capas. */
  const toggleEntrada = (ids: string[]) => {
    if (ids.some((id) => activeLayers.includes(id))) {
      onChangeLayers(activeLayers.filter((id) => !ids.includes(id)))
      onChangeOrder(layerOrder.filter((id) => !ids.includes(id)))
    } else {
      onChangeLayers([...activeLayers, ...ids.filter((id) => !activeLayers.includes(id))])
      onChangeOrder([...layerOrder, ...ids.filter((id) => !layerOrder.includes(id))])
    }
  }

  /** Aplica una opacidad a todas las capas de la entrada. */
  const cambiarOpacidad = (ids: string[], valor: number) => {
    ids.forEach((id) => onChangeOpacity(id, valor))
  }

  /**
   * Sube o baja una entrada un lugar en el orden de dibujo. Los dos bloques
   * involucrados se intercambian enteros, así que un grupo nunca se intercala
   * con las capas de otra entrada.
   */
  const moveEntrada = (module: Module, entrada: Entrada, dir: -1 | 1) => {
    const activas = getOrderedEntries(module).filter((e) =>
      e.ids.some((id) => activeLayers.includes(id))
    )
    const idx = activas.findIndex((e) => e.key === entrada.key)
    const vecino = activas[idx + dir]
    if (idx < 0 || !vecino) return

    const bloque = (e: Entrada) => layerOrder.filter((id) => e.ids.includes(id))
    const arriba = dir === -1 ? bloque(vecino) : bloque(entrada)
    const abajo = dir === -1 ? bloque(entrada) : bloque(vecino)
    if (arriba.length === 0 || abajo.length === 0) return

    // Los dos bloques se reinsertan intercambiados donde empezaba el de arriba.
    const inicio = layerOrder.indexOf(arriba[0])
    const resto = layerOrder.filter((id) => !arriba.includes(id) && !abajo.includes(id))
    const antes = layerOrder.slice(0, inicio).filter((id) => resto.includes(id))
    const despues = resto.filter((id) => !antes.includes(id))
    onChangeOrder([...antes, ...abajo, ...arriba, ...despues])
  }

  // Obtener las capas del módulo expandido, ordenadas según layerOrder (activas primero)
  const getOrderedLayers = (moduleLayers: Layer[]) => {
    const ids = moduleLayers.map((l) => l.id)
    const ordered = layerOrder.filter((id) => ids.includes(id))
    ids.forEach((id) => {
      if (!ordered.includes(id)) ordered.push(id)
    })
    return ordered.map((id) => moduleLayers.find((l) => l.id === id)!).filter(Boolean)
  }

  /**
   * Las filas del menú del módulo. Un grupo ocupa el lugar de su capa más alta
   * y sustituye a todas sus capas, que dejan de listarse por separado. Las
   * `FIXED_LAYERS` siguen sin aparecer.
   */
  const getOrderedEntries = (module: Module): Entrada[] => {
    const capas = getOrderedLayers(module.layers).filter((l) => !l.isFixed)
    const grupos = module.groups ?? []
    if (grupos.length === 0) {
      return capas.map((l) => ({
        key: l.id,
        label: l.label,
        desc: l.desc,
        ids: [l.id],
        esGrupo: false
      }))
    }

    const grupoDe = new Map<string, LayerGroup>()
    for (const g of grupos) for (const id of g.layers) grupoDe.set(id, g)

    const entradas: Entrada[] = []
    const emitidos = new Set<string>()
    for (const capa of capas) {
      const grupo = grupoDe.get(capa.id)
      if (!grupo) {
        entradas.push({
          key: capa.id,
          label: capa.label,
          desc: capa.desc,
          ids: [capa.id],
          esGrupo: false
        })
        continue
      }
      if (emitidos.has(grupo.id)) continue
      emitidos.add(grupo.id)
      // Solo las capas del grupo que de verdad llegaron con datos.
      const ids = capas.filter((l) => grupoDe.get(l.id) === grupo).map((l) => l.id)
      entradas.push({
        key: grupo.id,
        label: grupo.label,
        desc: `${ids.length} capas agrupadas`,
        ids,
        esGrupo: true
      })
    }
    return entradas
  }

  const mapaBaseModule = modules.find(m => m.id === 'mapa_base')
  const tematicosModules = modules.filter(m => m.id !== 'mapa_base')

  const renderModule = (module: Module) => {
    const isExpanded = expandedModule === module.id
    const isActive = activeModule === module.id
    const activeCount = module.layers.filter((l) => activeLayers.includes(l.id)).length

    return (
      <div
        key={module.id}
        style={{
          '--theme-color': module.themeColor,
          '--theme-bg': module.themeBg,
          '--theme-hover': module.themeHover
        } as React.CSSProperties}
        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          isActive ? 'border-[var(--theme-color)] bg-white shadow-sm' : 'border-gray-100'
        } ${isExpanded ? 'shadow-sm bg-white' : isActive ? '' : 'bg-gray-50/50 hover:bg-gray-50'}`}
      >
        {/* Encabezado Módulo */}
        <button
          onClick={() => selectModule(module.id)}
          className={`mapas w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-colors`}
          aria-expanded={isExpanded}
          aria-current={isActive ? 'true' : undefined}
          title={module.title}
        >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center border"
                    style={{
                      color: 'var(--theme-color)',
                      borderColor: 'var(--theme-color)',
                      backgroundColor: 'var(--theme-bg)'
                    }}
                  >
                    {module.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">
                      {module.title}
                    </h4>
                    {activeCount > 0 && (
                      <span className="inline-block text-[9px] font-bold bg-[var(--theme-color)] text-white px-2 py-0.5 rounded-full mt-1">
                        {activeCount} activa{activeCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Capas del Módulo */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-2.5 flex flex-col gap-2 bg-white">
                  {(() => {
                    const entradas = getOrderedEntries(module)
                    const activas = entradas.filter((e) => e.ids.some((id) => activeLayers.includes(id)))
                    
                    const half = Math.ceil(entradas.length / 2)
                    const diagnosticoEntradas = entradas.slice(0, half)
                    const estrategiasEntradas = entradas.slice(half)

                    const renderCategory = (categoryEntradas: typeof entradas, title: string | null) => {
                      if (categoryEntradas.length === 0) return null
                      return (
                        <div className="mb-4 last:mb-0">
                          {title && (
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2 border-l-2 border-[var(--theme-color)] ml-1">
                              {title}
                            </h4>
                          )}
                          <div className="flex flex-col gap-2">
                            {categoryEntradas.map((entrada) => {
                              const isLayerActive = entrada.ids.some((id) => activeLayers.includes(id))
                    // Un grupo comparte una sola opacidad; la primera capa la representa.
                    const opacity = layerOpacity[entrada.ids[0]] ?? 1
                    const posActiva = activas.findIndex((e) => e.key === entrada.key)
                    const canMoveUp = isLayerActive && posActiva > 0
                    const canMoveDown = isLayerActive && posActiva >= 0 && posActiva < activas.length - 1

                    return (
                      <div
                        key={entrada.key}
                        ref={(el) => {
                          if (el) itemRefs.current.set(entrada.key, el)
                          else itemRefs.current.delete(entrada.key)
                        }}
                        className={`capas layer-card transition-colors duration-300 ease-in-out ${
                          isLayerActive ? 'layer-card--active' : 'layer-card--inactive opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Columna izquierda: switch + flechas. Es la que fija
                              el alto del card, así que va apretada. */}
                          <div className="flex flex-col items-center gap-0.5 mt-0.5">
                            {/* Switch toggle para encender/apagar capa */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isLayerActive}
                              onClick={() => toggleEntrada(entrada.ids)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isLayerActive ? 'bg-[var(--theme-color)]' : 'bg-gray-200'
                              }`}
                              aria-label={isLayerActive ? `Desactivar ${entrada.label}` : `Activar ${entrada.label}`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isLayerActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Flechas de orden (debajo del switch, solo si activa y >1 entrada) */}
                            {isLayerActive && activas.length > 1 && (
                              <div className="flex flex-col gap-0.5 transition-all duration-300">
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveEntrada(module, entrada, -1) }}
                                  disabled={!canMoveUp}
                                  className={`w-7 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                                    canMoveUp
                                      ? 'text-gray-400 hover:text-[var(--theme-color)] hover:bg-gray-100'
                                      : 'text-gray-200 cursor-not-allowed'
                                  }`}
                                  aria-label="Subir capa"
                                  title="Subir capa"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="18 15 12 9 6 15" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveEntrada(module, entrada, 1) }}
                                  disabled={!canMoveDown}
                                  className={`w-7 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                                    canMoveDown
                                      ? 'text-gray-400 hover:text-[var(--theme-color)] hover:bg-gray-100'
                                      : 'text-gray-200 cursor-not-allowed'
                                  }`}
                                  aria-label="Bajar capa"
                                  title="Bajar capa"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Contenido derecho: label + desc + opacidad */}
                          <div className="flex-1 min-w-0 pr-6 relative">
                            <label
                              htmlFor={`layer-${entrada.key}`}
                              className="text-xs font-semibold text-gray-700 cursor-pointer block"
                              onClick={() => toggleEntrada(entrada.ids)}
                            >
                              {entrada.label}
                            </label>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                              {entrada.desc}
                            </p>

                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (onInfoClick) onInfoClick(entrada); 
                              }} 
                              className="absolute top-0 right-0 p-1 text-gray-400 hover:text-[var(--theme-color)] transition-colors cursor-pointer"
                              title="Ver información de capa"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                              </svg>
                            </button>

                            {/* Opacidad (con animación suave de despliegue/colapso) */}
                            <div
                              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isLayerActive ? 'max-h-12 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                              }`}
                            >
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase w-16 flex-shrink-0">Opacidad</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={opacity}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    cambiarOpacidad(entrada.ids, parseFloat(e.target.value))
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="layer-opacity-slider flex-1 cursor-pointer"
                                />
                              </div>
                            </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                          </div>
                        </div>
                      )
                    }

                    // Un módulo con árbol se navega por niveles: la estrategia
                    // despliega sus líneas y la línea despliega sus capas.
                    if (module.arbol) {
                      return (
                        <div className="flex flex-col gap-1">
                          {module.arbol.map((estrategia) => {
                            const claveEst = estrategia.label
                            const abiertaEst = ramasAbiertas.includes(claveEst)
                            const capasEst = new Set(
                              estrategia.lineas.flatMap((l) => l.layers)
                            )
                            const activasEst = entradas.filter(
                              (e) =>
                                e.ids.some((id) => capasEst.has(id)) &&
                                e.ids.some((id) => activeLayers.includes(id))
                            ).length
                            return (
                              <div key={claveEst} className="rounded-md border border-gray-100">
                                <button
                                  onClick={() => alternarRama(claveEst)}
                                  aria-expanded={abiertaEst}
                                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-gray-50 rounded-md"
                                >
                                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                                    {estrategia.label}
                                  </span>
                                  <span className="flex items-center gap-1.5 shrink-0">
                                    {activasEst > 0 && (
                                      <span className="text-[10px] font-semibold text-white bg-[var(--theme-color)] rounded-full px-1.5 py-px">
                                        {activasEst}
                                      </span>
                                    )}
                                    <svg
                                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${abiertaEst ? 'rotate-180' : ''}`}
                                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    >
                                      <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                  </span>
                                </button>

                                {abiertaEst && (
                                  <div className="px-1.5 pb-1.5 flex flex-col gap-1">
                                    {estrategia.lineas.map((linea) => {
                                      const claveLinea = `${claveEst}//${linea.label}`
                                      const abiertaLinea = ramasAbiertas.includes(claveLinea)
                                      const suyas = entradas.filter((e) =>
                                        e.ids.some((id) => linea.layers.includes(id))
                                      )
                                      if (suyas.length === 0) return null
                                      return (
                                        <div key={claveLinea}>
                                          <button
                                            onClick={() => alternarRama(claveLinea)}
                                            aria-expanded={abiertaLinea}
                                            className="w-full flex items-start justify-between gap-2 px-2 py-1.5 text-left hover:bg-gray-50 rounded"
                                          >
                                            <span className="text-[11px] leading-snug text-gray-600">
                                              {linea.label}
                                            </span>
                                            <svg
                                              className={`w-3 h-3 mt-0.5 text-gray-400 shrink-0 transition-transform ${abiertaLinea ? 'rotate-180' : ''}`}
                                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                            >
                                              <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                          </button>
                                          {abiertaLinea && (
                                            <div className="pl-1">{renderCategory(suyas, null)}</div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    }

                    return (
                      <>
                        {renderCategory(diagnosticoEntradas, 'Diagnóstico')}
                        {renderCategory(estrategiasEntradas, 'Estrategias')}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 relative pb-20 custom-scrollbar">
        
        {modules.length === 0 ? (
          <div className="text-center p-4 text-xs text-gray-500">Cargando capas...</div>
        ) : (
          <>
            {/* Sección Mapa Base */}
            {mapaBaseModule && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-2 px-1">
                  Mapa Base
                </h3>
                {renderModule(mapaBaseModule)}
              </div>
            )}

            {/* Sección Módulos Temáticos */}
            {tematicosModules.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 mt-2 px-1">
                  Monitores
                </h3>
                {tematicosModules.map(renderModule)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
