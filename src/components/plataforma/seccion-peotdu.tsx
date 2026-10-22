import { Link } from 'react-router-dom'
import { BookOpen, Download, FileText, Map as MapIcon, CheckCircle2 } from 'lucide-react'
import ImageSlot from '../common/image-slot'
import {
  PEOTDU_CAPITULOS,
  PEOTDU_FASES,
  PEOTDU_FASES_TEXTO,
  PEOTDU_PDF_CONDENSADA,
  PEOTDU_PDF_OFICIAL,
  PEOTDU_PORTADA,
  PEOTDU_PUNTOS,
} from '../../data/peotduEstructura'

/** Botones de descarga: versión condensada y versión oficial */
export function PeotduDescargas() {
  return (
    <div className="peotdu-cta">
      {PEOTDU_PDF_CONDENSADA ? (
        <a className="peotdu-cta__btn peotdu-cta__btn--outline" href={PEOTDU_PDF_CONDENSADA} download>
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span><strong>Versión condensada</strong><small>Descripción general</small></span>
        </a>
      ) : (
        <span className="peotdu-cta__btn peotdu-cta__btn--outline is-disabled" aria-disabled="true"
          title="La versión condensada se publicará próximamente">
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span><strong>Versión condensada</strong><small>Próximamente</small></span>
        </span>
      )}
      <a className="peotdu-cta__btn" href={PEOTDU_PDF_OFICIAL} target="_blank" rel="noopener noreferrer">
        <Download className="w-4 h-4" aria-hidden="true" />
        <span><strong>Versión oficial</strong><small>Documento completo (PDF)</small></span>
      </a>
    </div>
  )
}

/** Fase 3 del hero: qué es el PEOTDU, descargas y portada oficial */
export function PeotduResumen() {
  return (
    <div className="peotdu-resumen">
      <div className="peotdu-resumen__texto">
        <h2 className="hero-fase3-title">
          Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano (PEOTDU)
        </h2>
        <ul className="peotdu-resumen__lista">
          {PEOTDU_PUNTOS.map((p, i) => (
            <li key={i}>
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <a href="#estructura-peotdu" className="peotdu-resumen__ancla">
          <BookOpen className="w-4 h-4" aria-hidden="true" /> Ver los 10 capítulos del programa
        </a>
      </div>
      <div className="peotdu-resumen__portada">
        <ImageSlot
          src={PEOTDU_PORTADA}
          alt="Portada oficial del Programa Estatal de Ordenamiento Territorial y Desarrollo Urbano de Campeche"
          className="peotdu-portada"
          fallback={<div className="peotdu-portada__fallback">PEOTDU<br />Campeche</div>}
        />
        <PeotduDescargas />
      </div>
    </div>
  )
}

/** Sección posterior al hero: fases y capitulado con enlaces al documento */
export default function SeccionEstructuraPeotdu() {
  return (
    <section id="estructura-peotdu" className="peotdu-estructura" aria-labelledby="peotdu-estructura-titulo">
      <div className="peotdu-estructura__inner">
        <header className="peotdu-estructura__header">
          <span className="peotdu-estructura__kicker">PEOTDU Campeche 2023</span>
          <h2 id="peotdu-estructura-titulo">Estructura del programa: 5 fases y 10 capítulos</h2>
          <p>{PEOTDU_FASES_TEXTO}</p>
        </header>

        <ol className="peotdu-fases" aria-label="Fases de desarrollo del PEOTDU">
          {PEOTDU_FASES.map((f) => (
            <li key={f.numero}>
              <span className="peotdu-fases__num">{f.numero}</span>
              <span className="peotdu-fases__nombre">{f.nombre}</span>
            </li>
          ))}
        </ol>

        <ol className="peotdu-capitulos" aria-label="Capitulado del PEOTDU">
          {PEOTDU_CAPITULOS.map((c) => (
            <li key={c.numero} className="peotdu-capitulo" data-fase={c.fase}>
              <div className="peotdu-capitulo__head">
                <span className="peotdu-capitulo__num">{c.romano}</span>
                <div>
                  <h3>{c.corto}</h3>
                  <span className="peotdu-capitulo__fase">
                    Fase {c.fase}{c.titulo !== c.corto ? ` · ${c.titulo}` : ''}
                  </span>
                </div>
              </div>
              <p>{c.descripcion}</p>
              <div className="peotdu-capitulo__links">
                <a href={`${PEOTDU_PDF_OFICIAL}#page=${c.pagina}`} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Texto y gráficos
                </a>
                {c.modulo && (
                  <Link to={`/geovisor?modulo=${c.modulo}`}>
                    <MapIcon className="w-3.5 h-3.5" aria-hidden="true" /> Mapas
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        {/* Las descargas viven bajo la portada del programa (PeotduResumen) */}
      </div>
    </section>
  )
}
