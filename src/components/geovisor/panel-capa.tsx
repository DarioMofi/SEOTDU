import { useEffect, useMemo, useState } from 'react'
import { X, BookOpenText, ChartColumn, Target } from 'lucide-react'
import { NarrativaTema, AnaliticaTema, tieneAnalitica } from '../common/contenido-tema'
import {
  getEstrategiaIndicadores,
  getProyectosSeguimiento,
  getTemasTrazabilidad,
  indicadoresDeCapa,
  pestanasDeVista,
  proyectosDeCapa,
  temasDeCapa,
  type EstrategiaIndicador,
  type ProyectoSeguimiento,
  type TemaTrazabilidad,
} from '../../lib/datosPrograma'
import { SUBSISTEMAS, VISTAS, type Vista } from '../../data/paradigmaPeotdu'

/* Panel lateral derecho de la capa seleccionada, con pestañas:
   - Narrativa: texto explicativo, políticas y justificación cualitativa
     (Trazabilidad modular, «Descripción narrativa»).
   - Analítica: cifras clave y gráficas descriptivas («Descripción analítica»).
   - Estrategia: fila de Estrategia-indicadores y seguimiento del proyecto,
     cuando la capa los tiene.
   Se abre al consultar un elemento en el mapa o con el botón de información de
   la capa; nunca por solo encenderla. */

type Pestana = 'narrativa' | 'analitica' | 'estrategia'

interface Props {
  layerId: string | null
  layerLabel?: string
  /** Rama de la capa. Desempeño → Narrativa y Analítica; Estrategia → solo
      Estrategia. Sin rama (Mapa Base, capas sueltas) se muestra lo que haya. */
  vista?: Vista
  onClose: () => void
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  if (!valor) return null
  return (
    <div className="panel-capa__dato"><dt>{etiqueta}</dt><dd>{valor}</dd></div>
  )
}

export default function PanelCapa({ layerId, layerLabel, vista, onClose }: Props) {
  const [temas, setTemas] = useState<TemaTrazabilidad[]>([])
  const [indicadores, setIndicadores] = useState<EstrategiaIndicador[]>([])
  const [proyectos, setProyectos] = useState<ProyectoSeguimiento[]>([])
  const [pestana, setPestana] = useState<Pestana>('narrativa')
  const [temaIdx, setTemaIdx] = useState(0)

  useEffect(() => {
    let vivo = true
    Promise.all([getTemasTrazabilidad(), getEstrategiaIndicadores(), getProyectosSeguimiento()]).then(([t, i, p]) => {
      if (!vivo) return
      setTemas(t); setIndicadores(i); setProyectos(p)
    })
    return () => { vivo = false }
  }, [])

  // La trazabilidad modular describe los insumos: en Desempeño solo cuentan
  // sus temas de diagnóstico; en Estrategia no se usa.
  const deCapa = useMemo(() => {
    if (!layerId || vista === 'estrategia') return []
    const lista = temasDeCapa(temas, layerId)
    return vista === 'desempeno' ? lista.filter((t) => t.vista === 'desempeno') : lista
  }, [temas, layerId, vista])
  const filas = layerId ? indicadoresDeCapa(indicadores, layerId) : []
  const proys = layerId ? proyectosDeCapa(proyectos, layerId) : []
  const hayEstrategia = filas.length > 0 || proys.length > 0

  const pestanas: Pestana[] = vista
    ? pestanasDeVista(vista)
    : [...(deCapa.length > 0 ? (['narrativa', 'analitica'] as Pestana[]) : []), ...(hayEstrategia ? (['estrategia'] as Pestana[]) : [])]

  // Pestaña inicial: la primera que corresponde a la rama de la capa
  useEffect(() => {
    setTemaIdx(0)
    setPestana(pestanas[0] ?? 'narrativa')
  }, [layerId, vista]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!layerId) return null
  const tema = deCapa[temaIdx]
  const sub = tema ? SUBSISTEMAS.find((s) => s.id === tema.subsistema) : undefined

  return (
    <aside className="panel-capa" aria-label={`Información de la capa ${layerLabel ?? layerId}`}>
      <header className="panel-capa__header">
        <div>
          <span className="panel-capa__kicker">
            {tema ? `${sub?.nombre ?? ''} · ${VISTAS[tema.vista].nombre}` : vista ? VISTAS[vista].nombre : 'Capa seleccionada'}
          </span>
          <h3>{tema?.titulo ?? layerLabel ?? layerId}</h3>
          {tema?.seccion && <span className="panel-capa__seccion">{tema.seccion}</span>}
          {!tema && filas[0]?.estrategia && <span className="panel-capa__seccion">{filas[0].estrategia}</span>}
        </div>
        <button type="button" className="panel-capa__cerrar" onClick={onClose} aria-label="Cerrar panel">
          <X className="w-4 h-4" />
        </button>
      </header>

      {deCapa.length > 1 && (
        <div className="panel-capa__temas" role="group" aria-label="Temas que usan esta capa">
          {deCapa.map((t, i) => (
            <button key={t.id} type="button" className={i === temaIdx ? 'is-activo' : ''} onClick={() => setTemaIdx(i)}>
              {t.titulo}
            </button>
          ))}
        </div>
      )}

      <div className="panel-capa__tabs" role="tablist">
        {pestanas.includes('narrativa') && (
          <button type="button" role="tab" aria-selected={pestana === 'narrativa'} className={pestana === 'narrativa' ? 'is-activo' : ''} onClick={() => setPestana('narrativa')}>
            <BookOpenText className="w-4 h-4" aria-hidden="true" /> Narrativa
          </button>
        )}
        {pestanas.includes('analitica') && (
          <button type="button" role="tab" aria-selected={pestana === 'analitica'} className={pestana === 'analitica' ? 'is-activo' : ''} onClick={() => setPestana('analitica')}>
            <ChartColumn className="w-4 h-4" aria-hidden="true" /> Analítica
          </button>
        )}
        {pestanas.includes('estrategia') && (
          <button type="button" role="tab" aria-selected={pestana === 'estrategia'} className={pestana === 'estrategia' ? 'is-activo' : ''} onClick={() => setPestana('estrategia')}>
            <Target className="w-4 h-4" aria-hidden="true" /> Estrategia
          </button>
        )}
      </div>

      <div className="panel-capa__cuerpo" role="tabpanel">
        {pestana === 'narrativa' && (
          tema ? (
            <NarrativaTema tema={tema} />
          ) : (
            <p className="panel-capa__vacio">Esta capa todavía no tiene descripción narrativa en la trazabilidad modular.</p>
          )
        )}

        {pestana === 'analitica' && (
          tema && tieneAnalitica(tema) ? (
            <AnaliticaTema tema={tema} />
          ) : (
            <p className="panel-capa__vacio">Esta capa todavía no tiene descripción analítica en la trazabilidad modular.</p>
          )
        )}

        {pestana === 'estrategia' && (
          <>
            {filas.map((f, i) => (
              <section key={i} className="panel-capa__bloque">
                <h4>Estrategia e indicador</h4>
                <dl>
                  <Dato etiqueta="Estrategia" valor={f.estrategia} />
                  <Dato etiqueta="Principio" valor={f.principio} />
                  <Dato etiqueta="Línea estratégica" valor={f.linea} />
                  <Dato etiqueta="Acción" valor={f.accion} />
                  <Dato etiqueta="Indicador" valor={f.indicador} />
                  <Dato etiqueta="Definición" valor={f.definicion} />
                  <Dato etiqueta="Método de cálculo" valor={f.metodo} />
                  <Dato etiqueta="Unidad de medida" valor={f.unidadMedida} />
                  <Dato etiqueta="Frecuencia de medición" valor={f.frecuencia} />
                  <Dato etiqueta="Línea base" valor={f.lineaBase ?? 'Por definir'} />
                  <Dato etiqueta="Meta" valor={f.meta} />
                  <Dato etiqueta="Sentido del indicador" valor={f.sentido} />
                  <Dato etiqueta="Semaforización" valor={f.semaforizacion} />
                  <Dato etiqueta="Justificación urbana/ambiental" valor={f.justificacion} />
                  <Dato etiqueta="Responsable de ejecución" valor={f.responsable} />
                  <Dato etiqueta="Fuente" valor={f.fuente} />
                </dl>
              </section>
            ))}
            {proys.map((p) => (
              <section key={p.id} className="panel-capa__bloque">
                <h4>Seguimiento del proyecto</h4>
                <dl>
                  <Dato etiqueta="Proyecto" valor={p.nombre} />
                  <Dato etiqueta="Ubicación" valor={p.ubicacion} />
                  <Dato etiqueta="Monto de inversión" valor={p.monto} />
                  <Dato etiqueta="Plazo" valor={p.plazo} />
                  <Dato etiqueta="Prioridad" valor={p.prioridad} />
                  <Dato etiqueta="Responsable de la ejecución" valor={p.responsable} />
                  <Dato etiqueta="Coordinación o concertación" valor={p.coordinacion} />
                  <Dato etiqueta="Población beneficiada" valor={p.poblacion} />
                  <Dato etiqueta="Posible fuente de financiamiento" valor={p.financiamiento} />
                </dl>
              </section>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}
