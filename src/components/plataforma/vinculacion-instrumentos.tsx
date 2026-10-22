import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, ArrowDown, ArrowUp, Scale, X } from 'lucide-react'
import {
  LEYES,
  ORDEN_COLORES,
  PYRAMID_TIERS,
  nombreReferencia,
  tituloReferencia,
  tierById,
  type ExternoId,
  type LeyId,
  type PyramidTier,
} from '../../data/sistemaPlaneacion'

/* Vinculación de cada instrumento: fundamento, congruencia y lo que orienta.
   Todo se calcula desde PYRAMID_TIERS (ver la metodología en ese archivo). */

export const METODOLOGIA_VINCULACION =
  'Fundamento: ley y artículo que regulan el instrumento. Congruencia: instrumentos superiores con los que debe alinearse. Orienta: instrumentos que se derivan de él.'

function Chip({ refId }: { refId: number | ExternoId }) {
  const tier = typeof refId === 'number' ? tierById(refId) : undefined
  const color = tier ? ORDEN_COLORES[tier.orden] : '#6B7280'
  return (
    <span className="vinc-chip" style={{ borderColor: color, color }} title={tituloReferencia(refId)}>
      {nombreReferencia(refId)}
    </span>
  )
}

/** Enlaces al fundamento jurídico del instrumento */
export function FundamentoLinks({ tier }: { tier: PyramidTier }) {
  if (tier.fundamento.length === 0) {
    return <p className="vinc-pendiente">{tier.fundamentoPendiente}</p>
  }
  return (
    <ul className="vinc-fundamento">
      {tier.fundamento.map((f) => (
        <li key={`${f.ley}-${f.articulo}`}>
          <a href={LEYES[f.ley].url} target="_blank" rel="noopener noreferrer" title={LEYES[f.ley].nombre}>
            <Scale className="w-3 h-3" aria-hidden="true" />
            {LEYES[f.ley].siglas}, art. {f.articulo}
            <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">(abre en una pestaña nueva)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/** Diagrama de nodos: congruencia (arriba) → instrumento → orienta (abajo) */
export function VinculosInstrumento({ tier }: { tier: PyramidTier }) {
  return (
    <div className="vinc-nodos">
      <span className="vinc-nodos__lbl"><ArrowUp className="w-3 h-3" aria-hidden="true" /> Congruente con</span>
      <div className="vinc-nodos__fila">
        {tier.congruencia.map((r) => <Chip key={String(r)} refId={r} />)}
      </div>
      <div className="vinc-nodos__conector" aria-hidden="true" />
      <div className="vinc-nodos__centro" style={{ background: ORDEN_COLORES[tier.orden] }}>
        {tier.sigla}
      </div>
      <div className="vinc-nodos__conector" aria-hidden="true" />
      <span className="vinc-nodos__lbl"><ArrowDown className="w-3 h-3" aria-hidden="true" /> Orienta a</span>
      <div className="vinc-nodos__fila">
        {tier.orienta.length > 0
          ? tier.orienta.map((r) => <Chip key={r} refId={r} />)
          : <span className="vinc-chip vinc-chip--texto">{tier.orientaTexto}</span>}
      </div>
    </div>
  )
}

/* Matriz relacional completa: filas = instrumentos; columnas = leyes
   (F = fundamento) e instrumentos de referencia (C = congruencia). */
const COLS_LEYES: LeyId[] = ['CPEUM', 'LP', 'LGAHOTDU', 'LGEEPA', 'LGMSV']
const COLS_INST: (number | ExternoId)[] = ['PND', 'PED', 'POE', 1, 2, 3, 5, 7, 8, 9]

export function MatrizVinculacion({ open, onClose, activeId }: { open: boolean; onClose: () => void; activeId: number }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="vinc-modal" role="dialog" aria-modal="true" aria-labelledby="vinc-modal-titulo" onClick={onClose}>
      <div className="vinc-modal__panel" onClick={(e) => e.stopPropagation()}>
        <header className="vinc-modal__header">
          <h2 id="vinc-modal-titulo">Matriz de vinculación, articulación y correspondencia</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar matriz">
            <X className="w-4 h-4" />
          </button>
        </header>
        <p className="vinc-modal__metodo"><strong>Metodología.</strong> {METODOLOGIA_VINCULACION}</p>
        <div className="vinc-modal__scroll">
          <table className="vinc-matriz">
            <thead>
              <tr>
                <th scope="col">Instrumento</th>
                {COLS_LEYES.map((l) => <th key={l} scope="col" title={LEYES[l].nombre}>{l}</th>)}
                {COLS_INST.map((c) => <th key={String(c)} scope="col" className="is-inst" title={tituloReferencia(c)}>{nombreReferencia(c)}</th>)}
              </tr>
            </thead>
            <tbody>
              {PYRAMID_TIERS.map((t) => (
                <tr key={t.id} className={t.id === activeId ? 'is-active' : ''}>
                  <th scope="row">
                    <span className="vinc-matriz__orden" style={{ background: ORDEN_COLORES[t.orden] }} />
                    {t.number} {t.sigla}
                  </th>
                  {COLS_LEYES.map((l) => {
                    const f = t.fundamento.find((x) => x.ley === l)
                    return (
                      <td key={l} title={f ? `${l}, art. ${f.articulo}` : undefined}>
                        {f ? <span className="vinc-matriz__f">F</span> : ''}
                      </td>
                    )
                  })}
                  {COLS_INST.map((c) => (
                    <td key={String(c)}>
                      {t.id === c ? <span className="vinc-matriz__self">●</span>
                        : t.congruencia.includes(c) ? <span className="vinc-matriz__c">C</span> : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="vinc-modal__leyenda">
          <span className="vinc-matriz__f">F</span> Fundamento jurídico
          <span className="vinc-matriz__c">C</span> Debe guardar congruencia con
          <span className="vinc-modal__siglas">PND: Plan Nacional de Desarrollo · PED: Plan Estatal de Desarrollo · POE: Programas de Ordenamiento Ecológico</span>
        </p>
      </div>
    </div>,
    document.body,
  )
}
