import { useEffect, useState } from 'react'
import { X, Target, ClipboardList, ChevronDown } from 'lucide-react'
import {
  getEstrategiaIndicadores,
  getProyectosSeguimiento,
  indicadoresDeCapa,
  proyectosDeCapa,
  type EstrategiaIndicador,
  type ProyectoSeguimiento,
} from '../../lib/datosPrograma'

/* Panel junto a la simbología: la fila completa de Estrategia-indicadores de
   la capa seleccionada y, si existe, el seguimiento de su proyecto. Así se
   leen juntas la representación cartográfica y su estrategia. */

interface Props {
  layerId: string | null
  layerLabel?: string
  onClose: () => void
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  if (!valor) return null
  return (
    <div className="panel-estrategia__dato">
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  )
}

export default function PanelEstrategia({ layerId, layerLabel, onClose }: Props) {
  const [indicadores, setIndicadores] = useState<EstrategiaIndicador[]>([])
  const [proyectos, setProyectos] = useState<ProyectoSeguimiento[]>([])
  const [abierto, setAbierto] = useState(true)

  useEffect(() => {
    let vivo = true
    Promise.all([getEstrategiaIndicadores(), getProyectosSeguimiento()]).then(([i, p]) => {
      if (!vivo) return
      setIndicadores(i)
      setProyectos(p)
    })
    return () => { vivo = false }
  }, [])

  useEffect(() => { setAbierto(true) }, [layerId])

  if (!layerId) return null
  const filas = indicadoresDeCapa(indicadores, layerId)
  const proys = proyectosDeCapa(proyectos, layerId)
  if (filas.length === 0 && proys.length === 0) return null
  const f0 = filas[0]

  return (
    <aside className={`panel-estrategia ${abierto ? '' : 'is-collapsed'}`} aria-label="Estrategia e indicadores de la capa seleccionada">
      <header className="panel-estrategia__header">
        <button type="button" className="panel-estrategia__toggle" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
          <span className="panel-estrategia__kicker">{f0?.estrategia ?? proys[0]?.estrategia}</span>
          <strong>{f0?.nombreCapa ?? layerLabel ?? layerId}</strong>
          <ChevronDown className="panel-estrategia__chev w-4 h-4" aria-hidden="true" />
        </button>
        <button type="button" className="panel-estrategia__close" onClick={onClose} aria-label="Cerrar panel de estrategia">
          <X className="w-4 h-4" />
        </button>
      </header>

      {abierto && (
        <div className="panel-estrategia__body">
          {filas.map((f, i) => (
            <section key={i} className="panel-estrategia__bloque">
              <h4><Target className="w-3.5 h-3.5" aria-hidden="true" /> Estrategia e indicador</h4>
              <dl>
                <Dato etiqueta="Monitor" valor={f.monitor} />
                <Dato etiqueta="Principio" valor={f.principio} />
                <Dato etiqueta="Línea estratégica" valor={f.linea} />
                <Dato etiqueta="Acción" valor={f.accion} />
                <Dato etiqueta="Dimensión" valor={f.dimension} />
                <Dato etiqueta="Indicador" valor={f.indicador} />
                <Dato etiqueta="Definición" valor={f.definicion} />
                <Dato etiqueta="Método de cálculo" valor={f.metodo} />
                <Dato etiqueta="Unidad de medida" valor={f.unidadMedida} />
                <Dato etiqueta="Unidad de análisis" valor={f.unidadAnalisis} />
                <Dato etiqueta="Frecuencia de medición" valor={f.frecuencia} />
                <Dato etiqueta="Línea base" valor={f.lineaBase ?? 'Por definir'} />
                <Dato etiqueta="Línea aprobatoria" valor={f.lineaAprobatoria ?? 'Por definir'} />
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
            <section key={p.id} className="panel-estrategia__bloque">
              <h4><ClipboardList className="w-3.5 h-3.5" aria-hidden="true" /> Seguimiento del proyecto</h4>
              <dl>
                <Dato etiqueta="Proyecto" valor={p.nombre} />
                <Dato etiqueta="Ubicación" valor={p.ubicacion} />
                <Dato etiqueta="Monto de inversión" valor={p.monto} />
                <Dato etiqueta="Inversión" valor={[p.publico && 'Pública', p.privado && 'Privada'].filter(Boolean).join(' y ') || null} />
                <Dato etiqueta="Plazo" valor={p.plazo} />
                <Dato etiqueta="Prioridad" valor={p.prioridad} />
                <Dato etiqueta="Responsable de la ejecución" valor={p.responsable} />
                <Dato etiqueta="Coordinación o concertación" valor={p.coordinacion} />
                <Dato etiqueta="Población beneficiada" valor={p.poblacion} />
                <Dato etiqueta="Posible fuente de financiamiento" valor={p.financiamiento} />
              </dl>
            </section>
          ))}
        </div>
      )}
    </aside>
  )
}
