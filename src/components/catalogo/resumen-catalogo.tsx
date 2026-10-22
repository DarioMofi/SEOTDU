import { useMemo, useState } from 'react'
import { BarChart3, ChevronDown } from 'lucide-react'
import type { Instrumento } from '../../data/instrumentosData'

/*
  Resumen del catálogo de instrumentos: cifras puntuales y una gráfica por tipo.
  Se calcula sobre la lista ya filtrada, así que responde a la búsqueda y a los
  filtros. Las barras y las cifras de vigencia también son filtros: un clic en
  «PMDU» o en «Caducos» aplica ese filtro.
*/

/** Nombre corto de cada tipo, en el orden del catálogo */
export const TIPOS_CORTOS: { tipo: string; corto: string; detalle: string }[] = [
  { tipo: 'Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano', corto: 'PEOTDU', detalle: 'Estatal' },
  { tipo: 'Programa Municipal de Desarrollo Urbano', corto: 'PMDU', detalle: 'Municipal' },
  { tipo: 'Programa Director Urbano', corto: 'PDU', detalle: 'Centro de población' },
  { tipo: 'Programa de Ordenamiento Ecológico Local del Territorio', corto: 'POEL', detalle: 'Ecológico local' },
  { tipo: 'Programa de Ordenamiento Ecológico Participativo Local', corto: 'POEPL', detalle: 'Ecológico participativo' },
]

const TOTAL_MUNICIPIOS = 13

interface Props {
  /** Selección completa: total y municipios */
  lista: Instrumento[]
  /** Selección sin el filtro de tipo: barras por tipo */
  listaTipos: Instrumento[]
  /** Selección sin el filtro de vigencia: cifras de vigentes y caducos */
  listaVersion: Instrumento[]
  total: number
  filtrado: boolean
  tiposSel: string[]
  onTipo: (tipo: string) => void
  versionSel: string | null
  onVersion: (version: string | null) => void
}

export default function ResumenCatalogo({ lista, listaTipos, listaVersion, total, filtrado, tiposSel, onTipo, versionSel, onVersion }: Props) {
  const [abierto, setAbierto] = useState(true)
  const [foco, setFoco] = useState<string | null>(null)

  const r = useMemo(() => {
    const vigentes = listaVersion.filter((i) => i.version === 'Vigente').length
    const porTipo = TIPOS_CORTOS.map((t) => {
      const suyos = listaTipos.filter((i) => i.tipo === t.tipo)
      const v = suyos.filter((i) => i.version === 'Vigente').length
      return { ...t, total: suyos.length, vigentes: v, caducos: suyos.length - v }
    })
    const municipios = new Set(lista.map((i) => i.municipio).filter(Boolean))
    const conPmdu = new Set(
      lista.filter((i) => i.tipo === TIPOS_CORTOS[1].tipo && i.version === 'Vigente').map((i) => i.municipio)
    )
    const escalas = ['Estatal', 'Municipal', 'Centro de Población'].map((e) => ({
      escala: e,
      n: lista.filter((i) => i.escala === e).length,
    }))
    return { vigentes, caducos: listaVersion.length - vigentes, base: listaVersion.length, porTipo, municipios: municipios.size, conPmdu: conPmdu.size, escalas }
  }, [lista, listaTipos, listaVersion])

  const maximo = Math.max(1, ...r.porTipo.map((t) => t.total))
  const pct = (n: number) => (r.base ? Math.round((n / r.base) * 100) : 0)

  return (
    <section className="cat-resumen" aria-labelledby="cat-resumen-titulo">
      <button
        type="button"
        className="cat-resumen__toggle"
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
      >
        <span id="cat-resumen-titulo">
          <BarChart3 size={16} aria-hidden="true" />
          {filtrado ? 'Resumen de la selección' : 'Resumen del catálogo'}
          {filtrado && <small>{lista.length} de {total} instrumentos</small>}
        </span>
        <ChevronDown size={16} className={abierto ? 'is-abierto' : ''} aria-hidden="true" />
      </button>

      {abierto && (
        <div className="cat-resumen__cuerpo">
          {/* Cifras puntuales */}
          <div className="cat-resumen__cifras">
            <div className="cat-cifra">
              <span className="cat-cifra__valor">{lista.length}</span>
              <span className="cat-cifra__rotulo">Instrumentos</span>
            </div>
            <button
              type="button"
              className={`cat-cifra cat-cifra--vigente ${versionSel === 'Vigente' ? 'is-activo' : ''}`}
              aria-pressed={versionSel === 'Vigente'}
              onClick={() => onVersion(versionSel === 'Vigente' ? null : 'Vigente')}
              title="Filtrar solo vigentes"
            >
              <span className="cat-cifra__valor">{r.vigentes}</span>
              <span className="cat-cifra__rotulo">Vigentes · {pct(r.vigentes)} %</span>
            </button>
            <button
              type="button"
              className={`cat-cifra cat-cifra--caduco ${versionSel === 'Caduco' ? 'is-activo' : ''}`}
              aria-pressed={versionSel === 'Caduco'}
              onClick={() => onVersion(versionSel === 'Caduco' ? null : 'Caduco')}
              title="Filtrar solo caducos"
            >
              <span className="cat-cifra__valor">{r.caducos}</span>
              <span className="cat-cifra__rotulo">Caducos · {pct(r.caducos)} %</span>
            </button>
            <div className="cat-cifra">
              <span className="cat-cifra__valor">{r.municipios}<small>/{TOTAL_MUNICIPIOS}</small></span>
              <span className="cat-cifra__rotulo">Municipios con instrumento</span>
            </div>
            <div className="cat-cifra">
              <span className="cat-cifra__valor">{r.conPmdu}<small>/{TOTAL_MUNICIPIOS}</small></span>
              <span className="cat-cifra__rotulo">Municipios con PMDU vigente</span>
            </div>
          </div>

          {/* Gráfica por tipo: barras horizontales, vigentes y caducos */}
          <div className="cat-resumen__grafica">
            <div className="cat-resumen__grafica-cab">
              <h3>Instrumentos por tipo</h3>
              <ul className="cat-resumen__leyenda" aria-label="Leyenda">
                <li><span className="cat-muestra cat-muestra--vigente" aria-hidden="true" />Vigente</li>
                <li><span className="cat-muestra cat-muestra--caduco" aria-hidden="true" />Caduco</li>
              </ul>
            </div>
            <ul className="cat-barras">
              {r.porTipo.map((t) => {
                const activo = tiposSel.includes(t.tipo)
                const desc = `${t.corto} (${t.detalle}): ${t.total} ${t.total === 1 ? 'instrumento' : 'instrumentos'}; ${t.vigentes} vigentes, ${t.caducos} caducos`
                return (
                  <li key={t.tipo}>
                    <button
                      type="button"
                      className={`cat-barra ${activo ? 'is-activo' : ''} ${foco && foco !== t.tipo ? 'is-atenuado' : ''}`}
                      aria-pressed={activo}
                      aria-label={`${desc}. Clic para filtrar.`}
                      onClick={() => onTipo(t.tipo)}
                      onMouseEnter={() => setFoco(t.tipo)}
                      onMouseLeave={() => setFoco(null)}
                      onFocus={() => setFoco(t.tipo)}
                      onBlur={() => setFoco(null)}
                      disabled={t.total === 0 && !activo}
                    >
                      <span className="cat-barra__rotulo">
                        <strong>{t.corto}</strong>
                        <small>{t.detalle}</small>
                      </span>
                      <span className="cat-barra__pista" aria-hidden="true">
                        {t.vigentes > 0 && <span className="cat-barra__seg cat-barra__seg--vigente" style={{ width: `${(t.vigentes / maximo) * 100}%` }} />}
                        {t.caducos > 0 && <span className="cat-barra__seg cat-barra__seg--caduco" style={{ width: `${(t.caducos / maximo) * 100}%` }} />}
                      </span>
                      <span className="cat-barra__valor">{t.total}</span>
                      {foco === t.tipo && (
                        <span className="cat-barra__tooltip" role="tooltip">
                          {t.vigentes} {t.vigentes === 1 ? 'vigente' : 'vigentes'} · {t.caducos} {t.caducos === 1 ? 'caduco' : 'caducos'}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="cat-resumen__escalas">
              Por escala:{' '}
              {r.escalas.map((e, i) => (
                <span key={e.escala}>{i > 0 && ' · '}<strong>{e.n}</strong> {e.escala === 'Centro de Población' ? 'centro de población' : e.escala.toLowerCase()}</span>
              ))}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
