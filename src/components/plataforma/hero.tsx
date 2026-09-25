import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, FileText, Link2 } from 'lucide-react'
import { HeroCampecheMap, HeroMexicoDots, HeroCampecheDots } from './hero-maps'

/* ─── Configuración de Umbrales de Scroll ─────────────────────────────── */
const NAV_OFFSET = 112 // Altura combinada de Header institucional (40px) + Navbar (72px)
const SCROLL_FASE1_THRESHOLD = 50 // 1er scroll entra a Fase 1
const SCROLL_FASE2_THRESHOLD = 170 // 2do scroll entra a Fase 2 (pirámide invertida)
const SCROLL_TIER_STEP = 110 // Cada scroll posterior avanza un escalón de la pirámide (10 niveles = 1100px)
const SCROLL_FASE3_THRESHOLD = SCROLL_FASE2_THRESHOLD + SCROLL_TIER_STEP * 10 // ~1270px entra a Fase 3
const TOTAL_HERO_SCROLL = SCROLL_FASE3_THRESHOLD + 40 // 1310px: finaliza de forma continua al alcanzar Fase 3 sin zona muerta de 20%

/* ─── Definición de los 10 Instrumentos Oficiales (Pirámide Invertida) ── */
export interface PyramidTier {
  id: number
  number: string
  title: string
  level: string
  widthPercent: number // 100% arriba -> 46% abajo
  bgColor: string
  textColor: string
  description: string
  vinculos: string[]
}

export const PYRAMID_TIERS: PyramidTier[] = [
  {
    id: 1,
    number: '01',
    title: 'Estrategia Nacional de Ordenamiento Territorial 2021-2024 (ENOT)',
    level: 'Nacional Rector',
    widthPercent: 100,
    bgColor: '#E8E2D5',
    textColor: '#2B2317',
    description:
      'Instrumento rector de nivel federal que define la visión de largo plazo del ordenamiento territorial nacional, orientando las políticas de desarrollo equilibrado y sustentabilidad ambiental en todo el país.',
    vinculos: [
      'Constitución Política de los EUM (Arts. 25, 26 y 27)',
      'Plan Nacional de Desarrollo (PND)',
      'Ley General de Asentamientos Humanos (LGAHOTDU)',
      'PNOTDU y Programas Estatales (PEOTDU)',
    ],
  },
  {
    id: 2,
    number: '02',
    title: 'Programa Nacional de Ordenamiento Territorial y Desarrollo Urbano (PNOTDU) 2026-2030',
    level: 'Nacional Sectorial',
    widthPercent: 96,
    bgColor: '#DFD8CB',
    textColor: '#2B2317',
    description:
      'Concreta la Estrategia Nacional mediante metas, políticas sectoriales y lineamientos obligatorios para la ocupación del suelo y el desarrollo urbano sustentable de las regiones del país.',
    vinculos: [
      'Estrategia Nacional (ENOT)',
      'Secretaría de Desarrollo Agrario, Territorial y Urbano (SEDATU)',
      'Programas Regionales y Metropolitanos',
      'Sistema Nacional de Información Territorial',
    ],
  },
  {
    id: 3,
    number: '03',
    title: 'Programas Estatales de Ordenamiento Territorial y Desarrollo Urbano (PEOTDU)',
    level: 'Estatal Rector',
    widthPercent: 92,
    bgColor: '#C7BBA5',
    textColor: '#251E13',
    description:
      'Instrumento rector del ordenamiento territorial y del desarrollo urbano del Estado de Campeche, con directrices vinculantes para la administración pública estatal y los 13 municipios.',
    vinculos: [
      'Plan Estatal de Desarrollo de Campeche (PED)',
      'Ley de Asentamientos Humanos del Estado de Campeche',
      'Programas Municipales de Desarrollo Urbano (PMDU)',
      'SEDETU Campeche y Ayuntamientos',
    ],
  },
  {
    id: 4,
    number: '04',
    title: 'Programas Regionales de Desarrollo Urbano',
    level: 'Regional',
    widthPercent: 88,
    bgColor: '#B1A187',
    textColor: '#1C1710',
    description:
      'Coordinan el ordenamiento de dos o más municipios que comparten cuencas ecológicas, dinámicas socioeconómicas o corredores de infraestructura estratégica en el territorio de Campeche.',
    vinculos: [
      'PEOTDU Campeche',
      'Convenios de Coordinación Intermunicipal',
      'Proyectos de Infraestructura y Corredores Estratégicos',
      'SEMABICCE y SEDETU',
    ],
  },
  {
    id: 5,
    number: '05',
    title: 'Programas de Zonas Metropolitanas o Conurbaciones',
    level: 'Metropolitano',
    widthPercent: 84,
    bgColor: '#9A896B',
    textColor: '#FFFFFF',
    description:
      'Planifican el desarrollo integral de centros de población conurbados o con interdependencia urbana, regulando movilidad compartida, reservas territoriales y servicios públicos comunes.',
    vinculos: [
      'LGAHOTDU (Gobernanza Metropolitana)',
      'Comisiones Metropolitanas de Desarrollo',
      'Institutos Municipales de Planeación (IMPLAN)',
      'Zonas Conurbadas de la Entidad',
    ],
  },
  {
    id: 6,
    number: '06',
    title: 'Programa Sectorial de Ordenamiento Territorial, Desarrollo Urbano y Movilidad',
    level: 'Sectorial',
    widthPercent: 80,
    bgColor: '#847353',
    textColor: '#FFFFFF',
    description:
      'Alinea las políticas territoriales con sectores específicos como infraestructura vial, movilidad sustentable, vivienda social y desarrollo productivo en el territorio estatal.',
    vinculos: [
      'Ley de Movilidad del Estado de Campeche',
      'Estrategia Nacional de Movilidad (ENAMOV)',
      'Programas Estatales de Vivienda e Infraestructura',
      'PIMUS Campeche',
    ],
  },
  {
    id: 7,
    number: '07',
    title: 'Programas Municipales de Desarrollo Urbano (PMDU)',
    level: 'Municipal',
    widthPercent: 75,
    bgColor: '#736243',
    textColor: '#FFFFFF',
    description:
      'Instrumento central a nivel municipal que determina la zonificación primaria, usos de suelo permitidos, reservas ecológicas y polígonos de crecimiento en el municipio.',
    vinculos: [
      'Art. 115 Constitucional (Facultades Municipales)',
      'PEOTDU Campeche (Congruencia Vinculante)',
      'Reglamentos Municipales de Construcción',
      'Cabildos y Direcciones de Obras Públicas',
    ],
  },
  {
    id: 8,
    number: '08',
    title: 'Programas de Desarrollo Urbano de Centros de Población (PDUCP)',
    level: 'Centro de Población',
    widthPercent: 70,
    bgColor: '#544632',
    textColor: '#FFFFFF',
    description:
      'Determina la zonificación secundaria detallada, densidades habitacionales, traza vial urbana y equipamiento público para cada localidad y ciudad del municipio.',
    vinculos: [
      'PMDU del Municipio Respectivo',
      'Planes de Espacio Público y Vialidad Urbana',
      'Catastro y Registro Público de la Propiedad',
      'Atlas Municipal de Riesgos',
    ],
  },
  {
    id: 9,
    number: '09',
    title: 'Programas Parciales de Desarrollo Urbano',
    level: 'Parcial',
    widthPercent: 65,
    bgColor: '#423625',
    textColor: '#FFFFFF',
    description:
      'Planes focalizados para zonas urbanas específicas con requerimientos particulares como centros históricos, distritos de revitalización o áreas de alto valor patrimonial o ambiental.',
    vinculos: [
      'PDUCP y PMDU',
      'Centros Históricos y Patrimonio (INAH)',
      'Distritos Urbanos de Conservación y Regeneración',
      'Consejos de Participación y Sector Privado',
    ],
  },
  {
    id: 10,
    number: '10',
    title: 'Polígonos de Actuación',
    level: 'Local Operativo',
    widthPercent: 60,
    bgColor: '#352B1D',
    textColor: '#FFFFFF',
    description:
      'Delimitaciones operativas de gestión y ejecución del suelo para concretar proyectos urbanos público-privados, relotificaciones y transferencias de potencialidades de desarrollo.',
    vinculos: [
      'Programas Parciales y PDUCP',
      'Sistemas de Actuación Social y Privada',
      'Licencias y Factibilidades Urbanísticas',
      'Direcciones de Desarrollo Urbano Municipal',
    ],
  },
]

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

  return (
    <div
      className={`hero-funnel-wrapper ${isVisible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!isVisible}
    >
      <div className="hero-funnel-inner">
        <div className="hero-funnel-header">
          <p className="hero-funnel-intro-text">
            El sistema comprende distintos instrumentos de planeación que orientan las acciones de planeación y los
            programas de desarrollo urbano en congruencia con los programas y estrategias nacionales, este sistema se
            integra a través de 10 tipos de instrumentos:
          </p>
        </div>

        {/* Estructura con 2 paneles laterales (Descripción y Vinculos) y la pirámide central */}
        <div className="hero-funnel-layout">
          {/* Panel Lateral Izquierdo: Descripción */}
          <aside className="hero-funnel-side-card hero-funnel-side-card--left">
            <div className="hero-funnel-side-card__header">
              <FileText className="w-4 h-4 text-[var(--c-guinda)]" />
              <h3 className="hero-funnel-side-card__title">Descripción</h3>
            </div>
            <div className="hero-funnel-side-card__body">
              <div className="hero-funnel-side-card__meta">
                <span className="hero-funnel-side-card__num">{currentTierData.number}</span>
                <span className="hero-funnel-side-card__level">{currentTierData.level}</span>
              </div>
              <h4 className="hero-funnel-side-card__instrument-title">{currentTierData.title}</h4>
              <p className="hero-funnel-side-card__text">{currentTierData.description}</p>
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
                  title={`Escalón ${tier.number}: ${tier.title} (${tier.level})`}
                >
                  <div
                    className="hero-funnel-tier__content"
                    style={{
                      backgroundColor: tier.bgColor,
                      color: tier.textColor,
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
                      {isCompleted ? (
                        <CheckCircle2
                          className="w-3.5 h-3.5"
                          style={{ color: tierAccentColor }}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Panel Lateral Derecho: Vinculos */}
          <aside className="hero-funnel-side-card hero-funnel-side-card--right">
            <div className="hero-funnel-side-card__header">
              <Link2 className="w-4 h-4 text-[var(--c-guinda)]" />
              <h3 className="hero-funnel-side-card__title">Vinculos</h3>
            </div>
            <div className="hero-funnel-side-card__body">
              <span className="hero-funnel-side-card__subtitle">Articulación & Congruencia</span>
              <ul className="hero-funnel-side-card__links-list">
                {currentTierData.vinculos.map((item, idx) => (
                  <li key={idx} className="hero-funnel-side-card__link-item">
                    <span className="hero-funnel-side-card__link-dot" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ─── Subcomponente: Fase 3 (Objetivos y Rectoría del PEOTDU) ─────────── */
function HeroObjectivesFase3({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`hero-fase3-wrapper ${isVisible ? 'is-visible' : 'is-hidden'}`}
      aria-hidden={!isVisible}
    >
      <div className="hero-fase3-container">
        <header className="hero-fase3-header">
          <h2 className="hero-fase3-title">
            Objetivos y Función Rectora del PEOTDU
          </h2>
        </header>

        {/* 1. Objetivos de los instrumentos a ancho completo */}
        <div className="hero-fase3-block hero-fase3-intro">
          <p className="hero-fase3-text">
            Estos instrumentos tienen entre sus objetivos garantizar la congruencia con el Sistema Nacional de
            Planeación Democrática y el Sistema Estatal de Planeación Democrática, garantizar la congruencia con los
            instrumentos de los niveles federal y estatal de planeación en la materia, contribuir al cumplimiento de
            los objetivos y estrategias del Plan Nacional de Desarrollo y al Plan Estatal de Desarrollo, atender las
            necesidades, requerimientos y problemáticas que planteen los diferentes sectores de la población e
            integrar políticas de fomento para el desarrollo urbano sustentable.
          </p>
        </div>

        {/* 2. Sección PEOTDU y Mapa Punteado de Campeche (abajo y a la derecha) */}
        <div className="hero-fase3-body">
          <div className="hero-fase3-block hero-fase3-flow">
            <div className="hero-fase3-header-row">
              <div className="hero-fase1-marker">
                <span className="hero-fase3-circle" aria-hidden="true" />
              </div>
              <h3 className="hero-fase3-section-title">
                Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano (PEOTDU)
              </h3>
            </div>

            <p className="hero-fase3-text">
              El Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano (PEOTDU) es el instrumento rector
              del ordenamiento territorial y del desarrollo urbano del estado al constituirse como un instrumento de
              gobernanza con directrices vinculantes para el conjunto de autoridades encargadas de la planeación del
              territorio y del cual se desprenden los programas que componen el SEPOTDUM.
            </p>

            <p className="hero-fase3-text">
              Entre sus objetivos están establecer mecanismos para la armonización del programa con el resto de
              instrumentos de planeación, generar un diagnóstico integral con enfoque sistémico del territorio y
              enfoque de cuenca, considerando las relaciones funcionales de los sistemas urbano-rurales, y las
              interacciones entre subsistemas, definir las políticas y estrategias de ordenamiento territorial,
              ecológico y desarrollo urbano sustentable de las regiones, zonas metropolitanas y municipios del
              Estado, en función de sus recursos naturales, de sus actividades productivas, la dignidad del ser
              humano, alcanzar el equilibrio entre los asentamientos humanos y sus condiciones ambientales y
              orientar la inversión pública y privada hacia proyectos prioritarios para la conservación de los
              recursos naturales, el desarrollo urbano y metropolitano.
            </p>
          </div>

          {/* Figura animada del Estado de Campeche formada por puntos en el lado derecho */}
          <div className="hero-fase3-map-col">
            <HeroCampecheDots isActive={isVisible} />
          </div>
        </div>
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
              Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano del Estado de Campeche
            </h1>
          </header>

          {/* 2. Área central: Fase 0 (Mapa), Fase 1 (Pregunta + 2 Bloques), Fase 2 (Pirámide Invertida de 10 niveles), Fase 3 (Objetivos y Rectoría) */}
          <div className="hero-main-stage-content">
            {/* FASE 0: Mapa y métricas territoriales */}
            <HeroCampecheMap isVisible={isPhase0Active} />

            {/* FASE 1 (1 Scroll): Pregunta y AMBOS textos explicativos conectados por nodos */}
            <div
              className={`hero-story-flow ${isPhase1Active ? 'is-active' : 'is-standby'}`}
              aria-hidden={!isPhase1Active}
            >
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

                {/* 2. Bloque 1 (desempaquetado, sin badge) con círculo justo antes del texto */}
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

                {/* 3. Bloque 2 (desempaquetado, sin badge) con círculo justo antes del texto */}
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
                    <HeroMexicoDots isActive={isPhase1Active} />
                  </div>
                </div>
              </div>
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
