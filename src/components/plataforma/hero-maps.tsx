import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X, MousePointerClick } from 'lucide-react'
import ImageSlot from '../common/image-slot'
import { assetUrl } from '../../lib/assetUrl'
import {
  INDICADORES_ESTADO,
  INDICADORES_MUNICIPIOS,
  formatoMiles,
  porcentaje,
} from '../../data/indicadoresTerritoriales'
import {
  CAMPECHE_SVG_VIEWBOX,
  CAMPECHE_STATE_PATH,
  CAMPECHE_MUNICIPALITIES,
  type MunicipalityInfo,
} from '../../data/campecheSilhouetteSvg'
import { INSTRUMENTOS_DATA } from '../../data/instrumentosData'

/* ─── 1. Mapa Interactivo del Estado de Campeche (Fase 0) ──────────────── */
export interface HeroCampecheMapProps {
  isVisible: boolean
}

export function HeroCampecheMap({ isVisible }: HeroCampecheMapProps) {
  const [selectedMun, setSelectedMun] = useState<MunicipalityInfo | null>(null)
  const [hoveredMun, setHoveredMun] = useState<MunicipalityInfo | null>(null)

  // Instrumentos reales vinculados a la entidad estatal o al municipio seleccionado
  const activeInstruments = useMemo(() => {
    if (!selectedMun) {
      return INSTRUMENTOS_DATA.filter((i) => i.escala === 'Estatal')
    }
    const cleanName = selectedMun.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

    return INSTRUMENTOS_DATA.filter(
      (i) =>
        i.municipio &&
        i.municipio
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim() === cleanName &&
        i.id !== 'PDU-CAN-CAM-2000' &&
        i.id !== 'PDU-PAL-CAM-2000'
    ).sort((a, b) => {
      const getScore = (t: string) => {
        if (t.includes('Municipal de Desarrollo Urbano')) return 1
        if (t.includes('Ordenamiento Ecológico')) return 2
        if (t.includes('Director Urbano')) return 3
        return 4
      }
      const scoreDiff = getScore(a.tipo) - getScore(b.tipo)
      if (scoreDiff !== 0) return scoreDiff
      return b.fechaPublicacion - a.fechaPublicacion
    })
  }, [selectedMun])

  const totalVigentes = useMemo(() => {
    if (selectedMun) {
      return activeInstruments.length
    }
    return INSTRUMENTOS_DATA.filter(
      (i) => i.id !== 'PDU-CAN-CAM-2000' && i.id !== 'PDU-PAL-CAM-2000'
    ).length
  }, [selectedMun, activeInstruments])

  const mainInstrument = activeInstruments[0] || null

  // El indicador "haz clic" se retira con la primera interacción sobre el mapa
  const [hasInteracted, setHasInteracted] = useState(false)

  // Indicadores del panel: estatales o del municipio seleccionado
  const indicadores = useMemo(() => {
    if (!selectedMun) {
      return {
        urbanas: INDICADORES_ESTADO.localidadesUrbanas,
        rurales: INDICADORES_ESTADO.localidadesRurales as number | null,
        pobUrbana: INDICADORES_ESTADO.poblacionUrbana,
        pobRural: INDICADORES_ESTADO.poblacionRural,
        pobTotal: INDICADORES_ESTADO.poblacionTotal,
        anio: INDICADORES_ESTADO.anioCreacion as number | null,
        creacionDetalle: INDICADORES_ESTADO.creacionDetalle,
        segregadoDe: undefined as string | undefined,
        pib: INDICADORES_ESTADO.pibParticipacionNacional as number | null,
      }
    }
    const m = INDICADORES_MUNICIPIOS[selectedMun.id]
    return {
      urbanas: m?.localidadesUrbanas ?? 0,
      rurales: null,
      pobUrbana: m?.poblacionUrbana ?? 0,
      pobRural: m?.poblacionRural ?? 0,
      pobTotal: (m?.poblacionUrbana ?? 0) + (m?.poblacionRural ?? 0),
      anio: m?.anioCreacion ?? null,
      creacionDetalle: m?.anioCreacion ? `Decreto de creación: ${m.anioCreacion}` : 'Año de creación por confirmar',
      segregadoDe: m?.segregadoDe,
      pib: m?.pibParticipacionEstatal ?? null,
    }
  }, [selectedMun])

  const handleMunClick = (mun: MunicipalityInfo) => {
    setHasInteracted(true)
    try {
      if (selectedMun?.name === mun.name) {
        setSelectedMun(null)
      } else {
        setSelectedMun(mun)
      }
    } catch (err) {
      console.error('Error al seleccionar municipio:', err)
    }
  }

  const handleReset = () => {
    setSelectedMun(null)
    setHoveredMun(null)
  }

  return (
    <div
      className={`hero-fase0-map-wrapper ${isVisible ? 'is-visible' : 'is-faded'}`}
      aria-hidden={!isVisible}
    >
      <div className="hero-fase0-map-container">
        {/* Gráfico Vectorial Interactivo del Estado de Campeche */}
        <div className="hero-fase0-svg-canvas">
          <svg
            viewBox={CAMPECHE_SVG_VIEWBOX}
            className="campeche-vector-svg"
            role="img"
            aria-label="Mapa cartográfico interactivo del Estado de Campeche y sus 13 municipios"
          >
            <defs>
              {/* Degradado institucional para contorno exterior */}
              <linearGradient id="campecheOutlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9B2242" />
                <stop offset="50%" stopColor="#BCA986" />
                <stop offset="100%" stopColor="#691B31" />
              </linearGradient>

              {/* Degradado suave de relleno para el territorio */}
              <linearGradient id="campecheFillGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#F3EDE2" stopOpacity="0.75" />
              </linearGradient>

              {/* Resplandor tenue */}
              <filter id="mapContourGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#9B2242" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Red de coordenadas geoespaciales decorativas */}
            <g className="campeche-geo-grid" opacity="0.35">
              <line x1="80" y1="40" x2="80" y2="460" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="180" y1="40" x2="180" y2="460" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="280" y1="40" x2="280" y2="460" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="380" y1="40" x2="380" y2="460" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="480" y1="40" x2="480" y2="460" stroke="#DDD6CA" strokeDasharray="3 5" />

              <line x1="30" y1="100" x2="520" y2="100" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="30" y1="200" x2="520" y2="200" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="30" y1="300" x2="520" y2="300" stroke="#DDD6CA" strokeDasharray="3 5" />
              <line x1="30" y1="400" x2="520" y2="400" stroke="#DDD6CA" strokeDasharray="3 5" />
            </g>

            {/* Base de relleno general del Estado */}
            <path
              d={CAMPECHE_STATE_PATH}
              fill="url(#campecheFillGrad)"
              className="campeche-state-fill"
            />

            {/* Polígonos de los 13 Municipios */}
            <g className="campeche-mun-group">
              {CAMPECHE_MUNICIPALITIES.map((mun) => {
                const isSelected = selectedMun?.name === mun.name
                const isHovered = hoveredMun?.name === mun.name
                const isActive = isSelected || isHovered

                return (
                  <path
                    key={mun.name}
                    d={mun.path}
                    className={`campeche-mun-path ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}`}
                    onClick={() => handleMunClick(mun)}
                    onMouseEnter={() => setHoveredMun(mun)}
                    onMouseLeave={() => setHoveredMun(null)}
                    style={{
                      fill: isSelected
                        ? '#EAE0D0'
                        : isHovered
                        ? '#F4EDE3'
                        : undefined,
                      stroke: isActive ? 'var(--c-guinda)' : undefined,
                      strokeWidth: isSelected ? '2.2px' : isHovered ? '1.8px' : undefined,
                    }}
                  >
                    <title>{`${mun.name} — ${mun.superficie}`}</title>
                  </path>
                )
              })}
            </g>

            {/* Silueta exterior oficial unificada trazada con animación */}
            <path
              d={CAMPECHE_STATE_PATH}
              fill="none"
              stroke="url(#campecheOutlineGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#mapContourGlow)"
              className="campeche-state-contour-animated"
              pointerEvents="none"
            />

            {/* Balizas y marcadores de centroide para cada municipio */}
            {CAMPECHE_MUNICIPALITIES.map((mun) => {
              const isSelected = selectedMun?.name === mun.name
              const isHovered = hoveredMun?.name === mun.name
              const isActive = isSelected || isHovered

              return (
                <g
                  key={`node-${mun.name}`}
                  className={`campeche-hub-node ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleMunClick(mun)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulso radar activo solo si está seleccionado o en hover */}
                  {isActive && (
                    <circle
                      cx={mun.x}
                      cy={mun.y}
                      r="8"
                      className="campeche-radar-ring"
                    />
                  )}

                  {/* Núcleo del marcador de municipio */}
                  <circle
                    cx={mun.x}
                    cy={mun.y}
                    r={isSelected ? 5 : isHovered ? 4.2 : 3}
                    className="campeche-hub-dot"
                    style={{
                      fill: isSelected ? 'var(--c-guinda)' : isHovered ? '#BCA986' : '#9B2242',
                      stroke: '#FFFFFF',
                      strokeWidth: isSelected ? 2 : 1.2,
                    }}
                  />

                  {/* La etiqueta se muestra exclusivamente cuando el municipio está seleccionado o en hover */}
                  {isActive && (
                    <g className="campeche-active-label-group">
                      <rect
                        x={mun.x + 8}
                        y={mun.y - 18}
                        width={Math.max(mun.name.length * 8 + 38, 110)}
                        height="32"
                        rx="5"
                        fill="#FFFFFF"
                        stroke={isSelected ? 'var(--c-guinda)' : 'var(--c-dorado)'}
                        strokeWidth="1.5"
                        filter="drop-shadow(0 4px 10px rgba(0,0,0,0.15))"
                      />
                      <text
                        x={mun.x + 16}
                        y={mun.y - 4}
                        className="campeche-active-label-title"
                        fill="#1F2937"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="var(--font-body)"
                      >
                        {mun.name}
                      </text>
                      <text
                        x={mun.x + 16}
                        y={mun.y + 9}
                        fill="var(--c-guinda)"
                        fontSize="9.5"
                        fontWeight="600"
                        fontFamily="var(--font-body)"
                      >
                        {mun.superficie}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Indicador de interactividad: desaparece en cuanto el usuario toca un municipio */}
        {!hasInteracted && (
          <div className="hero-fase0-map-hint" aria-hidden="true">
            <MousePointerClick className="w-4 h-4" />
            <span>Haz clic en un municipio para ver sus datos</span>
          </div>
        )}

        {/* Tarjetas informativas laterales con métricas territoriales */}
        <div className="hero-fase0-sidebar">
          <div className={`hero-fase0-meta-card ${selectedMun ? 'hero-fase0-meta-card--mun' : ''}`}>
            <div className="hero-fase0-meta-text">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="hero-fase0-meta-badge">
                  {selectedMun ? 'Municipio Seleccionado' : 'Entidad Federativa'}
                </span>
                {selectedMun && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="hero-fase0-close-btn"
                    aria-label="Deseleccionar municipio y ver estado general"
                    title="Deseleccionar municipio"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h3 className="hero-fase0-meta-title">
                {selectedMun ? selectedMun.name : 'Estado de Campeche'}
              </h3>
              <p className="hero-fase0-meta-desc">
                {selectedMun
                  ? selectedMun.detalles
                  : 'Entidad soberana integrada por 13 municipios en un territorio estratégico con gran biodiversidad, patrimonio biocultural y vocación marítima e industrial.'}
              </p>
            </div>

            {/* Imagen del territorio municipal. Mientras no haya fotografía en
                public/img/municipios/<id>.jpg se dibuja el contorno del municipio. */}
            {selectedMun && (
              <ImageSlot
                key={selectedMun.id}
                src={assetUrl(`/img/municipios/${selectedMun.id}.jpg`)}
                alt={`Territorio municipal de ${selectedMun.name}`}
                className="hero-fase0-mun-img"
                fallback={<MunicipioContorno mun={selectedMun} />}
              />
            )}
          </div>

          <div className="hero-fase0-metrics-grid">
            {/* Municipios / Cabecera */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {selectedMun ? selectedMun.cabecera : '13'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Cabecera Municipal' : 'Municipios'}
              </span>
            </div>

            {/* Extensión territorial */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {selectedMun ? selectedMun.superficie : '57,485 km²'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Superficie Municipal' : 'Extensión Territorial'}
              </span>
            </div>

            {/* Población */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {selectedMun ? selectedMun.poblacion : `${formatoMiles(INDICADORES_ESTADO.poblacionTotal)} hab.`}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Población Municipal' : 'Población Estatal (INEGI 2020)'}
              </span>
            </div>

            {/* Localidades urbanas */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {formatoMiles(indicadores.urbanas)}
                <small className="hero-fase0-metric-pct">{porcentaje(indicadores.pobUrbana, indicadores.pobTotal)}</small>
              </span>
              <span className="hero-fase0-metric-lbl">Localidades urbanas</span>
              <span className="hero-fase0-metric-sub">{formatoMiles(indicadores.pobUrbana)} hab.</span>
            </div>

            {/* Localidades rurales */}
            <div className="hero-fase0-metric">
              {/* Sin conteo oficial de localidades rurales por municipio: ahí se muestra su población */}
              <span className="hero-fase0-metric-val">
                {indicadores.rurales !== null ? formatoMiles(indicadores.rurales) : formatoMiles(indicadores.pobRural)}
                <small className="hero-fase0-metric-pct">{porcentaje(indicadores.pobRural, indicadores.pobTotal)}</small>
              </span>
              <span className="hero-fase0-metric-lbl">
                {indicadores.rurales !== null ? 'Localidades rurales' : 'Habitantes en localidades rurales'}
              </span>
              {indicadores.rurales !== null && (
                <span className="hero-fase0-metric-sub">{formatoMiles(indicadores.pobRural)} hab.</span>
              )}
            </div>

            {/* Año de creación */}
            <div className="hero-fase0-metric" title={indicadores.creacionDetalle}>
              <span className={`hero-fase0-metric-val ${indicadores.anio === null ? 'is-pending' : ''}`}>
                {indicadores.anio ?? 'Por confirmar'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Creación del municipio' : 'Creación del estado'}
              </span>
              {indicadores.segregadoDe && (
                <span className="hero-fase0-metric-sub">Segregado de {indicadores.segregadoDe}</span>
              )}
            </div>

            {/* Aportación al PIB */}
            <div className="hero-fase0-metric">
              <span className={`hero-fase0-metric-val ${indicadores.pib === null ? 'is-pending' : ''}`}>
                {indicadores.pib !== null ? `${indicadores.pib}%` : 'Por confirmar'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Aportación al PIB estatal' : `Aportación al PIB nacional (${INDICADORES_ESTADO.pibAnio})`}
              </span>
            </div>

            {/* Instrumentos de planeación vigentes */}
            <div className="hero-fase0-metric hero-fase0-metric--wide">
              <span
                className="hero-fase0-metric-val hero-fase0-metric-val--instrument"
                title={mainInstrument ? `${mainInstrument.nombre} (${mainInstrument.fechaPublicacion})` : (selectedMun?.instrumentoNormativo || 'Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano')}
              >
                {mainInstrument
                  ? `${mainInstrument.nombre} (${mainInstrument.fechaPublicacion})`
                  : (selectedMun?.instrumentoNormativo || 'Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano')}
              </span>
              <div className="hero-fase0-metric-footer">
                <span className="hero-fase0-metric-lbl">
                  Instrumentos de planeación urbana y territorial vigentes: <strong>{totalVigentes}</strong>
                </span>
                <Link
                  to={selectedMun ? `/catalogo?municipio=${encodeURIComponent(selectedMun.name)}` : '/catalogo'}
                  className="hero-fase0-inst-btn hero-fase0-inst-btn--secondary"
                  title={selectedMun ? `Ver instrumentos vigentes de ${selectedMun.name} en el catálogo` : 'Explorar todos los instrumentos en el Catálogo Normativo'}
                >
                  Ver catálogo &rarr;
                </Link>
              </div>
            </div>
          </div>
          <p className="hero-fase0-source">Fuente: {INDICADORES_ESTADO.fuente}</p>
        </div>
      </div>
    </div>
  )
}

/* Contorno del municipio seleccionado, recortado a su propia extensión.
   Respaldo de la fotografía municipal: reutiliza la geometría del mapa. */
function MunicipioContorno({ mun }: { mun: MunicipalityInfo }) {
  const viewBox = useMemo(() => {
    const nums = (mun.path.match(/-?\d+(\.\d+)?/g) || []).map(Number)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (let i = 0; i + 1 < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]); maxX = Math.max(maxX, nums[i])
      minY = Math.min(minY, nums[i + 1]); maxY = Math.max(maxY, nums[i + 1])
    }
    const pad = Math.max(maxX - minX, maxY - minY) * 0.08
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
  }, [mun])

  return (
    <div className="hero-fase0-mun-contorno">
      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path d={mun.path} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}
