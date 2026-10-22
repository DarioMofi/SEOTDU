import { useState } from 'react'
import type { SerieTema } from '../../lib/datosPrograma'

/* Gráfica de barras de una sola serie para la pestaña Analítica.
   - Serie única: un solo tono (turquesa del paradigma), sin leyenda; el
     título nombra la serie.
   - Si hay negativos (tasas de crecimiento) se vuelve divergente: positivo en
     turquesa, negativo en tono cálido, con la línea de cero en gris.
   - Etiquetas de años → columnas (cambio en el tiempo); categorías → barras
     horizontales ordenadas, que dejan leer nombres largos.
   - Hover/foco por barra con el valor exacto y, aparte, vista de tabla. */

const POS = '#2E8C8A'
const NEG = '#C46A2B'

function formato(v: number, unidad: string | null) {
  const abs = Math.abs(v)
  const n = abs >= 1e6 ? `${(v / 1e6).toLocaleString('es-MX', { maximumFractionDigits: 1 })} M`
    : abs >= 1e4 ? v.toLocaleString('es-MX', { maximumFractionDigits: 0 })
    : v.toLocaleString('es-MX', { maximumFractionDigits: 2 })
  return unidad === '%' ? `${n} %` : unidad ? `${n} ${unidad}` : n
}

export default function GraficaBarras({ serie }: { serie: SerieTema }) {
  const [hover, setHover] = useState<number | null>(null)
  const [tabla, setTabla] = useState(false)
  const temporal = serie.datos.every((d) => /^\d{4}$/.test(d.etiqueta))
  const datos = temporal ? serie.datos : [...serie.datos].sort((a, b) => b.valor - a.valor)
  const max = Math.max(...datos.map((d) => d.valor), 0)
  const min = Math.min(...datos.map((d) => d.valor), 0)
  const rango = max - min || 1

  return (
    <figure className="grafica">
      <figcaption className="grafica__titulo">
        <span>{serie.titulo ?? 'Distribución'}{serie.unidad ? ` (${serie.unidad})` : ''}</span>
        <button type="button" onClick={() => setTabla((t) => !t)} className="grafica__vista">
          {tabla ? 'Ver gráfica' : 'Ver tabla'}
        </button>
      </figcaption>

      {tabla ? (
        <table className="grafica__tabla">
          <tbody>
            {datos.map((d) => (
              <tr key={d.etiqueta}><th scope="row">{d.etiqueta}</th><td>{formato(d.valor, serie.unidad)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : temporal ? (
        <div className="grafica__columnas" role="img" aria-label={`${serie.titulo ?? 'Serie'}: ${datos.map((d) => `${d.etiqueta} ${formato(d.valor, serie.unidad)}`).join(', ')}`}>
          <div className="grafica__plot" style={{ '--cero': `${(max / rango) * 100}%` } as React.CSSProperties}>
            {datos.map((d, i) => {
              const h = (Math.abs(d.valor) / rango) * 100
              return (
                <button
                  type="button"
                  key={d.etiqueta}
                  className="grafica__col"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${d.etiqueta}: ${formato(d.valor, serie.unidad)}`}
                >
                  <span
                    className={`grafica__col-barra ${d.valor < 0 ? 'is-neg' : ''}`}
                    style={{ height: `${h}%`, background: d.valor < 0 ? NEG : POS }}
                  />
                  {hover === i && <span className="grafica__tip">{d.etiqueta}: <b>{formato(d.valor, serie.unidad)}</b></span>}
                </button>
              )
            })}
          </div>
          <div className="grafica__eje-x">
            <span>{datos[0]?.etiqueta}</span>
            <span>{datos[datos.length - 1]?.etiqueta}</span>
          </div>
        </div>
      ) : (
        <ul className="grafica__barras">
          {datos.map((d, i) => (
            <li
              key={d.etiqueta}
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className={hover === i ? 'is-hover' : ''}
            >
              <span className="grafica__etq" title={d.etiqueta}>{d.etiqueta}</span>
              <span className="grafica__pista-barra">
                <span
                  className="grafica__barra"
                  style={{ width: `${Math.max((Math.abs(d.valor) / (Math.max(Math.abs(max), Math.abs(min)) || 1)) * 100, 1.5)}%`, background: d.valor < 0 ? NEG : POS }}
                />
              </span>
              <span className="grafica__val">{formato(d.valor, serie.unidad)}</span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
