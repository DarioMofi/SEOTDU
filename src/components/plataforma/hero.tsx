import { useState, useEffect, useRef } from 'react'
import { FileText, Link2, Table2, Scale, Landmark } from 'lucide-react'
import { HeroCampecheMap } from './hero-maps'
import EsquemaSistema from './esquema-sistema'
import MosaicoActividades from './mosaico-actividades'
import { FundamentoLinks, MatrizVinculacion, VinculosInstrumento } from './vinculacion-instrumentos'
import { PeotduResumen } from './seccion-peotdu'
import {
  LEYES,
  ORDEN_COLORES,
  PYRAMID_TIERS,
  type OrdenGobierno,
  type PyramidTier,
} from '../../data/sistemaPlaneacion'
import { PEOTDU_PDF_OFICIAL } from '../../data/peotduEstructura'

/* ─── Configuración de Umbrales de Scroll ─────────────────────────────── */
const NAV_OFFSET = 112 // Altura combinada de Header institucional (40px) + Navbar (72px)
const SCROLL_FASE1_THRESHOLD = 50 // 1er scroll entra a Fase 1
const SCROLL_FASE2_THRESHOLD = 170 // 2do scroll entra a Fase 2 (pirámide invertida)
const SCROLL_TIER_STEP = 110 // Cada scroll posterior avanza un escalón de la pirámide (10 niveles = 1100px)
const SCROLL_FASE3_THRESHOLD = SCROLL_FASE2_THRESHOLD + SCROLL_TIER_STEP * 10 // ~1270px entra a Fase 3
const TOTAL_HERO_SCROLL = SCROLL_FASE3_THRESHOLD + 40 // 1310px: finaliza de forma continua al alcanzar Fase 3 sin zona muerta de 20%

/* ─── Instrumentos oficiales: los datos viven en data/sistemaPlaneacion ── */
export { PYRAMID_TIERS }
export type { PyramidTier }

const ORDENES: OrdenGobierno[] = ['Federal', 'Estatal', 'Municipal']

/* ─── Subcomponente: Fase 2 (Pirámide Invertida en Embudo) ────────────── */
function HeroPyramidFunnel({
  isVisible,
  activeTier,
  onTierSelect,
}: {
  isVisible: boolean
  activeTier: number
  onTierSelect?: (tierId: number) => void
}) {
  const currentTierData = PYRAMID_TIERS[activeTier - 1] || PYRAMID_TIERS[0]
  const [matrizAbierta, setMatrizAbierta] = useState(false)

  return (
    <div
      className={`hero-funnel-wrapper ${isVisible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!isVisible}
    >
      <div className="hero-funnel-inner">
        <div className="hero-funnel-header">
          <p className="hero-funnel-intro-text">
            El sistema estatal se establece en congruencia con los programas y estrategias nacionales y de
            esta se derivan y articulan ocho tipos de programas e instrumentos de ordenamiento territorial y
            desarrollo urbano.
          </p>
          {/* Código de color por orden de gobierno; se repite en cada escalón */}
          <ul className="hero-funnel-orden-legend" aria-label="Orden de gobierno">
            {ORDENES.map((o) => (
              <li key={o}>
                <span className="hero-funnel-orden-dot" style={{ background: ORDEN_COLORES[o] }} />
                {o}
              </li>
            ))}
          </ul>
        </div>

        {/* Estructura con 2 paneles laterales (Descripción y Vínculos) y la pirámide central */}
        <div className="hero-funnel-layout">
          {/* Panel Lateral Izquierdo: Descripción y fundamento jurídico */}
          <aside className="hero-funnel-side-card hero-funnel-side-card--left">
            <div className="hero-funnel-side-card__header">
              <FileText className="w-4 h-4 text-[var(--c-guinda)]" />
              <h3 className="hero-funnel-side-card__title">Descripción</h3>
            </div>
            <div className="hero-funnel-side-card__body">
              <div className="hero-funnel-side-card__meta">
                <span className="hero-funnel-side-card__num">{currentTierData.number}</span>
                <span
                  className="hero-funnel-orden-tag"
                  style={{ background: ORDEN_COLORES[currentTierData.orden] }}
                >
                  {currentTierData.orden}
                </span>
                <span className="hero-funnel-side-card__level">{currentTierData.level}</span>
              </div>
              <h4 className="hero-funnel-side-card__instrument-title">{currentTierData.title}</h4>
              <p className="hero-funnel-side-card__text">{currentTierData.description}</p>
              <span className="hero-funnel-side-card__subtitle">Fundamento</span>
              <FundamentoLinks tier={currentTierData} />
            </div>
          </aside>

          {/* Pirámide Invertida Central */}
          <div
            className="hero-funnel-pyramid"
            role="region"
            aria-label="Pirámide invertida de 10 instrumentos de planeación"
          >
            {PYRAMID_TIERS.map((tier) => {
              const isActive = activeTier === tier.id
              const isCompleted = activeTier > tier.id
              const tierAccentColor = tier.textColor === '#FFFFFF' ? '#EAE5DC' : 'var(--c-guinda)'

              return (
                <div
                  key={tier.id}
                  style={{ width: `${tier.widthPercent}%` }}
                  className={`hero-funnel-tier ${
                    isActive ? 'is-active' : isCompleted ? 'is-completed' : 'is-upcoming'
                  }`}
                  onClick={() => onTierSelect?.(tier.id)}
                  title={`Escalón ${tier.number}: ${tier.title} (${tier.orden})`}
                >
                  <div
                    className="hero-funnel-tier__content"
                    style={{
                      backgroundColor: tier.bgColor,
                      color: tier.textColor,
                      boxShadow: `inset 6px 0 0 ${ORDEN_COLORES[tier.orden]}`,
                    }}
                  >
                    <span
                      className="hero-funnel-tier__num"
                      style={{
                        color: tierAccentColor,
                      }}
                    >
                      {tier.number}
                    </span>

                    <span className="hero-funnel-tier__title">{tier.title}</span>

                    <div className="hero-funnel-tier__right">
                      <span
                        className="hero-funnel-tier__orden"
                        style={{ background: ORDEN_COLORES[tier.orden] }}
                        aria-label={`Orden ${tier.orden}`}
                      >
                        {tier.orden.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Panel Lateral Derecho: Vínculos (diagrama de nodos) */}
          <aside className="hero-funnel-side-card hero-funnel-side-card--right">
            <div className="hero-funnel-side-card__header">
              <Link2 className="w-4 h-4 text-[var(--c-guinda)]" />
              <h3 className="hero-funnel-side-card__title">Vínculos</h3>
            </div>
            <div className="hero-funnel-side-card__body">
              <span className="hero-funnel-side-card__subtitle">Articulación y correspondencia</span>
              <VinculosInstrumento tier={currentTierData} />
              <button
                type="button"
                className="hero-funnel-matriz-btn"
                onClick={() => setMatrizAbierta(true)}
              >
                <Table2 className="w-3.5 h-3.5" aria-hidden="true" /> Ver matriz completa
              </button>
            </div>
          </aside>
        </div>
      </div>
      <MatrizVinculacion
        open={matrizAbierta}
        onClose={() => setMatrizAbierta(false)}
        activeId={currentTierData.id}
      />
    </div>
  )
}

/* ─── Subcomponente: Fase 3 (PEOTDU: qué es, descargas y portada) ─────── */
function HeroObjectivesFase3({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`hero-fase3-wrapper ${isVisible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!isVisible}
    >
      <div className="hero-fase3-container">
        <PeotduResumen />
      </div>
    </div>
  )
}

/* ─── Componente Principal: Hero ──────────────────────────────────────── */
export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [currentScrollPx, setCurrentScrollPx] = useState(0)

  useEffect(() => {
    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        try {
          if (!trackRef.current) return
          const rect = trackRef.current.getBoundingClientRect()
          setCurrentScrollPx(-(rect.top - NAV_OFFSET))
        } catch (err) {
          console.error('Error calculando scroll:', err)
        } finally {
          rafId = null
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  // Umbrales calibrados exactamente a los scrolls del usuario:
  // 0 scrolls -> Fase 0 (Mapa)
  // 1 scroll -> Fase 1 (Pregunta + 2 Bloques explicativos)
  // 2 scrolls -> Fase 2 (Intro + Pirámide invertida en Escalón 1)
  // 3 a 11 scrolls -> Recorrido de los escalones 2 al 10
  // 12+ scrolls -> Fase 3 (Objetivos de los Instrumentos y Rectoría del PEOTDU)
  const isPhase0Active = currentScrollPx < SCROLL_FASE1_THRESHOLD
  const isPhase1Active = currentScrollPx >= SCROLL_FASE1_THRESHOLD && currentScrollPx < SCROLL_FASE2_THRESHOLD
  const isPhase2Active = currentScrollPx >= SCROLL_FASE2_THRESHOLD && currentScrollPx < SCROLL_FASE3_THRESHOLD
  const isPhase3Active = currentScrollPx >= SCROLL_FASE3_THRESHOLD

  // Control de visibilidad de flechas:
  // Fase 0: solo bajar | Fase 1 y 2: ambas | Fase 3: solo subir
  const showUpArrow = !isPhase0Active
  const showDownArrow = !isPhase3Active

  // Escalón activo (1 a 10) según el scroll dentro de Fase 2
  const activeTier = Math.min(
    Math.max(Math.floor((currentScrollPx - SCROLL_FASE2_THRESHOLD) / SCROLL_TIER_STEP) + 1, 1),
    10
  )

  const scrollToPx = (targetY: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const targetWindowY = window.scrollY + (rect.top - NAV_OFFSET) + targetY
    window.scrollTo({ top: Math.max(targetWindowY, 0), behavior: 'smooth' })
  }

  const handleNavUp = () => {
    if (isPhase3Active) {
      scrollToPx(SCROLL_FASE2_THRESHOLD + 9 * SCROLL_TIER_STEP + 10)
    } else if (isPhase2Active) {
      if (activeTier > 1) {
        scrollToPx(SCROLL_FASE2_THRESHOLD + (activeTier - 2) * SCROLL_TIER_STEP + 10)
      } else {
        scrollToPx(SCROLL_FASE1_THRESHOLD + 10)
      }
    } else if (isPhase1Active) {
      scrollToPx(0)
    }
  }

  const handleNavDown = () => {
    if (isPhase0Active) {
      scrollToPx(SCROLL_FASE1_THRESHOLD + 10)
    } else if (isPhase1Active) {
      scrollToPx(SCROLL_FASE2_THRESHOLD + 10)
    } else if (isPhase2Active) {
      if (activeTier < 10) {
        scrollToPx(SCROLL_FASE2_THRESHOLD + activeTier * SCROLL_TIER_STEP + 10)
      } else {
        scrollToPx(SCROLL_FASE3_THRESHOLD + 10)
      }
    }
  }

  const handleTierSelect = (tierId: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const targetY =
      window.scrollY + (rect.top - NAV_OFFSET) + SCROLL_FASE2_THRESHOLD + (tierId - 1) * SCROLL_TIER_STEP + 10
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  return (
    <div
      id="territorio"
      className="hero-scroll-track"
      ref={trackRef}
      style={{ minHeight: `calc(100vh - 112px + ${TOTAL_HERO_SCROLL}px)` }}
    >
      {/* Viewport fijado durante el scroll del track */}
      <section className="hero-sticky-stage" aria-labelledby="bento-hero-title">
        {/* Flecha superior (Subir a fase anterior) */}
        <button
          type="button"
          className={`hero-nav-arrow hero-nav-arrow--up ${showUpArrow ? 'is-visible' : 'is-hidden'}`}
          onClick={handleNavUp}
          aria-label="Subir a la fase anterior"
          title="Fase anterior"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="hero-nav-arrow__icon"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z"
            />
          </svg>
        </button>

        {/* Flecha inferior (Bajar a la siguiente fase) */}
        <button
          type="button"
          className={`hero-nav-arrow hero-nav-arrow--down ${showDownArrow ? 'is-visible' : 'is-hidden'}`}
          onClick={handleNavDown}
          aria-label="Bajar a la siguiente fase"
          title="Siguiente fase"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="hero-nav-arrow__icon"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z"
            />
          </svg>
        </button>

        <div className="hero-sticky-stage__container">
          {/* 1. Título principal institucional */}
          <header className="hero-sticky-stage__header">
            <h1 id="bento-hero-title" className="hero-sticky-stage__main-title">
              Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano
            </h1>
            <p className="hero-sticky-stage__subtitle">Infraestructura pública digital</p>
          </header>

          {/* 2. Área central: Fase 0 (Mapa), Fase 1 (Pregunta + 2 Bloques), Fase 2 (Pirámide Invertida de 10 niveles), Fase 3 (Objetivos y Rectoría) */}
          <div className="hero-main-stage-content">
            {/* FASE 0: Mapa y métricas territoriales */}
            <HeroCampecheMap isVisible={isPhase0Active} />

            {/* FASE 1 (1 Scroll): Pregunta, textos, esquema del sistema y mosaico de actividades */}
            <div
              className={`hero-story-flow hero-sistema ${isPhase1Active ? 'is-active' : 'is-standby'}`}
              aria-hidden={!isPhase1Active}
            >
              <div className="hero-sistema__grid">
                <div className="hero-fase1-tree">
                  {/* 1. Pregunta principal con su círculo conector raíz */}
                  <div className="hero-fase1-tree__node hero-fase1-tree__node--root">
                    <div className="hero-fase1-marker">
                      <span className="hero-fase1-circle hero-fase1-circle--root" aria-hidden="true" />
                    </div>
                    <div className="hero-question-wrapper is-revealed">
                      <h2 className="hero-sticky-stage__question-title">
                        ¿Qué es el Sistema de Planeación del Ordenamiento Territorial, Desarrollo Urbano y Metropolitano?
                      </h2>
                    </div>
                  </div>

                  <div className="hero-fase1-tree__node hero-story-block is-revealed">
                    <div className="hero-fase1-marker">
                      <span className="hero-fase1-circle hero-fase1-circle--child" aria-hidden="true" />
                    </div>
                    <div className="hero-fase1-body">
                      <p className="hero-story-block__text">
                        El Sistema Estatal de Planeación del Ordenamiento Territorial, Desarrollo Urbano y Metropolitano (SEPOTDUM)
                        es un mecanismo de vinculación estructurado mediante un conjunto de instrumentos de planeación tendientes
                        al ordenamiento territorial de los asentamientos humanos y la regulación de las acciones de fundación,
                        conservación, mejoramiento y crecimiento de los centros de población en la entidad que coadyuvan al Sistema
                        Estatal de Planeación Democrática para el desarrollo del Estado (Art. 33).
                      </p>
                    </div>
                  </div>

                  <div className="hero-fase1-tree__node hero-story-block is-revealed">
                    <div className="hero-fase1-marker">
                      <span className="hero-fase1-circle hero-fase1-circle--child" aria-hidden="true" />
                    </div>
                    <div className="hero-fase1-body">
                      <p className="hero-story-block__text">
                        El sistema configura la dimensión espacial del desarrollo del Estado en el mediano y largo plazos;
                        establece el marco básico de referencia y acción territorial con los planes nacional y estatal de
                        desarrollo, los programas sectoriales y regionales, y promoverá la utilización racional del territorio
                        y el desarrollo equilibrado de la entidad y privilegiando el bien común y los derechos fundamentales.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Esquema de relaciones del sistema + acceso a los documentos legales */}
                <figure className="hero-sistema__esquema">
                  <EsquemaSistema />
                  <figcaption className="hero-sistema__acciones">
                    <a href={PEOTDU_PDF_OFICIAL} target="_blank" rel="noopener noreferrer" className="hero-sistema__btn">
                      <Landmark className="w-4 h-4" aria-hidden="true" />
                      Documento legal estatal (Periódico Oficial)
                    </a>
                    <a href={LEYES.LGAHOTDU.url} target="_blank" rel="noopener noreferrer" className="hero-sistema__btn hero-sistema__btn--outline">
                      <Scale className="w-4 h-4" aria-hidden="true" />
                      Ley General (LGAHOTDU)
                    </a>
                  </figcaption>
                </figure>
              </div>

              <MosaicoActividades />
            </div>

            {/* FASE 2 (2 Scroll + 3+ Scroll): Pirámide Invertida oficial con los 10 escalones */}
            <HeroPyramidFunnel
              isVisible={isPhase2Active}
              activeTier={activeTier}
              onTierSelect={handleTierSelect}
            />

            {/* FASE 3: Objetivos de los Instrumentos y Rol Rector del PEOTDU */}
            <HeroObjectivesFase3 isVisible={isPhase3Active} />
          </div>
        </div>
      </section>
    </div>
  )
}
