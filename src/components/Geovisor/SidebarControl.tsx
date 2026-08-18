import { useState, useRef, useEffect } from 'react'
import { CAMPECHE_GEOJSON, MunicipioProperties } from '../../data/campecheData'
import { getCapaGeoJSON } from '../../lib/cartografia'

interface Props {
  activeTab: 'capas' | 'info'
  onChangeTab: (tab: 'capas' | 'info') => void
  selectedFeature: any
  onSelectFeature: (feature: any) => void
  selectedLayerInfo?: any
  onSelectLayerInfo?: (info: any) => void
  activeLayers?: string[]
  activeModuleTitle?: string
  children: React.ReactNode
}

export default function SidebarControl({
  activeTab,
  onChangeTab,
  selectedFeature,
  onSelectFeature,
  selectedLayerInfo,
  onSelectLayerInfo,
  activeLayers,
  activeModuleTitle,
  children
}: Props) {
  const [showResults, setShowResults] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedScale, setSelectedScale] = useState('Estatal')
  const searchRef = useRef<HTMLDivElement>(null)

  const [layerMetadata, setLayerMetadata] = useState<any>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [moduleMetadata, setModuleMetadata] = useState<{ instrumentos: string[], instituciones: string[] }>({ instrumentos: [], instituciones: [] })
  const [isLoadingModuleMetadata, setIsLoadingModuleMetadata] = useState(false)
  const [isStatsExpanded, setIsStatsExpanded] = useState(true)
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedLayerInfo && selectedLayerInfo.ids && selectedLayerInfo.ids.length > 0) {
      setIsLoadingMetadata(true)
      setLayerMetadata(null)
      getCapaGeoJSON(selectedLayerInfo.ids[0])
        .then(geojson => {
          if (geojson && geojson.features && geojson.features.length > 0) {
            setLayerMetadata(geojson.features[0].properties)
          } else {
            setLayerMetadata({})
          }
        })
        .catch(err => {
          console.error("Error cargando metadata de capa:", err)
          setLayerMetadata({})
        })
        .finally(() => {
          setIsLoadingMetadata(false)
        })
    } else {
      setLayerMetadata(null)
    }
  }, [selectedLayerInfo])

  useEffect(() => {
    if (activeTab === 'info' && !selectedFeature && !selectedLayerInfo && activeLayers && activeLayers.length > 0) {
      setIsLoadingModuleMetadata(true)
      Promise.all(activeLayers.map(layerId => getCapaGeoJSON(layerId).catch(() => null)))
        .then(results => {
          const normalizeText = (text: string) => {
            if (!text) return ''
            return text
              .replace(/\s*,?\s*\d{4}\s*$/, '') // Elimina años al final ej. ", 2020" o ",2020"
              .replace(/\s+/g, ' ') // Espacios múltiples a uno solo
              .trim()
          }

          const instrumentosMap = new Map<string, string>()
          const institucionesMap = new Map<string, string>()

          results.forEach(geojson => {
            if (geojson && geojson.features && geojson.features.length > 0) {
              const props = geojson.features[0].properties
              
              if (props.instrumento_vigencia) {
                const clean = normalizeText(props.instrumento_vigencia)
                if (clean) instrumentosMap.set(clean.toUpperCase(), clean)
              }
              
              if (props.responsable_institucional) {
                const clean = normalizeText(props.responsable_institucional)
                if (clean) institucionesMap.set(clean.toUpperCase(), clean)
              }
            }
          })

          setModuleMetadata({
            instrumentos: Array.from(instrumentosMap.values()).sort(),
            instituciones: Array.from(institucionesMap.values()).sort()
          })
        })
        .finally(() => {
          setIsLoadingModuleMetadata(false)
        })
    } else if (activeTab === 'info' && (!activeLayers || activeLayers.length === 0)) {
      setModuleMetadata({ instrumentos: [], instituciones: [] })
    }
  }, [activeTab, selectedFeature, selectedLayerInfo, activeLayers])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (feat: MunicipioProperties | null) => {
    onSelectFeature(feat)
    if (onSelectLayerInfo) onSelectLayerInfo(null)
    setShowResults(false)
    if (feat) {
      onChangeTab('info')
    }
  }

  const scales = [
    'Estatal',
    'Municipal'
  ]

  const sortedMunicipalities = [...CAMPECHE_GEOJSON.features].sort((a, b) =>
    a.properties.nombre.localeCompare(b.properties.nombre)
  )

  const renderEstadisticas = (seedName?: string) => {
    let barVals = [
      { label: 'Campeche', value: 85, color: 'opacity-100' },
      { label: 'Carmen', value: 65, color: 'opacity-80' },
      { label: 'Champotón', value: 45, color: 'opacity-60' },
      { label: 'Escárcega', value: 30, color: 'opacity-40' },
      { label: 'Calkiní', value: 15, color: 'opacity-20' },
    ];
    let pieVals = [50, 30, 20];
    
    if (seedName) {
      const seed = seedName.length;
      barVals = [
        { label: 'Zona Norte', value: 40 + (seed * 7) % 60, color: 'opacity-100' },
        { label: 'Zona Sur', value: 30 + (seed * 5) % 40, color: 'opacity-80' },
        { label: 'Zona Este', value: 20 + (seed * 3) % 30, color: 'opacity-60' },
        { label: 'Zona Oeste', value: 10 + (seed * 2) % 20, color: 'opacity-40' },
        { label: 'Centro', value: 5 + seed % 10, color: 'opacity-20' },
      ].sort((a,b) => b.value - a.value);

      pieVals = [
        40 + (seed * 3) % 20,
        30 + (seed * 2) % 20,
        10 + seed % 10
      ];
      const sum = pieVals.reduce((a,b)=>a+b, 0);
      pieVals = pieVals.map(v => Math.round((v/sum)*100));
      pieVals[2] = 100 - pieVals[0] - pieVals[1];
    }

    return (
      <div className="border-b border-gray-100">
        <button
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          className="flex items-center justify-between w-full p-4 bg-transparent transition-colors hover:bg-gray-50/50"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-2 px-1">Estadística Descriptiva</h3>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        
        {isStatsExpanded && (
          <div className="p-5 border-t border-gray-100 bg-white">
            <div className="mb-4">
              <p className="text-xs text-gray-500 font-medium">
                Entidad: <span className="font-bold text-[var(--theme-color,var(--c-guinda))]">{seedName || 'Estatal'}</span>
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {/* Mock Horizontal Bar Chart (SVG) */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">
                  {seedName ? `Superficie en ${seedName} (Ha)` : 'Superficie por Municipio (Ha)'}
                </h4>
                <div className="flex flex-col gap-3">
                  {barVals.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500 font-semibold w-16 truncate">{item.label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-[var(--theme-color,var(--c-guinda))] ${item.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-gray-600 font-bold w-6 text-right">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Donut Chart (SVG) */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                      className="text-gray-100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3"
                    />
                    <path
                      className="text-[var(--theme-color,var(--c-guinda))] opacity-100"
                      strokeDasharray={`${pieVals[0]}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                    />
                    <path
                      className="text-[var(--theme-color,var(--c-guinda))] opacity-50"
                      strokeDasharray={`${pieVals[1]}, 100`}
                      strokeDashoffset={`-${pieVals[0]}`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                    />
                    <path
                      className="text-[var(--theme-color,var(--c-guinda))] opacity-20"
                      strokeDasharray={`${pieVals[2]}, 100`}
                      strokeDashoffset={`-${pieVals[0] + pieVals[1]}`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[8px] text-gray-400 font-bold uppercase">Total</span>
                    <span className="text-sm font-black text-gray-700">100%</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2.5 flex-1">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Uso de Suelo</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-color,var(--c-guinda))]"></div>
                    <span className="text-[10px] text-gray-600 font-semibold flex-1">Conservación</span>
                    <span className="text-[10px] text-gray-400 font-bold">{pieVals[0]}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-color,var(--c-guinda))] opacity-50"></div>
                    <span className="text-[10px] text-gray-600 font-semibold flex-1">Aprovechamiento</span>
                    <span className="text-[10px] text-gray-400 font-bold">{pieVals[1]}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--theme-color,var(--c-guinda))] opacity-20"></div>
                    <span className="text-[10px] text-gray-600 font-semibold flex-1">Urbano</span>
                    <span className="text-[10px] text-gray-400 font-bold">{pieVals[2]}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderInformacionMapa = () => {
    return (
      <div className="border-b border-gray-100">
        <button
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
          className="flex items-center justify-between w-full p-4 bg-transparent transition-colors hover:bg-gray-50/50"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-2 px-1">Información del Mapa</h3>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isInfoExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {isInfoExpanded && (
          <div className="p-5 border-t border-gray-100 bg-white">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-[var(--theme-color,var(--c-guinda))] font-heading">
                {activeModuleTitle || 'Cargando mapa...'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Resumen de capas activas</p>
            </div>
            
            {isLoadingModuleMetadata ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[var(--c-guinda)] animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="block bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 transition-all">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Instrumentos Normativos Involucrados</h5>
                  {moduleMetadata.instrumentos.length > 0 ? (
                    <ul className="text-sm font-semibold text-gray-700 mt-0.5 list-disc pl-4 space-y-1">
                      {moduleMetadata.instrumentos.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">No hay instrumentos registrados en las capas activas.</p>
                  )}
                </div>

                <div className="block bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 transition-all">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Instituciones Responsables</h5>
                  {moduleMetadata.instituciones.length > 0 ? (
                    <ul className="text-sm font-semibold text-gray-700 mt-0.5 list-disc pl-4 space-y-1">
                      {moduleMetadata.instituciones.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">No hay instituciones registradas en las capas activas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="geovisor-sidebar">
      {/* Buscador de Municipios */}
      <div className="p-4 border-b border-gray-100 relative z-30">
        <label htmlFor="municipio-search" className="sr-only">Seleccionar municipio</label>
        <div className="flex gap-2">
          <div className="relative flex-1" ref={searchRef}>
            <button
              id="municipio-search"
              onClick={() => setShowResults(!showResults)}
              className="w-full flex items-center justify-between pl-4 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none hover:bg-white focus:bg-white focus:border-[var(--c-guinda)] focus:ring-2 focus:ring-[rgba(159,34,65,0.1)] transition-all cursor-pointer text-left"
            >
              <span className={selectedFeature ? "text-gray-700 font-medium" : "text-gray-500"}>
                {selectedFeature ? selectedFeature.nombre : 'Todos los municipios'}
              </span>
              <svg
                className={`text-gray-400 transition-transform duration-200 ${showResults ? 'rotate-180' : ''}`}
                width="15"
                height="15"
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
            
            {/* Lista Desplegable de Municipios */}
            {showResults && (
              <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
                <li>
                  <button
                    onClick={() => handleSelect(null)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[rgba(159,34,65,0.04)] hover:text-[var(--c-guinda)] transition-colors cursor-pointer ${
                      !selectedFeature ? 'text-[var(--c-guinda)] bg-[rgba(159,34,65,0.04)]' : 'text-gray-700'
                    }`}
                  >
                    Todos los municipios
                  </button>
                </li>
                {sortedMunicipalities.map((f) => (
                  <li key={f.properties.id}>
                    <button
                      onClick={() => handleSelect(f.properties)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[rgba(159,34,65,0.04)] hover:text-[var(--c-guinda)] transition-colors cursor-pointer ${
                        selectedFeature?.id === f.properties.id ? 'text-[var(--c-guinda)] bg-[rgba(159,34,65,0.04)]' : 'text-gray-700'
                      }`}
                    >
                      {f.properties.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="w-10 h-[38px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg hover:bg-white focus:border-[var(--c-guinda)] focus:ring-2 focus:ring-[rgba(159,34,65,0.1)] transition-all cursor-pointer text-gray-400"
              aria-label="Filtrar por escala"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
            </button>

            {showFilter && (
              <div className="absolute right-0 top-[calc(100%+4px)] w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                {scales.map((scale) => (
                  <button
                    key={scale}
                    onClick={() => {
                      setSelectedScale(scale)
                      setShowFilter(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[rgba(159,34,65,0.04)] hover:text-[var(--c-guinda)] transition-colors cursor-pointer ${
                      selectedScale === scale ? 'text-[var(--c-guinda)] bg-[rgba(159,34,65,0.04)]' : 'text-gray-700'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button
          onClick={() => onChangeTab('capas')}
          className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === 'capas'
              ? 'border-[var(--c-guinda)] text-[var(--c-guinda)] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          aria-selected={activeTab === 'capas'}
        >
          Cartografía
        </button>
        <button
          onClick={() => onChangeTab('info')}
          className={`flex-1 py-3 text-center text-xs font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'border-[var(--c-guinda)] text-[var(--c-guinda)] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
          aria-selected={activeTab === 'info'}
        >
          Información
        </button>
      </div>

      {/* Contenido Pestañas */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        <div className={activeTab === 'capas' ? 'block h-full' : 'hidden'}>
          {children}
        </div>
        
        <div className={activeTab === 'info' ? 'p-5 flex flex-col h-full' : 'hidden'}>
          {selectedFeature ? (
            <div className="flex flex-col h-full">
              {/* Estadística descriptiva por municipio (Mock) */}
              {renderEstadisticas(selectedFeature.nombre)}

              {/* Información del Mapa */}
              {renderInformacionMapa()}
            </div>
          ) : selectedLayerInfo ? (
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[var(--c-guinda)] uppercase bg-[rgba(159,34,65,0.06)] px-2.5 py-1 rounded-full">
                    Ficha Técnica de Capa
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-2 font-heading">
                    {selectedLayerInfo.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Tipo: {selectedLayerInfo.esGrupo ? 'Grupo de Capas' : 'Capa Vectorial'}</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoadingMetadata ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[var(--c-guinda)] animate-spin"></div>
                    </div>
                  ) : (
                    <>
                      <div className="block bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 transition-all mb-4">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase">Instrumento Normativo</h5>
                        <p className="text-sm font-semibold text-gray-700 mt-0.5">
                          {layerMetadata?.instrumento_vigencia || 'No disponible'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Denominación Oficial</h5>
                          <p className="text-xs text-gray-600">{layerMetadata?.denominacion_oficial || 'No disponible'}</p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Institución Responsable</h5>
                          <p className="text-xs text-gray-600">{layerMetadata?.responsable_institucional || 'No disponible'}</p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Fecha de Actualización</h5>
                          <p className="text-xs text-gray-600">{layerMetadata?.fecha_actualizacion || 'No disponible'}</p>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Escala</h5>
                          <p className="text-xs text-gray-600">{layerMetadata?.cobertura_territorial || 'No disponible'}</p>
                        </div>
                        <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-800 flex gap-2 items-start">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            Estos atributos han sido obtenidos del GeoJSON local como estructuración previa al backend.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Sección Estadística Descriptiva */}
                {renderEstadisticas()}

                {/* Sección Información del Mapa */}
                {renderInformacionMapa()}
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
