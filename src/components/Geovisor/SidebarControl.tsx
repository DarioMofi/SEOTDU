import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CAMPECHE_GEOJSON, MunicipioProperties } from '../../data/campecheData'

interface Props {
  activeTab: 'capas' | 'info'
  onChangeTab: (tab: 'capas' | 'info') => void
  selectedFeature: any
  onSelectFeature: (feature: any) => void
  children: React.ReactNode
}

export default function SidebarControl({
  activeTab,
  onChangeTab,
  selectedFeature,
  onSelectFeature,
  children
}: Props) {
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)

  // Filtrar municipios por nombre
  const filtered = CAMPECHE_GEOJSON.features.filter((f) =>
    f.properties.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (feat: MunicipioProperties) => {
    onSelectFeature(feat)
    setSearch(feat.nombre)
    setShowResults(false)
    onChangeTab('info')
  }

  return (
    <div className="geovisor-sidebar">
      {/* Buscador de Municipios */}
      <div className="p-4 border-b border-gray-100 relative">
        <label htmlFor="municipio-search" className="sr-only">Buscar municipio</label>
        <div className="relative">
          <input
            id="municipio-search"
            type="text"
            placeholder="Buscar municipio de Campeche..."
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
          Capas
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
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'capas' ? (
          children
        ) : (
          <div className="p-5 flex flex-col h-full">
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
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 my-auto">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 animate-pulse">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-gray-700">Sin Selección Territorial</h4>
                <p className="text-xs text-gray-400 mt-2 max-width-[240px] leading-relaxed">
                  Haz clic sobre cualquier municipio en el mapa o utiliza el buscador superior para consultar su información detallada y capas normativas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
