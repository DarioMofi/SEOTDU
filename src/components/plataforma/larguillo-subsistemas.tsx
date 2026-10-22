import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenText, ChartColumn, Layers, MapPin, X } from 'lucide-react'
import { DIMENSIONES, FACHADAS, MONITORES_INSUMOS, SUBSISTEMAS, type SubsistemaId } from '../../data/paradigmaPeotdu'
import { getIncidenciasCartografia, getTemasTrazabilidad, type IncidenciaCapa, type TemaTrazabilidad } from '../../lib/datosPrograma'
import { getCapasDesempeno, norm } from '../../lib/cartografia'
import { nombreCapaLegible } from '../../lib/textoLegible'
import { NarrativaTema, AnaliticaTema, tieneAnalitica } from '../common/contenido-tema'

/*
  Larguillo de insumos: siete fachadas = siete subsistemas del PEOTDU.

  Lectura del gráfico, de arriba abajo:
  - Cornisa de color: el monitor que agrupa a las fachadas que cubre.
  - Fachada: el subsistema. Al elegirla se abre su diagnóstico (Narrativa y
    Analítica de la trazabilidad modular, solo temas de Desempeño).
  - Placa: nombre, dimensión del paradigma y cuántos temas y capas aporta.
  - Banqueta: todo el larguillo es Desempeño territorial (insumos, 2024).

  Conexión con el geovisor: cada capa del tema, y el subsistema completo, abren
  /geovisor?modulo=…&vista=desempeno&subsistema=…&capa(s)=…, que enciende
  solo esas capas en la rama Desempeño del monitor correspondiente.
*/

type CapaGeo = { id: string; modulo: string; nombre: string }

/** Nombre original de cada capa citada en el Word (C04_CamelCase), por id normalizado */
function nombresOriginales(temas: TemaTrazabilidad[]) {
  const m = new Map<string, string>()
  for (const t of temas) {
    for (const crudo of t.capasTexto.match(/C\d+_[A-Za-z0-9_ÁÉÍÓÚáéíóúÑñ]+/g) ?? []) {
      const limpio = crudo.replace(/_+$/, '')
      if (!m.has(norm(limpio))) m.set(norm(limpio), limpio)
    }
  }
  return m
}

const urlGeovisor = (modulo: string, subsistema: SubsistemaId, capas: string[]) =>
  `/geovisor?modulo=${modulo}&vista=desempeno&subsistema=${subsistema}` +
  (capas.length === 1 ? `&capa=${encodeURIComponent(capas[0])}` : capas.length > 1 ? `&capas=${capas.map(encodeURIComponent).join(',')}` : '')

export default function LarguilloSubsistemas() {
  const navigate = useNavigate()
  const [temas, setTemas] = useState<TemaTrazabilidad[]>([])
  const [publicadas, setPublicadas] = useState<Map<string, { id: string; modulo: string }>>(new Map())
  const [activo, setActivo] = useState<SubsistemaId | null>(null)
  const [visto, setVisto] = useState<SubsistemaId | null>(null) // conserva el contenido mientras cierra
  const [monitorResaltado, setMonitorResaltado] = useState<string | null>(null)
  const [temaId, setTemaId] = useState<string | null>(null)
  const [pestana, setPestana] = useState<'narrativa' | 'analitica'>('narrativa')
  const [incidencias, setIncidencias] = useState<IncidenciaCapa[]>([])

  useEffect(() => { getIncidenciasCartografia().then(setIncidencias).catch(() => {}) }, [])

  /** Capas del tema que la tabla de incidencias da como pendientes */
  const pendientesDe = (t: TemaTrazabilidad) =>
    incidencias.filter(
      (x) => x.vista === 'desempeno' && (
        (x.capaNorm && t.capas.includes(x.capaNorm)) ||
        (x.tematica && [t.titulo, t.tema].some((n) => norm(n) === norm(x.tematica!)))
      )
    )

  useEffect(() => {
    let vivo = true
    Promise.all([getTemasTrazabilidad(), getCapasDesempeno()]).then(([t, c]) => {
      if (!vivo) return
      setTemas(t.filter((x) => x.vista === 'desempeno'))
      setPublicadas(c)
    })
    return () => { vivo = false }
  }, [])

  const nombres = useMemo(() => nombresOriginales(temas), [temas])

  /** Capas de un tema que el geovisor sí publica en Desempeño */
  const capasDe = (t: TemaTrazabilidad): CapaGeo[] =>
    t.capas
      .map((n) => {
        const p = publicadas.get(n)
        return p ? { ...p, nombre: nombreCapaLegible(nombres.get(n) ?? p.id) } : null
      })
      .filter((x): x is CapaGeo => !!x)

  const porSubsistema = useMemo(() => {
    const m = new Map<SubsistemaId, { temas: TemaTrazabilidad[]; capas: CapaGeo[] }>()
    for (const s of SUBSISTEMAS) {
      const ts = temas.filter((t) => t.subsistema === s.id)
      const capas = new Map<string, CapaGeo>()
      for (const t of ts) for (const c of capasDe(t)) capas.set(norm(c.id), c)
      m.set(s.id, { temas: ts, capas: [...capas.values()] })
    }
    return m
  }, [temas, publicadas, nombres]) // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = (id: SubsistemaId) => {
    if (activo === id) { setActivo(null); return }
    setActivo(id)
    setVisto(id)
    setTemaId(porSubsistema.get(id)?.temas[0]?.id ?? null)
    setPestana('narrativa')
    setTimeout(() => document.getElementById('larg-sub-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
  }

  const sub = SUBSISTEMAS.find((s) => s.id === visto)
  const monitorDe = (id: SubsistemaId) => MONITORES_INSUMOS.find((m) => m.subsistemas.includes(id))!
  const mon = sub ? monitorDe(sub.id) : undefined
  const datos = sub ? porSubsistema.get(sub.id) : undefined
  const tema = datos?.temas.find((t) => t.id === temaId) ?? datos?.temas[0]
  // Las capas de un subsistema pueden vivir en otro monitor del geovisor
  // (Institucionalidad: Social e Infraestructura). Se agrupan por monitor: el
  // geovisor enciende un monitor a la vez, así que hay un botón por cada uno.
  const capasSub = datos?.capas ?? []
  const capasPorModulo = MONITORES_INSUMOS
    .map((m) => ({ monitor: m, capas: capasSub.filter((c) => c.modulo === m.modulo) }))
    .filter((g) => g.capas.length > 0)

  return (
    <section className="larg-sub" aria-labelledby="larg-sub-titulo">
      <header className="larguillo-cab">
        <span className="larguillo-cab__kicker">Insumos · Desempeño territorial</span>
        <h3 id="larg-sub-titulo">Subsistemas que integran los monitores</h3>
        <p>
          Cada fachada es un subsistema del PEOTDU y cada cornisa de color agrupa las que forman un mismo monitor.
          Elige una fachada para leer su diagnóstico y encender sus capas en el geovisor.
        </p>
      </header>

      <div className="larg-sub__scroll">
        <div className={`larg-sub__calle ${monitorResaltado && !activo ? 'hay-grupo' : ''}`}>
          {/* Cornisas: el agrupamiento modular */}
          {MONITORES_INSUMOS.map((m) => (
            <button
              key={m.modulo}
              type="button"
              className={`larg-sub__cornisa ${monitorResaltado === m.modulo ? 'is-resaltado' : ''}`}
              style={{ gridColumn: `span ${m.subsistemas.length}`, '--c': m.color, '--t': m.tinta } as React.CSSProperties}
              onMouseEnter={() => setMonitorResaltado(m.modulo)}
              onMouseLeave={() => setMonitorResaltado(null)}
              onFocus={() => setMonitorResaltado(m.modulo)}
              onBlur={() => setMonitorResaltado(null)}
              onClick={() => navigate(`/geovisor?modulo=${m.modulo}&vista=desempeno`)}
              title={`Abrir el ${m.nombre} en Desempeño territorial`}
            >
              <span className="larg-sub__cornisa-rotulo">{m.nombre}</span>
              <span className="larg-sub__cornisa-num">{m.subsistemas.length} {m.subsistemas.length === 1 ? 'subsistema' : 'subsistemas'}</span>
            </button>
          ))}

          {/* Fachadas: un subsistema cada una */}
          {FACHADAS.map((f) => {
            const s = SUBSISTEMAS.find((x) => x.id === f.subsistema)!
            const m = monitorDe(s.id)
            const d = DIMENSIONES.find((x) => x.id === s.dimension)!
            const n = porSubsistema.get(s.id)
            const capasN = (n?.capas ?? []).length
            const enGrupo = monitorResaltado === m.modulo
            return (
              <div
                key={s.id}
                className={`larg-sub__lote ${activo === s.id ? 'is-activo' : ''} ${activo && activo !== s.id ? 'is-atenuado' : ''} ${enGrupo ? 'is-en-grupo' : ''}`}
                style={{ '--c': m.color, '--d': d.color } as React.CSSProperties}
                onMouseEnter={() => setMonitorResaltado(m.modulo)}
                onMouseLeave={() => setMonitorResaltado(null)}
              >
                <button
                  type="button"
                  className="larg-sub__fachada"
                  aria-pressed={activo === s.id}
                  aria-controls="larg-sub-panel"
                  aria-label={`${s.nombre} (${m.nombre}): ${activo === s.id ? 'ocultar' : 'ver'} diagnóstico`}
                  onClick={() => elegir(s.id)}
                >
                  <img src={f.img} alt="" loading="lazy" />
                </button>
                <div className="larg-sub__placa">
                  <strong><span className="larg-sub__dim" aria-hidden="true" />{s.nombre}</strong>
                  <small>{d.nombre}</small>
                  <small>{n?.temas.length ?? 0} temas · {capasN} {capasN === 1 ? 'capa' : 'capas'} en el geovisor</small>
                </div>
              </div>
            )
          })}

          {/* Banqueta: todo el larguillo es Desempeño territorial */}
          <div className="larg-sub__banqueta">
            <span>Desempeño territorial · Insumos del diagnóstico 2024</span>
          </div>
        </div>
      </div>

      {/* Diagnóstico del subsistema elegido */}
      <div
        id="larg-sub-panel"
        className={`monitor-panel larg-sub__panel-wrap ${activo ? 'is-open' : ''}`}
        style={{ '--theme': mon?.color === '#FFC000' ? '#9A7400' : mon?.color ?? '#2E8C8A' } as React.CSSProperties}
        aria-hidden={!activo}
      >
        <div className="monitor-panel__clip">
          {sub && mon && datos && (
            <div className="monitor-panel__inner">
              <header className="larg-sub__panel-cab">
                <div>
                  <span className="larg-sub__chips">
                    <span>{mon.nombre}</span>
                    <span>{DIMENSIONES.find((d) => d.id === sub.dimension)?.nombre}</span>
                    <span>Desempeño territorial</span>
                  </span>
                  <h4>{sub.nombre}</h4>
                  <p>{sub.descripcion}</p>
                </div>
                <div className="larg-sub__acciones">
                  {capasPorModulo.map((g) => (
                    <button
                      key={g.monitor.modulo}
                      type="button"
                      className="monitor-panel__geo"
                      tabIndex={activo ? 0 : -1}
                      onClick={() => navigate(urlGeovisor(g.monitor.modulo, sub.id, g.capas.map((c) => c.id)))}
                      title={`Abre el ${g.monitor.nombre} en Desempeño territorial con estas capas encendidas`}
                    >
                      <Layers className="w-4 h-4" aria-hidden="true" />
                      {capasPorModulo.length === 1
                        ? `Encender sus ${g.capas.length} ${g.capas.length === 1 ? 'capa' : 'capas'} en el geovisor →`
                        : `${g.capas.length} ${g.capas.length === 1 ? 'capa' : 'capas'} en ${g.monitor.nombre} →`}
                    </button>
                  ))}
                  <button type="button" className="larg-sub__cerrar" onClick={() => setActivo(null)} aria-label="Cerrar diagnóstico" tabIndex={activo ? 0 : -1}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {datos.temas.length === 0 ? (
                <p className="panel-capa__vacio">Este subsistema todavía no tiene temas en la trazabilidad modular.</p>
              ) : (
                <div className="larg-sub__panel">
                  <nav className="larg-sub__temas" aria-label={`Temas de ${sub.nombre}`}>
                    {datos.temas.map((t, i) => {
                      const prev = datos.temas[i - 1]
                      return (
                        <div key={t.id}>
                          {t.seccion !== prev?.seccion && <span className="larg-sub__seccion">{t.seccion}</span>}
                          <button
                            type="button"
                            className={tema?.id === t.id ? 'is-activo' : ''}
                            aria-current={tema?.id === t.id}
                            tabIndex={activo ? 0 : -1}
                            onClick={() => { setTemaId(t.id); setPestana('narrativa') }}
                          >
                            {t.titulo}
                            {capasDe(t).length > 0 && <span className="larg-sub__n">{capasDe(t).length}</span>}
                          </button>
                        </div>
                      )
                    })}
                  </nav>

                  {tema && (
                    <article className="larg-sub__tema">
                      <h5>{tema.titulo}</h5>
                      <div className="panel-capa__tabs" role="tablist">
                        <button type="button" role="tab" aria-selected={pestana === 'narrativa'} className={pestana === 'narrativa' ? 'is-activo' : ''} onClick={() => setPestana('narrativa')} tabIndex={activo ? 0 : -1}>
                          <BookOpenText className="w-4 h-4" aria-hidden="true" /> Narrativa
                        </button>
                        <button type="button" role="tab" aria-selected={pestana === 'analitica'} className={pestana === 'analitica' ? 'is-activo' : ''} onClick={() => setPestana('analitica')} tabIndex={activo ? 0 : -1}>
                          <ChartColumn className="w-4 h-4" aria-hidden="true" /> Analítica
                        </button>
                      </div>
                      <div className="larg-sub__cuerpo" role="tabpanel">
                        {pestana === 'narrativa' ? (
                          <NarrativaTema tema={tema} />
                        ) : tieneAnalitica(tema) ? (
                          <AnaliticaTema tema={tema} />
                        ) : (
                          <p className="panel-capa__vacio">Este tema todavía no tiene descripción analítica.</p>
                        )}
                      </div>
                      <div className="larg-sub__capas">
                        <span>Capas del tema en el geovisor</span>
                        {capasDe(tema).length > 0 ? (
                          capasDe(tema).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              tabIndex={activo ? 0 : -1}
                              onClick={() => navigate(urlGeovisor(c.modulo, sub.id, [c.id]))}
                            >
                              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {c.nombre}
                            </button>
                          ))
                        ) : (
                          <em>Las capas de este tema aún no están publicadas en el geovisor.</em>
                        )}
                        {pendientesDe(tema).length > 0 && (
                          <ul className="larg-sub__pendientes" aria-label="Capas pendientes de publicar">
                            {pendientesDe(tema).map((x, i) => (
                              <li key={i} title={[x.incidencia, x.observaciones].filter(Boolean).join(' · ')}>
                                <strong>{x.nombre}</strong> · {x.estatus}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
