import { useState, useEffect } from 'react'

interface Layer {
  id: string
  label: string
  desc: string
}

interface Module {
  id: string
  title: string
  icon: React.ReactNode
  colorClass: string
  layers: Layer[]
}

const MODULES: Module[] = [
  {
    id: 'ambiental',
    title: 'Monitoreo Ambiental y Territorial',
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
    layers: [
      {
        id: 'anp',
        label: 'Áreas Naturales Protegidas (ANP)',
        desc: 'Delimitación jurídica y zonas núcleo de conservación de reservas naturales.'
      },
      {
        id: 'manglares',
        label: 'Manglares y Zonas Costeras',
        desc: 'Ecosistemas de manglar y zonas pantanosas con restricciones de uso.'
      }
    ]
  },
  {
    id: 'social',
    title: 'Bienestar Social y Demografía',
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    layers: [
      {
        id: 'poblacion',
        label: 'Densidad de Población por Municipio',
        desc: 'Mapa coroplético indicando concentración demográfica por habitante.'
      }
    ]
  },
  {
    id: 'infraestructura',
    title: 'Infraestructura y Conectividad',
    colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    layers: [
      {
        id: 'linea-trans',
        label: 'Líneas de Transmisión Eléctrica',
        desc: 'Trazado cartográfico de líneas de alta y media tensión en el estado.'
      },
      {
        id: 'via-ferrea',
        label: 'Vías Férreas y Tren Maya',
        desc: 'Derechos de vía e infraestructura del sistema ferroviario y Tren Maya.'
      },
      {
        id: 'educacion',
        label: 'Equipamientos Educativos',
        desc: 'Ubicación cartográfica de planteles de educación superior, media superior, secundaria, primaria y preescolar.'
      }
    ]
  },
  {
    id: 'aptitud',
    title: 'Aptitud Territorial y Desarrollo Económico',
    colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    layers: [
      {
        id: 'zonificacion',
        label: 'Zonificación Primaria y Uso de Suelo',
        desc: 'Delimitaciones cartográficas de uso del suelo primario y zonificación del territorio estatal.'
      }
    ]
  }
]

interface Props {
  activeLayers: string[]
  onChangeLayers: (layers: string[]) => void
  initialModule?: string
  layerOpacity: Record<string, number>
  onChangeOpacity: (layerId: string, opacity: number) => void
  layerOrder: string[]
  onChangeOrder: (order: string[]) => void
}

export default function ModuleLayerSelector({
  activeLayers,
  onChangeLayers,
  initialModule,
  layerOpacity,
  onChangeOpacity,
  layerOrder,
  onChangeOrder
}: Props) {
  const [expandedModule, setExpandedModule] = useState<string | null>(initialModule ?? 'ambiental')

  // Auto-expandir el módulo que contenga la(s) capa(s) activa(s) al navegar o montar la pestaña
  useEffect(() => {
    if (activeLayers.length > 0) {
      const activeModule = MODULES.find((m) =>
        m.layers.some((l) => activeLayers.includes(l.id))
      )
      if (activeModule) {
        setExpandedModule(activeModule.id)
      }
    }
  }, [activeLayers])

  const toggleModuleExpand = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null)
      onChangeLayers([])
    } else {
      setExpandedModule(moduleId)
      const targetModule = MODULES.find((m) => m.id === moduleId)
      if (targetModule) {
        const newLayers = targetModule.layers.map((l) => l.id)
        onChangeLayers(newLayers)
        // Inicializar orden: mantener las que ya están + agregar nuevas
        const merged = [...layerOrder.filter((id) => newLayers.includes(id))]
        newLayers.forEach((id) => {
          if (!merged.includes(id)) merged.push(id)
        })
        onChangeOrder(merged)
      }
    }
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

  // Obtener las capas del módulo expandido, ordenadas según layerOrder
  const getOrderedLayers = (moduleLayers: Layer[]) => {
    const ids = moduleLayers.map((l) => l.id)
    const ordered = layerOrder.filter((id) => ids.includes(id))
    // Agregar capas que no están en el orden aún
    ids.forEach((id) => {
      if (!ordered.includes(id)) ordered.push(id)
    })
    return ordered.map((id) => moduleLayers.find((l) => l.id === id)!).filter(Boolean)
  }

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
        Módulos Temáticos
      </h3>

      <div className="flex flex-col gap-2">
        {MODULES.map((module) => {
          const isExpanded = expandedModule === module.id
          const activeCount = module.layers.filter((l) => activeLayers.includes(l.id)).length

          return (
            <div
              key={module.id}
              className={`border border-gray-100 rounded-lg overflow-hidden transition-all duration-200 ${
                isExpanded ? 'shadow-sm bg-white' : 'bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              {/* Encabezado Módulo */}
              <button
                onClick={() => toggleModuleExpand(module.id)}
                className="w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-colors"
                aria-expanded={isExpanded}
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
                <div className="border-t border-gray-100 p-3 flex flex-col gap-2.5 bg-white">
                  {getOrderedLayers(module.layers).map((layer) => {
                    const isLayerActive = activeLayers.includes(layer.id)
                    const opacity = layerOpacity[layer.id] ?? 1
                    const activeInModule = module.layers.filter((l) => activeLayers.includes(l.id))
                    const orderIdx = layerOrder.indexOf(layer.id)
                    const canMoveUp = isLayerActive && orderIdx > 0 && layerOrder[orderIdx - 1] !== undefined && activeInModule.some((l) => l.id === layerOrder[orderIdx - 1])
                    const canMoveDown = isLayerActive && orderIdx < layerOrder.length - 1 && activeInModule.some((l) => l.id === layerOrder[orderIdx + 1])

                    return (
                      <div
                        key={layer.id}
                        className={`layer-card ${isLayerActive ? 'layer-card--active' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Columna izquierda: ojo + flechas */}
                          <div className="flex flex-col items-center gap-1 mt-0.5">
                            {/* Ojo toggle */}
                            <button
                              onClick={() => toggleLayer(layer.id)}
                              className="cursor-pointer p-0 bg-transparent border-none outline-none"
                              aria-label={isLayerActive ? 'Ocultar capa' : 'Mostrar capa'}
                            >
                              {isLayerActive ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-guinda)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-all">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-all opacity-25">
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                  <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                              )}
                            </button>

                            {/* Flechas de orden (debajo del ojo, solo si activa y >1 capa) */}
                            {isLayerActive && activeInModule.length > 1 && (
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, -1) }}
                                  disabled={!canMoveUp}
                                  className={`w-8 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
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
                                  className={`w-8 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
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

                            {/* Opacidad */}
                            {isLayerActive && (
                              <div className="mt-2">
                                <div className="flex items-center gap-2">
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
                                    className="layer-opacity-slider flex-1"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
