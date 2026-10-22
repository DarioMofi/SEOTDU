import { useId, useState, type ReactNode } from 'react'
import { Trees, Building2, Route, Coins, Landmark, Users, Gavel, UsersRound, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react'
import {
  ANILLOS,
  DIMENSIONES,
  MONITORES_INSUMOS,
  SUBSISTEMAS,
  VISTAS,
  dimensionDe,
  type SubsistemaId,
  type Vista,
} from '../../data/paradigmaPeotdu'

/* Diagrama circular del paradigma del PEOTDU (Ilustración 1), redibujado en
   SVG para que sea interactivo. Se usa en dos sitios:
   - modo «onboarding» (inicio): tooltips con la lógica de cada dimensión,
     subsistema y anillo; clic en un subsistema abre su monitor.
   - modo «control» (geovisor): el subsistema elegido es el filtro maestro y
     dos controles laterales cambian entre Desempeño y Estrategia.
   Sin las flechas amarillas del original: los lados se rotulan con texto. */

const ICONOS: Record<SubsistemaId, ReactNode> = {
  'fisico-natural': <Trees />,
  'urbano-rural': <Building2 />,
  movilidad: <Route />,
  economico: <Coins />,
  patrimonio: <Landmark />,
  sociodemografico: <Users />,
  institucional: <Gavel />,
}

const nombreCorto = (nombre: string) => nombre.replace(/^Monitor (de )?/, '').replace(' (MOT)', '')

interface Props {
  modo: 'onboarding' | 'control'
  seleccionado?: SubsistemaId | null
  onSeleccionar?: (id: SubsistemaId) => void
  vista?: Vista
  onVista?: (v: Vista) => void
  className?: string
}

type Pista = { titulo: string; texto: string; color?: string; extra?: string } | null

const R_NODO = 128
// Anillo de monitores: afuera de todo, sobre el de derechos humanos (r = 300)
const R_MON_IN = 330
const R_MON_OUT = 358
const R_CENTRO = 52
const LIENZO = 370
const PASO = 360 / SUBSISTEMAS.length
const rad = (g: number) => (g * Math.PI) / 180
const punto = (r: number, g: number) => [r * Math.cos(rad(g)), r * Math.sin(rad(g))] as const
const anguloDe = (i: number) => -90 + i * PASO

/** Arco SVG de `desde` a `hasta` grados, en sentido horario */
function arco(r: number, desde: number, hasta: number) {
  const [x1, y1] = punto(r, desde)
  const [x2, y2] = punto(r, hasta)
  const grande = hasta - desde > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${grande} 1 ${x2} ${y2}`
}

/** Arco en sentido antihorario (texto legible en la mitad inferior) */
function arcoInverso(r: number, desde: number, hasta: number) {
  const [x1, y1] = punto(r, hasta)
  const [x2, y2] = punto(r, desde)
  const grande = hasta - desde > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${grande} 0 ${x2} ${y2}`
}

/** Sector de corona entre dos radios, de `desde` a `hasta` grados */
function sector(r1: number, r2: number, desde: number, hasta: number) {
  const [a, b] = punto(r2, desde)
  const [c, d] = punto(r2, hasta)
  const [e, f] = punto(r1, hasta)
  const [g, h] = punto(r1, desde)
  const grande = hasta - desde > 180 ? 1 : 0
  return `M ${a} ${b} A ${r2} ${r2} 0 ${grande} 1 ${c} ${d} L ${e} ${f} A ${r1} ${r1} 0 ${grande} 0 ${g} ${h} Z`
}

/* Cada monitor ocupa el arco de los subsistemas que lo alimentan; como en el
   orden del círculo los subsistemas de un monitor son contiguos, el anillo
   queda partido en cinco sectores sin cruces. */
const MONITORES_ANILLO = MONITORES_INSUMOS.map((m) => {
  const idx = m.subsistemas.map((id) => SUBSISTEMAS.findIndex((s) => s.id === id)).sort((a, b) => a - b)
  const desde = anguloDe(idx[0]) - PASO / 2 + 1.5
  const hasta = anguloDe(idx[idx.length - 1]) + PASO / 2 - 1.5
  const medio = (desde + hasta) / 2
  // En la mitad de arriba el rótulo corre en sentido horario; en la de abajo,
  // al revés, para que nunca quede de cabeza.
  const arriba = ((medio % 360) + 360) % 360 > 180
  const rotulo = arriba ? arco(339, desde + 2, hasta - 2) : arcoInverso(349, desde + 2, hasta - 2)
  return { ...m, idx, desde, hasta, medio, rotulo }
})
const monitorDeSub = (id: SubsistemaId) => MONITORES_ANILLO.find((m) => m.subsistemas.includes(id))

export default function DiagramaParadigma({ modo, seleccionado, onSeleccionar, vista, onVista, className = '' }: Props) {
  const uid = useId().replace(/:/g, '')
  const [pista, setPista] = useState<Pista>(null)
  const [monResaltado, setMonResaltado] = useState<string | null>(null)
  const control = modo === 'control'
  const monSeleccionado = seleccionado ? monitorDeSub(seleccionado)?.modulo : undefined
  const enFoco = monResaltado ?? monSeleccionado
  const pistaMonitor = (m: (typeof MONITORES_ANILLO)[number]): Pista => ({
    titulo: m.nombre,
    texto: `Se alimenta de: ${m.subsistemas.map((id) => SUBSISTEMAS.find((s) => s.id === id)!.nombre).join(', ')}.`,
    color: m.color,
    extra: 'Monitor · haz clic para abrirlo',
  })
  const entrarMonitor = (m: (typeof MONITORES_ANILLO)[number]) => () => { setMonResaltado(m.modulo); setPista(pistaMonitor(m)) }
  const salirMonitor = () => { setMonResaltado(null); setPista(null) }

  const mostrar = (p: Pista) => () => setPista(p)
  const ocultar = () => setPista(null)

  return (
    <div className={`paradigma paradigma--${modo} ${className}`}>
      {/* En el geovisor el diagrama es un control: se dice explícitamente */}
      {control && (
        <p className="paradigma__ayuda">
          <MousePointerClick className="w-4 h-4" aria-hidden="true" />
          <span>Haz clic en un <strong>subsistema</strong> o en un <strong>monitor</strong> (anillo exterior) para abrirlo y cambia la vista con los botones de abajo.</span>
        </p>
      )}

      {/* Lado izquierdo: Desempeño territorial */}
      <LadoVista v="desempeno" activa={vista === 'desempeno'} control={control} onVista={onVista} />

      <div className="paradigma__lienzo">
        <svg viewBox={`${-LIENZO} ${-LIENZO} ${LIENZO * 2} ${LIENZO * 2}`} role="group" aria-label="Diagrama del paradigma teórico-metodológico del PEOTDU">
          <defs>
            <path id={`${uid}-der`} d={arco(309, -150, 30)} />
            <path id={`${uid}-cue`} d={arco(268, -70, 20)} />
            <path id={`${uid}-ent`} d={arco(230, -62, 18)} />
            {MONITORES_ANILLO.map((m) => <path key={m.modulo} id={`${uid}-mon-${m.modulo}`} d={m.rotulo} />)}
          </defs>

          {/* Anillos exteriores (de afuera hacia adentro) */}
          <g className="paradigma__anillo" onMouseEnter={mostrar({ titulo: ANILLOS[3].nombre, texto: ANILLOS[3].explicacion, color: '#D2873A' })} onMouseLeave={ocultar}>
            <circle r={300} className="paradigma__derechos" />
            <text className="paradigma__rotulo paradigma__rotulo--calido"><textPath href={`#${uid}-der`} startOffset="50%" textAnchor="middle">DERECHOS HUMANOS E INTERSECCIONALIDAD</textPath></text>
          </g>
          <g className="paradigma__anillo" onMouseEnter={mostrar({ titulo: ANILLOS[2].nombre, texto: ANILLOS[2].explicacion, color: '#2F5D7C' })} onMouseLeave={ocultar}>
            <circle r={268} className="paradigma__cuenca" />
            <text className="paradigma__rotulo"><textPath href={`#${uid}-cue`} startOffset="50%" textAnchor="middle">CUENCA</textPath></text>
          </g>
          <g className="paradigma__anillo" onMouseEnter={mostrar({ titulo: ANILLOS[1].nombre, texto: ANILLOS[1].explicacion, color: '#4C9AA3' })} onMouseLeave={ocultar}>
            <circle r={230} className="paradigma__entorno" />
            <text className="paradigma__rotulo"><textPath href={`#${uid}-ent`} startOffset="50%" textAnchor="middle">ENTORNO</textPath></text>
          </g>

          {/* Disco del subsistema territorial */}
          <circle r={212} className="paradigma__disco" />

          {/* Arcos de las tres dimensiones */}
          {DIMENSIONES.map((d) => {
            const idx = SUBSISTEMAS.map((s, i) => (s.dimension === d.id ? i : -1)).filter((i) => i >= 0)
            const desde = anguloDe(idx[0]) - PASO / 2 + 1.5
            const hasta = anguloDe(idx[idx.length - 1]) + PASO / 2 - 1.5
            return (
              <path
                key={d.id}
                d={arco(200, desde, hasta)}
                className="paradigma__dimension"
                style={{ stroke: d.color }}
                onMouseEnter={mostrar({ titulo: d.nombre, texto: d.explicacion, color: d.color })}
                onMouseLeave={ocultar}
              >
                <title>{d.nombre}</title>
              </path>
            )
          })}

          {/* Líneas tenues: cada subsistema alimenta a su monitor */}
          {SUBSISTEMAS.map((s, i) => {
            const m = monitorDeSub(s.id)!
            const [x1, y1] = punto(R_NODO + 38, anguloDe(i))
            const [x2, y2] = punto(R_MON_IN - 2, m.medio)
            return (
              <line
                key={s.id}
                x1={x1} y1={y1} x2={x2} y2={y2}
                className={`paradigma__alimenta ${enFoco === m.modulo ? 'is-resaltado' : ''}`}
                style={{ stroke: m.color }}
              />
            )
          })}

          {/* Anillo de monitores */}
          {MONITORES_ANILLO.map((m) => {
            const elegir = () => onSeleccionar?.(m.subsistemas[0])
            return (
              <g
                key={m.modulo}
                className={`paradigma__monitor ${enFoco === m.modulo ? 'is-resaltado' : ''} ${monSeleccionado === m.modulo ? 'is-activo' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${m.nombre}. ${pistaMonitor(m)!.texto}`}
                onClick={elegir}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir() } }}
                onMouseEnter={entrarMonitor(m)}
                onMouseLeave={salirMonitor}
                onFocus={entrarMonitor(m)}
                onBlur={salirMonitor}
                style={{ '--mon': m.color, '--mon-tinta': m.tinta } as React.CSSProperties}
              >
                <path d={sector(R_MON_IN, R_MON_OUT, m.desde, m.hasta)} className="paradigma__monitor-sector" />
                <text className="paradigma__monitor-txt">
                  <textPath href={`#${uid}-mon-${m.modulo}`} startOffset="50%" textAnchor="middle">{nombreCorto(m.nombre).toUpperCase()}</textPath>
                </text>
                <title>{m.nombre}</title>
              </g>
            )
          })}

          {/* Centro: las personas */}
          <g className="paradigma__centro">
            <circle r={R_CENTRO} />
            <svg x={-24} y={-30} width={48} height={48} viewBox="0 0 24 24" className="paradigma__icono-centro"><UsersRound /></svg>
            <text y={34} textAnchor="middle" className="paradigma__centro-txt">Personas</text>
          </g>

          {/* Subsistemas */}
          {SUBSISTEMAS.map((s, i) => {
            const g = anguloDe(i)
            const [x, y] = punto(R_NODO, g)
            const dim = dimensionDe(s.dimension)
            const activo = seleccionado === s.id
            // Rótulo siempre debajo del nodo (hacia dentro en el de arriba) y
            // partido en dos líneas si es largo, para no invadir al vecino.
            const corto = s.nombre.replace(' cultural, natural y biocultural', '')
            const lineas = corto.length > 14 && corto.includes(' y ')
              ? [corto.slice(0, corto.indexOf(' y ')), corto.slice(corto.indexOf(' y ') + 1)]
              : [corto]
            return (
              <g
                key={s.id}
                transform={`translate(${x} ${y})`}
                className={`paradigma__nodo ${activo ? 'is-activo' : ''} ${enFoco && monitorDeSub(s.id)?.modulo === enFoco ? 'is-en-monitor' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={control ? activo : undefined}
                aria-label={`${s.nombre}. Monitor ${s.monitor}. ${s.descripcion}`}
                onClick={() => onSeleccionar?.(s.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSeleccionar?.(s.id) } }}
                onMouseEnter={mostrar({ titulo: s.nombre, texto: s.descripcion, color: dim.color, extra: `${dim.nombre} · Monitor ${s.monitor}` })}
                onMouseLeave={ocultar}
                onFocus={mostrar({ titulo: s.nombre, texto: s.descripcion, color: dim.color, extra: `${dim.nombre} · Monitor ${s.monitor}` })}
                onBlur={ocultar}
                style={{ '--dim': dim.color } as React.CSSProperties}
              >
                <circle r={36} className="paradigma__nodo-circ" />
                <svg x={-15} y={-15} width={30} height={30} viewBox="0 0 24 24" className="paradigma__icono">{ICONOS[s.id]}</svg>
                <text y={52} textAnchor="middle" className="paradigma__nodo-txt">
                  {lineas.map((l, k) => <tspan key={k} x={0} dy={k === 0 ? 0 : 14}>{l}</tspan>)}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tarjeta flotante con la lógica del elemento bajo el cursor */}
        <div className={`paradigma__pista ${pista ? 'is-visible' : ''}`} role="status" aria-live="polite" style={{ '--pista': pista?.color ?? '#2E8C8A' } as React.CSSProperties}>
          {pista && (
            <>
              <strong>{pista.titulo}</strong>
              {pista.extra && <span className="paradigma__pista-extra">{pista.extra}</span>}
              <p>{pista.texto}</p>
            </>
          )}
        </div>
      </div>

      {/* Lado derecho: Estrategia territorial */}
      <LadoVista v="estrategia" activa={vista === 'estrategia'} control={control} onVista={onVista} />

      <ul className="paradigma__monitores" aria-label="Monitores">
        {MONITORES_ANILLO.map((m) => (
          <li key={m.modulo}>
            <button
              type="button"
              className={monSeleccionado === m.modulo ? 'is-activo' : ''}
              style={{ '--mon': m.color } as React.CSSProperties}
              onClick={() => onSeleccionar?.(m.subsistemas[0])}
              onMouseEnter={entrarMonitor(m)}
              onMouseLeave={salirMonitor}
              title={pistaMonitor(m)!.texto}
            >
              <span aria-hidden="true" />{nombreCorto(m.nombre)}
            </button>
          </li>
        ))}
      </ul>

      {!control && (
        <ul className="paradigma__leyenda" aria-label="Dimensiones">
          {DIMENSIONES.map((d) => (
            <li key={d.id}><span style={{ background: d.color }} />{d.nombre}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LadoVista({ v, activa, control, onVista }: { v: Vista; activa: boolean; control: boolean; onVista?: (v: Vista) => void }) {
  const info = VISTAS[v]
  const izquierda = v === 'desempeno'
  const contenido = (
    <>
      {control && (izquierda ? <ChevronLeft className="w-4 h-4" aria-hidden="true" /> : null)}
      <span className="paradigma__lado-txt">
        <small>{info.lado}</small>
        <strong>{info.nombre}</strong>
        {!control && <span>{info.explicacion}</span>}
      </span>
      {control && (!izquierda ? <ChevronRight className="w-4 h-4" aria-hidden="true" /> : null)}
    </>
  )
  return control ? (
    <button
      type="button"
      className={`paradigma__lado paradigma__lado--${izquierda ? 'izq' : 'der'} ${activa ? 'is-activo' : ''}`}
      aria-pressed={activa}
      title={info.explicacion}
      onClick={() => onVista?.(v)}
    >
      {contenido}
    </button>
  ) : (
    <div className={`paradigma__lado paradigma__lado--${izquierda ? 'izq' : 'der'}`}>{contenido}</div>
  )
}
