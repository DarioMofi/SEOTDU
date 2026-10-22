import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/plataforma/header'
import Navbar from '../components/plataforma/navbar'
import Footer from '../components/plataforma/footer'
import Underfooter from '../components/plataforma/underfooter'
import { INSTRUMENTOS_DATA, Instrumento } from '../data/instrumentosData'
import { getPublicacionesInstrumentos, type PublicacionInstrumento } from '../lib/datosPrograma'
import { assetUrl } from '../lib/assetUrl'
import ResumenCatalogo from '../components/catalogo/resumen-catalogo'
import {
  Search,
  X,
  Filter,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  RotateCcw,
  FileText,
  Building2,
  ChevronRight,
  ChevronDown,
  Download
} from 'lucide-react'

const ORDEN_TIPO: Record<string, number> = {
  'Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano': 1,
  'Programa Municipal de Desarrollo Urbano': 2,
  'Programa de Ordenamiento Ecológico Local del Territorio': 3,
  'Programa de Ordenamiento Ecológico Participativo Local': 4,
  'Programa Director Urbano': 5
}

const OPCIONES_ESCALA = ['Estatal', 'Municipal', 'Centro de Población'] as const

const OPCIONES_TIPO = [
  'Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano',
  'Programa Municipal de Desarrollo Urbano',
  'Programa de Ordenamiento Ecológico Local del Territorio',
  'Programa de Ordenamiento Ecológico Participativo Local',
  'Programa Director Urbano'
] as const

const OPCIONES_FECHA = [
  2000, 2004, 2005, 2008, 2009, 2010, 2014, 2018, 2020, 2022, 2023, 2024, 2025
]

const OPCIONES_VIGENCIA = ['20 años', '25 años'] as const

const MUNICIPIOS = [
  'Calakmul',
  'Calkiní',
  'Campeche',
  'Candelaria',
  'Carmen',
  'Champotón',
  'Dzitbalché',
  'Escárcega',
  'Hecelchakán',
  'Hopelchén',
  'Palizada',
  'Seybaplaya',
  'Tenabo'
] as const

export default function Catalogo() {
  const [searchParams] = useSearchParams()

  const [busqueda, setBusqueda] = useState('')
  const [escalasSel, setEscalasSel] = useState<string[]>([])
  const [tiposSel, setTiposSel] = useState<string[]>([])
  const [anioSel, setAnioSel] = useState<number | null>(null)
  const [vigenciasSel, setVigenciasSel] = useState<string[]>([])
  // Vigente / Caduco: lo fijan las cifras del resumen
  const [versionSel, setVersionSel] = useState<string | null>(null)
  const [municipioSel, setMunicipioSel] = useState<string | null>(() => {
    const param = searchParams.get('municipio')
    if (!param) return null
    const cleanParam = param.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    return MUNICIPIOS.find(
      (m) => m.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() === cleanParam
    ) || null
  })
  const [showMuniDropdown, setShowMuniDropdown] = useState(false)
  const [showAnioDropdown, setShowAnioDropdown] = useState(false)
  const [selectedInst, setSelectedInst] = useState<Instrumento | null>(null)

  // Enlaces a la publicación oficial, desde Ficha-tecnica.xlsx (ver
  // scripts/actualizar-datos.py). Se cruzan por la clave del instrumento.
  const [publicaciones, setPublicaciones] = useState<Record<string, PublicacionInstrumento>>({})
  useEffect(() => {
    getPublicacionesInstrumentos().then(setPublicaciones)
  }, [])

  const muniRef = useRef<HTMLDivElement>(null)
  const anioRef = useRef<HTMLDivElement>(null)

  // Sincronizar si cambia el parámetro municipio en la URL
  useEffect(() => {
    const param = searchParams.get('municipio')
    if (param) {
      const cleanParam = param.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      const match = MUNICIPIOS.find(
        (m) => m.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim() === cleanParam
      )
      if (match) {
        setMunicipioSel(match)
      }
    }
  }, [searchParams])

  // Cerrar desplegables al hacer clic fuera o con Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (muniRef.current && !muniRef.current.contains(e.target as Node)) {
        setShowMuniDropdown(false)
      }
      if (anioRef.current && !anioRef.current.contains(e.target as Node)) {
        setShowAnioDropdown(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedInst(null)
        setShowMuniDropdown(false)
        setShowAnioDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleItem = <T,>(list: T[], item: T, setter: (val: T[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item])
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setEscalasSel([])
    setTiposSel([])
    setAnioSel(null)
    setVigenciasSel([])
    setVersionSel(null)
    setMunicipioSel(null)
  }

  const filtrosActivosTotal =
    (busqueda ? 1 : 0) +
    escalasSel.length +
    tiposSel.length +
    (anioSel !== null ? 1 : 0) +
    vigenciasSel.length +
    (versionSel ? 1 : 0) +
    (municipioSel ? 1 : 0)

  // Filtrado y ordenamiento estricto por Tipo de Instrumento.
  // `omitir` deja fuera un filtro: el resumen cuenta cada tipo (y cada
  // vigencia) sin el filtro de su propia dimensión, para no quedar en ceros.
  const cumple = (inst: Instrumento, omitir: 'tipo' | 'version' | null = null) => {
    const query = busqueda.toLowerCase().trim()
    if (query) {
      const matchesName = inst.nombre?.toLowerCase().includes(query)
      const matchesId = inst.id?.toLowerCase().includes(query)
      if (!matchesName && !matchesId) return false
    }
    if (municipioSel && inst.municipio !== municipioSel) return false
    if (escalasSel.length > 0 && !escalasSel.includes(inst.escala)) return false
    if (omitir !== 'tipo' && tiposSel.length > 0 && !tiposSel.includes(inst.tipo)) return false
    if (anioSel !== null && inst.fechaPublicacion !== anioSel) return false
    if (vigenciasSel.length > 0 && !vigenciasSel.includes(inst.vigencia)) return false
    if (omitir !== 'version' && versionSel && inst.version !== versionSel) return false
    return true
  }

  const instrumentosFiltrados = useMemo(() => {
    return INSTRUMENTOS_DATA.filter((inst) => cumple(inst)).sort((a, b) => {
      const oA = ORDEN_TIPO[a.tipo] ?? 99
      const oB = ORDEN_TIPO[b.tipo] ?? 99
      if (oA !== oB) return oA - oB
      return (b.fechaPublicacion || 0) - (a.fechaPublicacion || 0)
    })
  }, [busqueda, municipioSel, escalasSel, tiposSel, anioSel, vigenciasSel, versionSel]) // eslint-disable-line react-hooks/exhaustive-deps

  const sinFiltroTipo = useMemo(() => INSTRUMENTOS_DATA.filter((i) => cumple(i, 'tipo')),
    [busqueda, municipioSel, escalasSel, anioSel, vigenciasSel, versionSel]) // eslint-disable-line react-hooks/exhaustive-deps
  const sinFiltroVersion = useMemo(() => INSTRUMENTOS_DATA.filter((i) => cumple(i, 'version')),
    [busqueda, municipioSel, escalasSel, tiposSel, anioSel, vigenciasSel]) // eslint-disable-line react-hooks/exhaustive-deps

  // Contadores reactivos
  const counts = useMemo(() => {
    const cEscala: Record<string, number> = {}
    const cTipo: Record<string, number> = {}
    const cAnio: Record<number, number> = {}
    const cVigencia: Record<string, number> = {}
    const cMuni: Record<string, number> = {}

    INSTRUMENTOS_DATA.forEach((i) => {
      cEscala[i.escala] = (cEscala[i.escala] || 0) + 1
      cTipo[i.tipo] = (cTipo[i.tipo] || 0) + 1
      cAnio[i.fechaPublicacion] = (cAnio[i.fechaPublicacion] || 0) + 1
      cVigencia[i.vigencia] = (cVigencia[i.vigencia] || 0) + 1
      if (i.municipio) cMuni[i.municipio] = (cMuni[i.municipio] || 0) + 1
    })

    return { cEscala, cTipo, cAnio, cVigencia, cMuni }
  }, [])

  const getBadgeClass = (tipo: string) => {
    if (tipo.includes('Estatal')) return 'badge-tipo--estatal'
    if (tipo.includes('Municipal')) return 'badge-tipo--municipal'
    if (tipo.includes('Ecológico')) return 'badge-tipo--ecologico'
    return 'badge-tipo--director'
  }

  return (
    <div className="page-shell catalogo-page">
      <Header />
      <Navbar />

      <main id="main-content" className="catalogo-container">
        {/* Encabezado */}
        <section className="catalogo-header">
          <h1 className="catalogo-title">Instrumentos Normativos</h1>
          <p className="catalogo-desc">
            Consulta los instrumentos de ordenamiento territorial, ecológico y desarrollo urbano del
            Estado de Campeche y sus municipios.
          </p>
        </section>

        {/* Buscador Superior */}
        <section className="catalogo-search-wrapper" aria-label="Buscador de instrumentos">
          <div className="catalogo-search-row">
            <div className="catalogo-search-input-box">
              <Search size={18} className="catalogo-search-icon" aria-hidden="true" />
              <input
                type="text"
                className="catalogo-search-input"
                placeholder="Buscar por denominación o clave (ej. PDU-ESC)..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar instrumentos por nombre o clave"
              />
              {busqueda && (
                <button
                  type="button"
                  className="catalogo-search-clear"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Selector Desplegable de Municipio (al extremo derecho de la barra de búsqueda) */}
            <div className="catalogo-muni-dropdown-container" ref={muniRef}>
              <button
                id="municipio-search"
                type="button"
                onClick={() => setShowMuniDropdown(!showMuniDropdown)}
                className="catalogo-dropdown-btn w-full"
                aria-label="Filtrar por municipio"
                aria-expanded={showMuniDropdown}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {municipioSel || 'Todos los municipios'}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--c-gray-md)',
                    transition: 'transform 0.2s',
                    transform: showMuniDropdown ? 'rotate(180deg)' : 'none',
                    flexShrink: 0
                  }}
                />
              </button>

              {showMuniDropdown && (
                <ul className="catalogo-dropdown-menu" role="listbox">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMunicipioSel(null)
                        setShowMuniDropdown(false)
                      }}
                      className={`catalogo-dropdown-item ${!municipioSel ? 'catalogo-dropdown-item--active' : ''}`}
                    >
                      <span>Todos los municipios</span>
                    </button>
                  </li>
                  {MUNICIPIOS.map((muni) => (
                    <li key={muni}>
                      <button
                        type="button"
                        onClick={() => {
                          setMunicipioSel(muni)
                          setShowMuniDropdown(false)
                        }}
                        className={`catalogo-dropdown-item ${municipioSel === muni ? 'catalogo-dropdown-item--active' : ''}`}
                      >
                        <span>{muni}</span>
                        <span className="filter-count">{counts.cMuni[muni] || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="catalogo-meta-bar">
            <span>
              Mostrando <strong>{instrumentosFiltrados.length}</strong> de{' '}
              <strong>{INSTRUMENTOS_DATA.length}</strong> instrumentos
            </span>

            {filtrosActivosTotal > 0 && (
              <button
                type="button"
                className="catalogo-reset-btn"
                onClick={limpiarFiltros}
              >
                <RotateCcw size={14} />
                Limpiar filtros ({filtrosActivosTotal})
              </button>
            )}
          </div>
        </section>

        {/* Resumen: cifras y gráfica de la selección actual */}
        <ResumenCatalogo
          lista={instrumentosFiltrados}
          listaTipos={sinFiltroTipo}
          listaVersion={sinFiltroVersion}
          total={INSTRUMENTOS_DATA.length}
          filtrado={filtrosActivosTotal > 0}
          tiposSel={tiposSel}
          onTipo={(tipo) => toggleItem(tiposSel, tipo, setTiposSel)}
          versionSel={versionSel}
          onVersion={setVersionSel}
        />

        {/* Estructura 2 Columnas: Parámetros de Búsqueda a la Izquierda + Lista a la Derecha */}
        <div className="catalogo-grid">
          {/* Barra Lateral Izquierda */}
          <aside className="catalogo-sidebar" aria-label="Parámetros de búsqueda">
            <div className="catalogo-sidebar-header">
              <h2 className="catalogo-sidebar-title">
                <Filter size={16} />
                Parámetros de Búsqueda
              </h2>
              {filtrosActivosTotal > 0 && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--c-guinda)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Reiniciar
                </button>
              )}
            </div>

            {/* Filtro: Escala */}
            <div className="filter-group">
              <h3 className="filter-group-title">Escala</h3>
              {OPCIONES_ESCALA.map((escala) => (
                <label key={escala} className="filter-option">
                  <span className="filter-option-label" style={{ textTransform: 'none', fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={escalasSel.includes(escala)}
                      onChange={() => toggleItem(escalasSel, escala, setEscalasSel)}
                    />
                    <span style={{ textTransform: 'none', fontWeight: 400 }}>{escala}</span>
                  </span>
                  <span className="filter-count">{counts.cEscala[escala] || 0}</span>
                </label>
              ))}
            </div>

            {/* Filtro: Tipo de Instrumento */}
            <div className="filter-group">
              <h3 className="filter-group-title">Tipo de Instrumento</h3>
              {OPCIONES_TIPO.map((tipo) => (
                <label key={tipo} className="filter-option">
                  <span className="filter-option-label" style={{ textTransform: 'none', fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={tiposSel.includes(tipo)}
                      onChange={() => toggleItem(tiposSel, tipo, setTiposSel)}
                    />
                    <span style={{ textTransform: 'none', fontWeight: 400 }}>{tipo}</span>
                  </span>
                  <span className="filter-count">{counts.cTipo[tipo] || 0}</span>
                </label>
              ))}
            </div>

            {/* Filtro: Vigencia */}
            <div className="filter-group">
              <h3 className="filter-group-title">Vigencia</h3>
              {OPCIONES_VIGENCIA.map((vig) => (
                <label key={vig} className="filter-option">
                  <span className="filter-option-label" style={{ textTransform: 'none', fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={vigenciasSel.includes(vig)}
                      onChange={() => toggleItem(vigenciasSel, vig, setVigenciasSel)}
                    />
                    <span style={{ textTransform: 'none', fontWeight: 400 }}>{vig}</span>
                  </span>
                  <span className="filter-count">{counts.cVigencia[vig] || 0}</span>
                </label>
              ))}
            </div>

            {/* Filtro: Año de Publicación (Desplegable idéntico a municipio-search) */}
            <div className="filter-group">
              <h3 className="filter-group-title">Año de Publicación</h3>
              <div className="relative" ref={anioRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowAnioDropdown(!showAnioDropdown)}
                  className="catalogo-dropdown-btn w-full"
                  aria-label="Filtrar por año de publicación"
                  aria-expanded={showAnioDropdown}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <Calendar size={15} style={{ color: 'var(--c-gray-md)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {anioSel !== null ? `Año ${anioSel}` : 'Todos los años'}
                    </span>
                  </span>
                  <ChevronDown
                    size={15}
                    style={{
                      color: 'var(--c-gray-md)',
                      transition: 'transform 0.2s',
                      transform: showAnioDropdown ? 'rotate(180deg)' : 'none',
                      flexShrink: 0
                    }}
                  />
                </button>

                {showAnioDropdown && (
                  <ul className="catalogo-dropdown-menu catalogo-dropdown-menu--sidebar" role="listbox">
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setAnioSel(null)
                          setShowAnioDropdown(false)
                        }}
                        className={`catalogo-dropdown-item ${anioSel === null ? 'catalogo-dropdown-item--active' : ''}`}
                      >
                        <span>Todos los años</span>
                      </button>
                    </li>
                    {OPCIONES_FECHA.map((anio) => (
                      <li key={anio}>
                        <button
                          type="button"
                          onClick={() => {
                            setAnioSel(anio)
                            setShowAnioDropdown(false)
                          }}
                          className={`catalogo-dropdown-item ${anioSel === anio ? 'catalogo-dropdown-item--active' : ''}`}
                        >
                          <span>{anio}</span>
                          <span className="filter-count">{counts.cAnio[anio] || 0}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </aside>

          {/* Columna Derecha: Vista de Instrumentos en Lista */}
          <section className="catalogo-list" aria-label="Lista de instrumentos">
            {instrumentosFiltrados.length === 0 ? (
              <div className="catalogo-empty">
                <FileText size={48} color="var(--c-beige-dk)" />
                <h3 className="catalogo-empty-title">No se encontraron instrumentos</h3>
                <p className="catalogo-empty-desc">
                  Intenta modificar los parámetros seleccionados o realiza una búsqueda con otros
                  términos.
                </p>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={limpiarFiltros}
                  style={{ gap: 8, padding: '8px 18px', fontSize: 13 }}
                >
                  <RotateCcw size={15} />
                  Restablecer parámetros
                </button>
              </div>
            ) : (
              instrumentosFiltrados.map((inst) => (
                <article
                  key={inst.id}
                  className="instrument-card"
                  onClick={() => setSelectedInst(inst)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedInst(inst)
                    }
                  }}
                  aria-label={`Ver detalles de ${inst.nombre}`}
                >
                  {/* Top Badges */}
                  <div className="instrument-card-top">
                    <div className="instrument-badges">
                      <span className={`badge-tipo ${getBadgeClass(inst.tipo)}`}>
                        {inst.tipo}
                      </span>
                      <span className="badge-escala">{inst.escala}</span>
                    </div>

                    <span className="badge-status">
                      <span className="badge-status-dot" aria-hidden="true" />
                      {inst.version || 'Vigente'}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="instrument-title">{inst.nombre}</h3>

                  {/* Metadata Row */}
                  <div className="instrument-meta-grid">
                    <span className="instrument-meta-item">
                      <strong>Clave:</strong> {inst.id}
                    </span>

                    {inst.municipio && (
                      <span className="instrument-meta-item">
                        <MapPin size={14} />
                        {inst.municipio}
                      </span>
                    )}

                    <span className="instrument-meta-item">
                      <Calendar size={14} />
                      {inst.fechaPublicacion}
                    </span>

                    <span className="instrument-meta-item">
                      <Clock size={14} />
                      {inst.vigencia}
                    </span>

                    {inst.dependencia && (
                      <span className="instrument-meta-item">
                        <Building2 size={14} />
                        {inst.dependencia}
                      </span>
                    )}

                    <div className="instrument-actions-group">
                      <button
                        type="button"
                        className="instrument-view-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedInst(inst)
                        }}
                      >
                        Ver ficha técnica
                        <ChevronRight size={14} />
                      </button>

                      {publicaciones[inst.id]?.linkPublicacion && (
                        <a
                          href={publicaciones[inst.id]!.linkPublicacion!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="instrument-download-action-btn"
                          title="Abrir la publicación oficial del instrumento (nueva pestaña)"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} />
                          Ver publicación
                        </a>
                      )}

                      {inst.linkPdf ? (
                        <a
                          href={assetUrl(inst.linkPdf)}
                          download={`${inst.id}.pdf`}
                          className="instrument-download-action-btn"
                          title="Descargar documento oficial (PDF)"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={14} />
                          Descargar PDF
                        </a>
                      ) : (
                        <span className="instrument-no-pdf">PDF en digitalización</span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </main>

      {/* Modal / Vista de Detalle de la Ficha Técnica */}
      {selectedInst && (
        <div
          className="catalogo-modal-backdrop"
          onClick={() => setSelectedInst(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-instrumento-titulo"
        >
          <div
            className="catalogo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="catalogo-modal-header">
              <div>
                <span className={`badge-tipo ${getBadgeClass(selectedInst.tipo)}`}>
                  {selectedInst.tipo}
                </span>
                <h2 id="modal-instrumento-titulo" className="catalogo-modal-title">
                  {selectedInst.nombre}
                </h2>
              </div>
              <button
                type="button"
                className="catalogo-modal-close"
                onClick={() => setSelectedInst(null)}
                aria-label="Cerrar ficha técnica"
              >
                <X size={20} />
              </button>
            </div>

            <div className="catalogo-modal-body">
              <div>
                <h3 className="detail-section-title">
                  <FileText size={15} />
                  Ficha Técnica Institucional
                </h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Clave de Registro</div>
                    <div className="detail-val">{selectedInst.id}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Escala Territorial</div>
                    <div className="detail-val">{selectedInst.escala}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Municipio de Incidencia</div>
                    <div className="detail-val">
                      {selectedInst.municipio || 'Nivel Estatal (Todo el territorio)'}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Fecha de Publicación</div>
                    <div className="detail-val">{selectedInst.fechaPublicacion}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Vigencia Estipulada</div>
                    <div className="detail-val">{selectedInst.vigencia}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Estado de Vigencia</div>
                    <div className="detail-val" style={{ color: '#059669', fontWeight: 600 }}>
                      {selectedInst.version || 'Vigente'}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Dependencia Encargada</div>
                    <div className="detail-val">{selectedInst.dependencia}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Ámbito de Gestión</div>
                    <div className="detail-val">
                      {selectedInst.ambito || 'Gestión Territorial y Urbana'}
                    </div>
                  </div>

                  {selectedInst.tipoZonificacion && (
                    <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                      <div className="detail-label">Tipo de Zonificación</div>
                      <div className="detail-val">{selectedInst.tipoZonificacion}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acceso a Documentación */}
              <div>
                <h3 className="detail-section-title">
                  <ExternalLink size={15} />
                  Acceso a Documentos y Anexos
                </h3>
                <div className="modal-doc-actions">
                  {publicaciones[selectedInst.id]?.linkPublicacion ? (
                    <a
                      href={publicaciones[selectedInst.id]!.linkPublicacion!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-doc-btn modal-doc-btn--primary"
                      title="Abrir la publicación oficial del instrumento (nueva pestaña)"
                    >
                      <ExternalLink size={16} />
                      Ver publicación oficial
                    </a>
                  ) : publicaciones[selectedInst.id]?.notaPublicacion ? (
                    <span className="instrument-no-pdf">{publicaciones[selectedInst.id]!.notaPublicacion}</span>
                  ) : null}
                  {selectedInst.linkPdf ? (
                    <a
                      href={assetUrl(selectedInst.linkPdf)}
                      download={`${selectedInst.id}.pdf`}
                      className="modal-doc-btn modal-doc-btn--primary"
                      title="Descargar documento oficial (PDF)"
                    >
                      <Download size={16} />
                      Descargar PDF
                    </a>
                  ) : (
                    <span className="instrument-no-pdf">PDF en digitalización</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Underfooter />
    </div>
  )
}
