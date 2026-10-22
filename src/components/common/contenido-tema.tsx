import type { ReactNode } from 'react'
import GraficaBarras from '../geovisor/grafica-barras'
import type { TemaTrazabilidad } from '../../lib/datosPrograma'

/*
  Contenido de un tema de la trazabilidad modular (Narrativa / Analítica).
  Lo comparten el panel lateral del geovisor y el larguillo de subsistemas de
  la página de inicio, para que el mismo tema se lea igual en ambos lugares.
*/

/** Texto plano del Word -> párrafos y listas */
export function Texto({ texto }: { texto: string }) {
  const bloques = texto.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className="panel-capa__texto">
      {bloques.map((b, i) => {
        const lineas = b.split('\n')
        if (lineas.every((l) => l.startsWith('- '))) {
          return <ul key={i}>{lineas.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>
        }
        return <p key={i}>{b.replace(/\n/g, ' ')}</p>
      })}
    </div>
  )
}

/** Cifra destacada dentro de un texto: los números se resaltan */
export function conCifras(t: string): ReactNode[] {
  return t.split(/(\$?[\d][\d.,]*\s?%?)/g).map((p, i) => (/\d/.test(p) ? <b key={i}>{p}</b> : p))
}

/** «Título: texto» de cada viñeta analítica -> tarjetas de cifras clave */
export function tarjetasAnaliticas(texto: string) {
  return texto
    .split(/\n(?=- )/)
    .map((b) => b.replace(/^- /, '').replace(/\n/g, ' ').trim())
    .map((b) => {
      const m = b.match(/^([^:]{3,90}):\s*(.+)$/)
      return m ? { titulo: m[1], texto: m[2] } : { titulo: null, texto: b }
    })
    .filter((t) => /\d/.test(t.texto))
    .slice(0, 8)
}

/** Pestaña Narrativa: descripción (si difiere), narrativa y variables */
export function NarrativaTema({ tema }: { tema: TemaTrazabilidad }) {
  return (
    <>
      {/* En las políticas del MOT la narrativa ES la descripción: no repetirla */}
      {tema.descripcion && tema.descripcion.trim() !== tema.narrativa.trim() && (
        <p className="panel-capa__lead">{tema.descripcion.replace(/\n/g, ' ')}</p>
      )}
      <Texto texto={tema.narrativa} />
      {tema.variables && (
        <div className="panel-capa__meta"><strong>Variables:</strong> {tema.variables.replace(/\n/g, ' ')}</div>
      )}
    </>
  )
}

export const tieneAnalitica = (tema: TemaTrazabilidad) => !!(tema.analitica || tema.series.length)

/** Pestaña Analítica: cifras clave, gráficas y fuente */
export function AnaliticaTema({ tema }: { tema: TemaTrazabilidad }) {
  const tarjetas = tarjetasAnaliticas(tema.analitica)
  return (
    <>
      {tarjetas.length > 0 && (
        <div className="panel-capa__kpis">
          {tarjetas.map((t, i) => (
            <div key={i} className="panel-capa__kpi">
              {t.titulo && <strong>{t.titulo}</strong>}
              <p>{conCifras(t.texto)}</p>
            </div>
          ))}
        </div>
      )}
      {tema.series.map((s, i) => <GraficaBarras key={i} serie={s} />)}
      {tarjetas.length === 0 && <Texto texto={tema.analitica} />}
      <p className="panel-capa__fuente">Fuente: PEOTDU Campeche 2023, trazabilidad modular del SEOTDU.</p>
    </>
  )
}
