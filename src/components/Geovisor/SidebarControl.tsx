import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
  selectedScale?: string
  onSelectScale?: (scale: string) => void
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
  selectedScale,
  onSelectScale,
  children
}: Props) {
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  
  const [internalScale, setInternalScale] = useState('Estatal')
  const currentScale = selectedScale !== undefined ? selectedScale : internalScale
  const handleScaleChange = (scale: string) => {
    if (onSelectScale) onSelectScale(scale)
    setInternalScale(scale)
  }

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
    }
    if (showFilter) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilter])

  // Filtrar municipios por nombre
  const filtered = CAMPECHE_GEOJSON.features.filter((f) =>
    f.properties.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (feat: MunicipioProperties) => {
    onSelectFeature(feat)
    if (onSelectLayerInfo) onSelectLayerInfo(null)
    setSearch(feat.nombre)
    setShowResults(false)
    onChangeTab('info')
  }

  const scales = [
    'Estatal',
    'Municipal',
    'Área de gestión territorial',
    'Manzanas',
    'Localidades Urbanas',
    'Localidades Rurales'
  ]

  return (
    <div className="geovisor-sidebar">
      {/* Buscador de Municipios */}
      <div className="p-4 border-b border-gray-100 relative z-30">
        <label htmlFor="municipio-search" className="sr-only">Buscar por municipio</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="municipio-search"
              type="text"
              placeholder="Buscar por municipio"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-[var(--c-guinda)] focus:ring-2 focus:ring-[rgba(159,34,65,0.1)] transition-all"
            />
            <svg
              className="absolute left-3.5 top-3 text-gray-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  onSelectFeature(null)
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
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
                      handleScaleChange(scale)
                      setShowFilter(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-[rgba(159,34,65,0.04)] hover:text-[var(--c-guinda)] transition-colors cursor-pointer ${
                      currentScale === scale ? 'text-[var(--c-guinda)] bg-[rgba(159,34,65,0.04)]' : 'text-gray-700'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lista Autocompletar */}
        {showResults && search && filtered.length > 0 && (
          <ul className="absolute left-4 right-4 top-[56px] z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1 py-1">
            {filtered.map((f) => (
              <li key={f.properties.id}>
                <button
                  onClick={() => handleSelect(f.properties)}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[rgba(159,34,65,0.04)] hover:text-[var(--c-guinda)] transition-colors cursor-pointer"
                >
                  {f.properties.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
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
          {(currentScale === 'Estatal' || currentScale === 'Municipal') ? (
            children
          ) : (
            <div className="p-4 flex flex-col gap-6">
              {[
                {
                  title: 'Población',
                  layers: ['Densidad poblacional', 'Grado de Marginación']
                },
                {
                  title: 'Educación',
                  layers: ['Grado de educación promedio']
                },
                {
                  title: 'Economía',
                  layers: ['Población económicamente activa', 'Población dependiente']
                }
              ].map((category) => (
                <div key={category.title}>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 mt-2 px-1">
                    {category.title}
                  </h5>
                  <div className="flex flex-col gap-2">
                    {category.layers.map((layer) => (
                      <div
                        key={layer}
                        className="capas layer-card transition-colors duration-300 ease-in-out layer-card--inactive opacity-90"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-0.5 mt-0.5"><button
                              type="button"
                              role="switch"
                              aria-checked={false}
                              className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-default rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-gray-200"
                            >
                              <span
                                aria-hidden="true"
                                className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out translate-x-0"
                              />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0 pr-6 relative">
                            <label className="text-xs font-semibold text-gray-700 cursor-default block">
                              {layer}
                            </label>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                              Capa dinámica
                            </p>
                            <button 
                              className="absolute top-0 right-0 p-1 text-gray-400 transition-colors cursor-default"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                              </svg>
                            </button>
                            <div className="transition-all duration-300 ease-in-out overflow-hidden max-h-0 opacity-0 mt-0 pointer-events-none">
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase w-16 flex-shrink-0">Opacidad</span>
                                <input type="range" className="layer-opacity-slider flex-1 cursor-default" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={activeTab === 'info' ? 'p-5 flex flex-col h-full' : 'hidden'}>
          {selectedFeature ? (
            <div className="flex flex-col gap-4">
                {/* Denominación Oficial + Escala de Referencia */}
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[var(--c-guinda)] uppercase bg-[rgba(159,34,65,0.06)] px-2.5 py-1 rounded-full">
                    Ficha Territorial
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-2 font-heading">
                    {selectedFeature.nombre}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Escala de Referencia: {selectedFeature.escalaReferencia}</p>
                </div>

                <Link
                  to="/catalogo"
                  className="block bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 hover:border-[var(--c-guinda)] hover:bg-[rgba(159,34,65,0.02)] transition-all group"
                >
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase group-hover:text-[var(--c-guinda)] transition-colors">Instrumento Normativo</h5>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5 group-hover:text-[var(--c-guinda)] transition-colors flex items-center gap-1.5">
                    {selectedFeature.instrumentoNormativo}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
                    </svg>
                  </p>
                </Link>

                {/* Responsable / Fecha / Vigencia */}
                <div className="flex flex-col gap-2">
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Responsable</h5>
                    <p className="text-xs text-gray-600">{selectedFeature.responsable}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Fecha de Actualización</h5>
                    <p className="text-xs text-gray-600">{selectedFeature.fechaActualizacion}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Vigencia</h5>
                    <p className="text-xs text-gray-600">{selectedFeature.vigencia}</p>
                  </div>
                </div>
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
                      <div className="flex flex-col gap-5">
                        {/* Mock Horizontal Bar Chart (SVG) */}
                        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4 tracking-wider">Superficie por Municipio (Ha)</h4>
                          <div className="flex flex-col gap-3">
                            {[
                              { label: 'Campeche', value: 85, color: 'opacity-100' },
                              { label: 'Carmen', value: 65, color: 'opacity-80' },
                              { label: 'Champotón', value: 45, color: 'opacity-60' },
                              { label: 'Escárcega', value: 30, color: 'opacity-40' },
                              { label: 'Calkiní', value: 15, color: 'opacity-20' },
                            ].map((item, idx) => (
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
                              {/* Background ring */}
                              <path
                                className="text-gray-100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3"
                              />
                              {/* Segment 1 */}
                              <path
                                className="text-[var(--theme-color,var(--c-guinda))] opacity-100"
                                strokeDasharray="50, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                              />
                              {/* Segment 2 */}
                              <path
                                className="text-[var(--theme-color,var(--c-guinda))] opacity-50"
                                strokeDasharray="30, 100"
                                strokeDashoffset="-53"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                              />
                              {/* Segment 3 */}
                              <path
                                className="text-[var(--theme-color,var(--c-guinda))] opacity-20"
                                strokeDasharray="10, 100"
                                strokeDashoffset="-86"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
                              />
                            </svg>
                            {/* Center text */}
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
                              <span className="text-[10px] text-gray-400 font-bold">50%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[var(--theme-color,var(--c-guinda))] opacity-50"></div>
                              <span className="text-[10px] text-gray-600 font-semibold flex-1">Aprovechamiento</span>
                              <span className="text-[10px] text-gray-400 font-bold">30%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[var(--theme-color,var(--c-guinda))] opacity-20"></div>
                              <span className="text-[10px] text-gray-600 font-semibold flex-1">Urbano</span>
                              <span className="text-[10px] text-gray-400 font-bold">10%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sección Información del Mapa */}
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
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
