import { useState, useRef, useEffect, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import {
  CAMPECHE_SVG_VIEWBOX,
  CAMPECHE_STATE_PATH,
  CAMPECHE_MUNICIPALITIES,
  type MunicipalityInfo,
} from '../../data/campecheSilhouetteSvg'
import { MEXICO_DOTS_DATA } from '../../data/mexicoDotsData'
import { CAMPECHE_DOTS_DATA } from '../../data/campecheDotsData'
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

  const handleMunClick = (mun: MunicipalityInfo) => {
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

        {/* Tarjetas informativas laterales con métricas territoriales */}
        <div className="hero-fase0-sidebar">
          <div className="hero-fase0-meta-card">
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

          <div className="hero-fase0-metrics-grid">
            {/* Métrica 1: Municipios / Cabecera */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {selectedMun ? selectedMun.cabecera : '13'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Cabecera Municipal' : 'Municipios Constitucionales'}
              </span>
            </div>

            {/* Métrica 2: Extensión Territorial */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {selectedMun ? selectedMun.superficie : '57,485 km²'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Superficie Municipal' : 'Extensión Territorial'}
              </span>
            </div>

            {/* Métrica 3: Población */}
            <div className="hero-fase0-metric">
              <span className="hero-fase0-metric-val">
                {selectedMun ? selectedMun.poblacion : '928,363 hab.'}
              </span>
              <span className="hero-fase0-metric-lbl">
                {selectedMun ? 'Población Municipal' : 'Población Estatal (INEGI)'}
              </span>
            </div>

            {/* Métrica 4: Instrumento normativo vigente */}
            <div className="hero-fase0-metric">
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
                  Instrumentos vigentes {totalVigentes}
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
        </div>
      </div>
    </div>
  )
}

/* ─── 2. Mapa Punteado del Territorio Nacional (Fase 1 - Canvas Acelerado) ── */
export const HeroMexicoDots = memo(function HeroMexicoDots({ isActive = true }: { isActive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = 520
    const height = 290
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const PADDING = 10
    const scale = Math.min((width - PADDING * 2) / 640, (height - PADDING * 2) / 430)
    const offsetX = (width - 640 * scale) / 2
    const offsetY = (height - 430 * scale) / 2

    // Colores institucionales: Guinda (155, 34, 66) y Dorado Luminoso (212, 175, 55)
    const GUINDA = [155, 34, 66]
    const DORADO = [212, 175, 55]
    const CAMPECHE_DORADO = [226, 186, 104]
    const CAMPECHE_GUINDA = [130, 21, 48]

    let startTime = performance.now()

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < MEXICO_DOTS_DATA.length; i++) {
        const dot = MEXICO_DOTS_DATA[i]
        const t = ((elapsed + dot.delay) % 2.8) / 2.8
        const wave = 0.5 - 0.5 * Math.cos(t * Math.PI * 2)

        let r: number, g: number, b: number, radius: number
        if (dot.isCampeche) {
          const cWave = 1 - wave
          r = Math.round(CAMPECHE_GUINDA[0] + (CAMPECHE_DORADO[0] - CAMPECHE_GUINDA[0]) * cWave)
          g = Math.round(CAMPECHE_GUINDA[1] + (CAMPECHE_DORADO[1] - CAMPECHE_GUINDA[1]) * cWave)
          b = Math.round(CAMPECHE_GUINDA[2] + (CAMPECHE_DORADO[2] - CAMPECHE_GUINDA[2]) * cWave)
          radius = 4.2 * scale
        } else {
          r = Math.round(GUINDA[0] + (DORADO[0] - GUINDA[0]) * wave)
          g = Math.round(GUINDA[1] + (DORADO[1] - GUINDA[1]) * wave)
          b = Math.round(GUINDA[2] + (DORADO[2] - GUINDA[2]) * wave)
          radius = 3.5 * scale
        }

        ctx.beginPath()
        ctx.arc(offsetX + dot.x * scale, offsetY + dot.y * scale, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [isActive])

  return (
    <div className="hero-mexico-dots-container" aria-label="Mapa punteado del territorio nacional">
      <canvas
        ref={canvasRef}
        className="hero-mexico-dots-canvas"
        style={{
          width: '100%',
          maxWidth: 520,
          height: 'auto',
          aspectRatio: '520 / 290',
          display: 'block',
        }}
      />
    </div>
  )
})

/* ─── 3. Mapa Punteado del Estado de Campeche (Fase 3 - Canvas Acelerado) ── */
export const HeroCampecheDots = memo(function HeroCampecheDots({ isActive = true }: { isActive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = 380
    const height = 350
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const PADDING = 10
    const scale = Math.min((width - PADDING * 2) / 550, (height - PADDING * 2) / 500)
    const offsetX = (width - 550 * scale) / 2
    const offsetY = (height - 500 * scale) / 2

    // Colores institucionales: Guinda (155, 34, 66) y Dorado Luminoso (212, 175, 55)
    const GUINDA = [155, 34, 66]
    const DORADO = [212, 175, 55]

    let startTime = performance.now()

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < CAMPECHE_DOTS_DATA.length; i++) {
        const dot = CAMPECHE_DOTS_DATA[i]
        const t = ((elapsed + dot.delay) % 2.8) / 2.8
        const wave = 0.5 - 0.5 * Math.cos(t * Math.PI * 2)

        const r = Math.round(GUINDA[0] + (DORADO[0] - GUINDA[0]) * wave)
        const g = Math.round(GUINDA[1] + (DORADO[1] - GUINDA[1]) * wave)
        const b = Math.round(GUINDA[2] + (DORADO[2] - GUINDA[2]) * wave)
        const radius = 3.6 * scale

        ctx.beginPath()
        ctx.arc(offsetX + dot.x * scale, offsetY + dot.y * scale, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [isActive])

  return (
    <div className="hero-campeche-dots-container" aria-label="Mapa punteado del Estado de Campeche">
      <canvas
        ref={canvasRef}
        className="hero-campeche-dots-canvas"
        style={{
          width: '100%',
          maxWidth: 290,
          height: 'auto',
          aspectRatio: '380 / 350',
          display: 'block',
        }}
      />
    </div>
  )
})

export default HeroCampecheMap
