import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

/**
 * Etiqueta de la guía.
 *
 * Es el único estilo de texto del overlay y lleva fondo propio: debajo pasa el
 * mapa, que cambia de color con la capa activa, así que el texto no puede
 * depender del contraste con lo que haya abajo.
 */
function Etiqueta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded bg-[#9F2241] px-2 py-[3px] text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * Etiqueta con línea guía punteada.
 *
 * La guía no enmarca el elemento: lo señala. El punto del extremo es el que
 * marca el objetivo, así que `style` tiene que dejarlo justo encima —
 * `{ top, right }` para lo que queda a la derecha de la etiqueta,
 * `{ top, left }` para lo que queda a su izquierda y `{ bottom, right }` para
 * lo que queda debajo.
 *
 * Con `top` la anotación se centra vertical sobre esa coordenada; con `bottom`
 * se ancla por abajo, que es lo que necesita la leyenda (de alto variable).
 */
function Anotacion({
  etiqueta,
  hacia,
  largo = 32,
  style
}: {
  etiqueta: string
  /** Lado al que apunta la línea, visto desde la etiqueta. */
  hacia: 'izq' | 'der' | 'abajo'
  largo?: number
  style: CSSProperties
}) {
  const punto = <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-white" />
  const vertical = hacia === 'abajo'

  const linea = vertical ? (
    <span className="flex flex-col items-center" aria-hidden="true">
      <span className="border-l border-dashed border-white/75" style={{ height: largo }} />
      {punto}
    </span>
  ) : (
    <span className="flex items-center" aria-hidden="true">
      {hacia === 'izq' && punto}
      <span className="border-t border-dashed border-white/75" style={{ width: largo }} />
      {hacia === 'der' && punto}
    </span>
  )

  return (
    <div
      className={`absolute flex items-center gap-2 ${vertical ? 'flex-col' : ''} ${
        style.top !== undefined ? '-translate-y-1/2' : ''
      }`}
      style={style}
    >
      {hacia === 'izq' && linea}
      <Etiqueta>{etiqueta}</Etiqueta>
      {hacia !== 'izq' && linea}
    </div>
  )
}

/**
 * Guía contextual del Geovisor.
 *
 * Señala los controles reales en su posición real: cada línea guía termina en
 * los mismos píxeles que ocupa el elemento al que apunta. Por eso las zonas del
 * panel y de los controles se ocultan por debajo de 768 px, donde el layout
 * pasa a columna y esas coordenadas dejan de valer.
 */
export default function GeovisorGuideOverlay({ isOpen, onClose }: Props) {
  const raizRef = useRef<HTMLDivElement>(null)
  const [leyenda, setLeyenda] = useState<{ bottom: number; right: number } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  /**
   * Borde superior de la leyenda.
   *
   * Es el único objetivo que no se puede anclar con medidas fijas: se dibuja
   * pegada abajo y crece hacia arriba según las capas activas, así que su borde
   * superior hay que medirlo. Y llega tarde —depende de que carguen los
   * estilos—, cuando la guía ya está en pantalla: de ahí la espera antes de
   * medir. Si no aparece, la anotación no se dibuja.
   */
  useLayoutEffect(() => {
    if (!isOpen) return
    let vivo = true
    let leyendaEl: Element | null = null
    let intentos = 0
    let observer: ResizeObserver | null = null

    const medir = () => {
      const raiz = raizRef.current
      if (!raiz || !leyendaEl) return
      const base = raiz.getBoundingClientRect()
      const caja = leyendaEl.getBoundingClientRect()
      // El punto queda justo sobre el borde superior, y la etiqueta se alinea a
      // la derecha con la leyenda para que quede en la misma columna que el
      // resto de los rótulos de ese lado.
      setLeyenda({ bottom: base.bottom - caja.top, right: base.right - caja.right })
    }

    const buscar = () => {
      if (!vivo) return
      leyendaEl = document.querySelector('.map-legend')
      if (!leyendaEl) {
        // ~2 s a 60 fps. Si no apareció, no hay capas activas con simbología.
        if (intentos++ < 120) requestAnimationFrame(buscar)
        return
      }
      medir()
      // El alto cambia si cambian las capas; la posición, si cambia la ventana.
      observer = new ResizeObserver(medir)
      observer.observe(leyendaEl)
      window.addEventListener('resize', medir)
    }

    buscar()
    return () => {
      vivo = false
      observer?.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={raizRef}
      onClick={onClose}
      className="absolute inset-0 z-[2000] bg-black/60 cursor-pointer select-none overflow-hidden transition-opacity duration-300 font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Guía interactiva del Geovisor"
    >
      {/* Cerrar */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-2 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/60"
        aria-label="Cerrar guía contextual"
        title="Cerrar guía (Esc)"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* ─── Panel lateral ──────────────────────────────────────────────── */}
      {/* Las etiquetas quedan fuera del panel, sobre el mapa: dentro no hay
          hueco libre y taparían justo lo que señalan. `left` es la coordenada
          del objetivo y `largo` estira la línea hasta dejar todas las etiquetas
          alineadas en x = 472.
          Los cuatro controles de capa se reparten entre las dos primeras
          tarjetas —una fila por etiqueta— porque las dos filas de una sola
          tarjeta caben en 64 px y los rótulos se encimarían. Da igual la
          tarjeta: todas traen los mismos controles. */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <Anotacion etiqueta="Filtro por municipio" hacia="izq" largo={40} style={{ top: 35, left: 424 }} />
        <Anotacion etiqueta="Cartografía e Información" hacia="izq" largo={40} style={{ top: 92, left: 424 }} />
        {/* Señala la flecha del encabezado del módulo, que es lo que abre y
            cierra la lista de capas. */}
        <Anotacion etiqueta="Abrir o cerrar las capas" hacia="izq" largo={46} style={{ top: 189, left: 418 }} />
        <Anotacion etiqueta="Encender / apagar" hacia="izq" largo={431} style={{ top: 253, left: 33 }} />
        <Anotacion etiqueta="Opacidad" hacia="izq" largo={59} style={{ top: 277, left: 405 }} />
        <Anotacion etiqueta="Ficha técnica" hacia="izq" largo={53} style={{ top: 325, left: 411 }} />
        <Anotacion etiqueta="Orden de dibujo" hacia="izq" largo={424} style={{ top: 349, left: 40 }} />
      </div>

      {/* ─── Controles del mapa ─────────────────────────────────────────── */}
      {/* `right: 44` deja el punto sobre el borde izquierdo de los botones de
          28 px; el de mapa base mide 32 y llega a 48, así que lo toca por
          dentro. */}
      <div className="hidden md:block absolute inset-0 pointer-events-none">
        <Anotacion etiqueta="Mapa base" hacia="der" style={{ top: 72, right: 44 }} />
        <Anotacion etiqueta="Acercar" hacia="der" style={{ top: 114, right: 44 }} />
        <Anotacion etiqueta="Alejar" hacia="der" style={{ top: 150, right: 44 }} />
        <Anotacion etiqueta="Descargar capas (.gpkg)" hacia="der" style={{ top: 186, right: 44 }} />
        <Anotacion etiqueta="Abrir esta guía" hacia="der" style={{ top: 222, right: 44 }} />
      </div>

      {/* ─── Leyenda ────────────────────────────────────────────────────── */}
      {/* Cuelga del borde superior de la leyenda, medido arriba. Señalarla de
          lado dejaba la etiqueta a media altura del mapa, encima del ratón en
          ventanas de 1280. */}
      {leyenda && (
        <div className="hidden sm:block absolute inset-0 pointer-events-none">
          <Anotacion etiqueta="Simbología" hacia="abajo" largo={22} style={leyenda} />
        </div>
      )}

      {/* ─── Navegación sobre el mapa ───────────────────────────────────── */}
      {/* Se centra en el mapa, no en el visor completo: los 445 px del panel
          tiran el centro a la izquierda y el ratón acaba encima de las
          etiquetas del panel (y del propio panel en ventanas angostas). El
          desplazamiento es medio panel, y solo aplica con el layout en fila. */}
      <div className="absolute top-1/2 left-1/2 md:left-[calc(50%+222px)] z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center pointer-events-none select-none">
        <div className="flex items-start">
          <div className="guide-pulse">
            <svg width="68" height="102" viewBox="0 0 68 102" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Cuerpo del ratón */}
              <rect
                x="2"
                y="2"
                width="64"
                height="98"
                rx="32"
                stroke="white"
                strokeWidth="3.5"
                fill="rgba(255, 255, 255, 0.95)"
              />
              {/* División de botones */}
              <line x1="34" y1="2" x2="34" y2="34" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
              {/* Rueda de scroll en tono guinda */}
              <rect x="29" y="16" width="10" height="22" rx="5" fill="#9F2241" stroke="#691C32" strokeWidth="1.5" />
            </svg>
          </div>

          {/* El margen negativo centra la flecha en la rueda (y=27 del SVG del
              ratón), no en el ratón completo. */}
          <div className="ml-3 flex items-center gap-2" style={{ marginTop: -3 }}>
            <svg width="14" height="60" viewBox="0 0 14 60" fill="none" aria-hidden="true">
              <path d="M7 6 L7 54" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="3 4" />
              <path
                d="M2.5 8 L7 2.5 L11.5 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.5 52 L7 57.5 L11.5 52"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <Etiqueta>Rueda: acercar y alejar</Etiqueta>
          </div>
        </div>

        <Etiqueta className="mt-4 inline-flex items-center gap-1.5">
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="5 9 2 12 5 15" />
            <polyline points="9 5 12 2 15 5" />
            <polyline points="15 19 12 22 9 19" />
            <polyline points="19 9 22 12 19 15" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
          Arrastrar para mover el mapa
        </Etiqueta>
      </div>

      {/* Cómo salir. Va junto a la X y no centrado abajo: el centro inferior lo
          ocupa la leyenda en cuanto la ventana se estrecha. */}
      <span className="hidden sm:block absolute top-[13px] right-14 text-[11px] font-medium text-white/80 pointer-events-none guide-text-shadow">
        Clic en cualquier parte para cerrar
      </span>
    </div>
  )
}
