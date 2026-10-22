import { ORDEN_COLORES } from '../../data/sistemaPlaneacion'

/* Esquema de relaciones del Sistema Estatal de Ordenamiento Territorial y
   Desarrollo Urbano. Dibujado a mano en SVG (no es un mapa): las posiciones
   son fijas y el texto se mantiene corto para que quepa en la Fase 1. */

const F = ORDEN_COLORES.Federal
const E = ORDEN_COLORES.Estatal
const M = ORDEN_COLORES.Municipal

const DERIVADOS: { label: string[]; color: string }[] = [
  { label: ['Regionales'], color: E },
  { label: ['Metropoli-', 'tanos'], color: E },
  { label: ['Sectorial'], color: E },
  { label: ['Municipales', '(PMDU)'], color: M },
  { label: ['Centros de', 'población'], color: M },
  { label: ['Parciales'], color: M },
  { label: ['Polígonos', 'de actuación'], color: M },
]

function Caja({ x, y, w, h, color, filled = false, lines }: {
  x: number; y: number; w: number; h: number; color: string; filled?: boolean; lines: string[]
}) {
  const lh = 13
  const y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + 4
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6}
        fill={filled ? color : '#FFFFFF'} stroke={color} strokeWidth={1.6} />
      {lines.map((t, i) => (
        <text key={i} x={x + w / 2} y={y0 + i * lh} textAnchor="middle"
          className="esquema__txt" fill={filled ? '#FFFFFF' : '#1F2937'}>{t}</text>
      ))}
    </g>
  )
}

export default function EsquemaSistema() {
  const boxW = 80, gap = 8, x0 = 16
  return (
    <svg viewBox="0 0 640 352" className="esquema-sistema" role="img"
      aria-labelledby="esquema-titulo esquema-desc">
      <title id="esquema-titulo">Relaciones del Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano</title>
      <desc id="esquema-desc">
        La planeación nacional y la Estrategia y el Programa Nacional de Ordenamiento Territorial
        orientan al sistema estatal, que coadyuva con la planeación democrática del Estado. Del PEOTDU,
        instrumento rector, se derivan siete tipos de programas regionales, metropolitanos, sectoriales y municipales.
      </desc>
      <defs>
        <marker id="esq-flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#6B7280" />
        </marker>
      </defs>

      {/* Nivel federal */}
      <Caja x={20} y={8} w={280} h={44} color={F} lines={['Planeación nacional', 'PND · Ley de Planeación']} />
      <Caja x={340} y={8} w={280} h={44} color={F} lines={['Estrategia y Programa Nacional', 'ENOT · PNOTDU']} />

      {/* Nivel estatal */}
      <Caja x={20} y={92} w={280} h={44} color={E} lines={['Sistema Estatal de Planeación', 'Democrática · PED']} />
      <Caja x={340} y={92} w={280} h={44} color={E} filled lines={['Sistema Estatal de Ordenamiento', 'Territorial y Desarrollo Urbano']} />

      {/* Congruencia (punteada) y coadyuvancia */}
      <line x1={160} y1={52} x2={160} y2={90} stroke="#6B7280" strokeDasharray="4 3" markerEnd="url(#esq-flecha)" />
      <line x1={480} y1={52} x2={480} y2={90} stroke="#6B7280" strokeDasharray="4 3" markerEnd="url(#esq-flecha)" />
      <line x1={302} y1={114} x2={338} y2={114} stroke="#6B7280" markerStart="url(#esq-flecha)" markerEnd="url(#esq-flecha)" />

      {/* PEOTDU */}
      <path d="M480 136 V154 H320 V170" fill="none" stroke="#6B7280" markerEnd="url(#esq-flecha)" />
      <Caja x={210} y={172} w={220} h={42} color={E} filled lines={['PEOTDU', 'instrumento rector']} />

      {/* Bus hacia los programas derivados */}
      <line x1={320} y1={214} x2={320} y2={234} stroke="#6B7280" />
      <line x1={x0 + boxW / 2} y1={234} x2={x0 + 6 * (boxW + gap) + boxW / 2} y2={234} stroke="#6B7280" />
      {DERIVADOS.map((d, i) => {
        const x = x0 + i * (boxW + gap)
        return (
          <g key={i}>
            <line x1={x + boxW / 2} y1={234} x2={x + boxW / 2} y2={250} stroke="#6B7280" markerEnd="url(#esq-flecha)" />
            <Caja x={x} y={252} w={boxW} h={40} color={d.color} lines={d.label} />
          </g>
        )
      })}

      {/* Leyenda */}
      <g transform="translate(20 322)" className="esquema__leyenda">
        {([['Federal', F], ['Estatal', E], ['Municipal', M]] as const).map(([lbl, c], i) => (
          <g key={lbl} transform={`translate(${i * 92} 0)`}>
            <rect width={12} height={12} rx={2} fill={c} />
            <text x={18} y={10}>{lbl}</text>
          </g>
        ))}
        <line x1={300} y1={6} x2={330} y2={6} stroke="#6B7280" strokeDasharray="4 3" />
        <text x={336} y={10}>congruencia</text>
        <line x1={440} y1={6} x2={470} y2={6} stroke="#6B7280" markerEnd="url(#esq-flecha)" />
        <text x={476} y={10}>deriva / orienta</text>
      </g>
    </svg>
  )
}
