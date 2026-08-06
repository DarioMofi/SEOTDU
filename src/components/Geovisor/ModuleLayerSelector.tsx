import { useState, useEffect, useLayoutEffect, useRef } from 'react'

interface Layer {
  id: string
  label: string
  desc: string
  simbologia?: any
  isFixed?: boolean
}

interface Module {
  id: string
  title: string
  icon: React.ReactNode
  colorClass: string
  layers: Layer[]
  /** Capas que se encienden al activar el módulo. Sin lista, se encienden todas. */
  defaultLayers?: string[]
}

import { appConfig } from '../../config/appConfig'

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
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      )
    case 'social':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'infraestructura':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )
    case 'aptitud':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'normatividad':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
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
        : declarado
    if (availableLayers.length > 0 && !availableLayers.includes(id)) return []

    const cleanLabel = String(capa.nombre ?? id).replace(/^C\d+_/, '').replace(/_/g, ' ')
    return [{
      id,
      label: appConfig.LAYER_ALIASES[id] || cleanLabel,
      desc: 'Capa dinámica',
      simbologia: capa.simbologia,
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
}

export default function ModuleLayerSelector({
  activeLayers,
  onChangeLayers,
  initialModule,
  layerOpacity,
  onChangeOpacity,
  layerOrder,
  onChangeOrder,
  onStylesLoaded
}: Props) {
  // Módulo activo: sus capas son las que están dibujadas. Solo uno a la vez.
  // Es independiente del acordeón, que arranca cerrado.
  const [activeModule, setActiveModule] = useState<string>(initialModule ?? appConfig.DEFAULT_MODULE)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [modules, setModules] = useState<Module[]>([])

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
    const ids = modulo.layers.map((l) => l.id)
    if (!modulo.defaultLayers) return ids
    const encendidas = modulo.defaultLayers
    return ids.filter((id) => encendidas.includes(id))
  }

  // Cargar las capas dinámicamente desde los archivos JSON
  useEffect(() => {
    async function fetchModules() {
      let availableLayers: string[] = []
      try {
        const resAvail = await fetch('/layers/available.json')
        if (resAvail.ok) {
          availableLayers = await resAvail.json()
        }
      } catch (e) {
        console.error('No se pudo cargar la lista de capas disponibles', e)
      }

      const allStyles: Record<string, any> = {}
      const allLabels: Record<string, string> = {}

      const loadedModules = await Promise.all(
        appConfig.MODULES_CONFIG.map(async (modConfig) => {
          try {
            const res = await fetch(`/estilos/${modConfig.file}`)
            if (!res.ok) throw new Error('File not found')
            const json = await res.json()
            const extractedLayers = esFormatoNuevo(json)
              ? extractLayersFromNewStyle(json, availableLayers)
              : extractLayersFromStyle(json as StyleNode, availableLayers).filter(
                  l => availableLayers.length === 0 || availableLayers.includes(l.id)
                )
            
            extractedLayers.forEach(l => {
              if (l.simbologia) allStyles[l.id] = l.simbologia
              allLabels[l.id] = l.label
            })
            
            return {
              id: modConfig.id,
              title: modConfig.title,
              colorClass: modConfig.colorClass,
              icon: getModuleIcon(modConfig.icon),
              layers: extractedLayers,
              defaultLayers: (modConfig as { defaultLayers?: string[] }).defaultLayers
            }
          } catch (error) {
            console.error(`Error loading styles for ${modConfig.id}:`, error)
            return {
              id: modConfig.id,
              title: modConfig.title,
              colorClass: modConfig.colorClass,
              icon: getModuleIcon(modConfig.icon),
              layers: [],
              defaultLayers: (modConfig as { defaultLayers?: string[] }).defaultLayers
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
  }

  const toggleLayer = (layerId: string) => {
    if (activeLayers.includes(layerId)) {
      onChangeLayers(activeLayers.filter((id) => id !== layerId))
      onChangeOrder(layerOrder.filter((id) => id !== layerId))
    } else {
      onChangeLayers([...activeLayers, layerId])
      onChangeOrder([...layerOrder, layerId])
    }
  }

  const moveLayer = (layerId: string, dir: -1 | 1) => {
    const idx = layerOrder.indexOf(layerId)
    if (idx < 0) return
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= layerOrder.length) return
    const next = [...layerOrder];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    onChangeOrder(next)
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

  const mapaBaseModule = modules.find(m => m.id === 'mapa_base')
  const tematicosModules = modules.filter(m => m.id !== 'mapa_base')

  const renderModule = (module: Module) => {
    const isExpanded = expandedModule === module.id
    const isActive = activeModule === module.id
    const activeCount = module.layers.filter((l) => activeLayers.includes(l.id)).length

    return (
      <div
        key={module.id}
        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          isActive ? 'border-[var(--c-guinda)] bg-white shadow-sm' : 'border-gray-100'
        } ${isExpanded ? 'shadow-sm bg-white' : isActive ? '' : 'bg-gray-50/50 hover:bg-gray-50'}`}
      >
        {/* Encabezado Módulo */}
        <button
          onClick={() => selectModule(module.id)}
          className={`mapas w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-colors`}
          aria-expanded={isExpanded}
          aria-current={isActive ? 'true' : undefined}
          title={isActive ? 'Módulo activo' : `Mostrar ${module.title}`}
        >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${module.colorClass}`}>
                    {module.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 leading-tight">
                      {module.title}
                    </h4>
                    {activeCount > 0 && (
                      <span className="inline-block text-[9px] font-bold bg-[var(--c-guinda)] text-white px-2 py-0.5 rounded-full mt-1">
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
                  {getOrderedLayers(module.layers).filter(layer => !layer.isFixed).map((layer) => {
                    const isLayerActive = activeLayers.includes(layer.id)
                    const opacity = layerOpacity[layer.id] ?? 1
                    const activeInModule = module.layers.filter((l) => activeLayers.includes(l.id))
                    const orderIdx = layerOrder.indexOf(layer.id)
                    const canMoveUp = isLayerActive && orderIdx > 0 && layerOrder[orderIdx - 1] !== undefined && activeInModule.some((l) => l.id === layerOrder[orderIdx - 1])
                    const canMoveDown = isLayerActive && orderIdx < layerOrder.length - 1 && activeInModule.some((l) => l.id === layerOrder[orderIdx + 1])

                    return (
                      <div
                        key={layer.id}
                        ref={(el) => {
                          if (el) itemRefs.current.set(layer.id, el)
                          else itemRefs.current.delete(layer.id)
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
                              onClick={() => toggleLayer(layer.id)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isLayerActive ? 'bg-[var(--c-guinda)]' : 'bg-gray-200'
                              }`}
                              aria-label={isLayerActive ? `Desactivar ${layer.label}` : `Activar ${layer.label}`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isLayerActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Flechas de orden (debajo del switch, solo si activa y >1 capa) */}
                            {isLayerActive && activeInModule.length > 1 && (
                              <div className="flex flex-col gap-0.5 transition-all duration-300">
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1) }}
                                  disabled={!canMoveUp}
                                  className={`w-7 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                                    canMoveUp
                                      ? 'text-gray-400 hover:text-[var(--c-guinda)] hover:bg-gray-100'
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
                                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 1) }}
                                  disabled={!canMoveDown}
                                  className={`w-7 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                                    canMoveDown
                                      ? 'text-gray-400 hover:text-[var(--c-guinda)] hover:bg-gray-100'
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
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`layer-${layer.id}`}
                              className="text-xs font-semibold text-gray-700 cursor-pointer block"
                              onClick={() => toggleLayer(layer.id)}
                            >
                              {layer.label}
                            </label>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                              {layer.desc}
                            </p>

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
                                    onChangeOpacity(layer.id, parseFloat(e.target.value))
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
                  Módulos Temáticos
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
