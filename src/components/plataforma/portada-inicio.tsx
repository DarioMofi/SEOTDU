import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, Pyramid, Castle, Factory, Users } from 'lucide-react'
import ImageSlot from '../common/image-slot'
import { CAMPECHE_SVG_VIEWBOX, CAMPECHE_STATE_PATH } from '../../data/campecheSilhouetteSvg'

/* Portada de la página de inicio: imagen hero + mosaico histórico.
   Las fotografías son espacios listos (ver ImageSlot): se sustituyen dejando
   el archivo en public/img/inicio/ con el nombre indicado en `src`. */

interface Epoca {
  id: string
  titulo: string
  periodo: string
  texto: string
  src: string
  icono: ReactNode
  tono: string
}

const EPOCAS: Epoca[] = [
  {
    id: 'maya',
    titulo: 'Pasado maya',
    periodo: 'Siglos III a XVI',
    texto: 'Edzná, Calakmul y Becán organizaron el territorio peninsular con ciudades, caminos y sistemas de agua.',
    src: '/img/inicio/historia-maya.jpg',
    icono: <Pyramid aria-hidden="true" />,
    tono: '#7A5C3A',
  },
  {
    id: 'colonial',
    titulo: 'Etapa colonial',
    periodo: '1540 – 1821',
    texto: 'San Francisco de Campeche se funda en 1540; sus murallas y baluartes la protegieron de la piratería.',
    src: '/img/inicio/historia-colonial.jpg',
    icono: <Castle aria-hidden="true" />,
    tono: '#9F2241',
  },
  {
    id: 'moderno',
    titulo: 'Modernización del siglo XX',
    periodo: '1900 – 1999',
    texto: 'Ferrocarril, carreteras y el auge petrolero de la Sonda de Campeche transformaron la economía del estado.',
    src: '/img/inicio/historia-siglo-xx.jpg',
    icono: <Factory aria-hidden="true" />,
    tono: '#235B4E',
  },
  {
    id: 'actual',
    titulo: 'Actualidad',
    periodo: 'Siglo XXI',
    texto: 'Más de 928 mil personas en 13 municipios que planean su territorio con visión de largo plazo.',
    src: '/img/inicio/historia-actualidad.jpg',
    icono: <Users aria-hidden="true" />,
    tono: '#AB7A2E',
  },
]

function FondoSilueta({ tono }: { tono: string }) {
  return (
    <div className="portada-fallback" style={{ '--tono': tono } as CSSProperties}>
      <svg viewBox={CAMPECHE_SVG_VIEWBOX} className="portada-fallback__silueta" aria-hidden="true">
        <path d={CAMPECHE_STATE_PATH} />
      </svg>
    </div>
  )
}

export default function PortadaInicio() {
  const irAlTerritorio = () => {
    document.getElementById('territorio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="portada" aria-labelledby="portada-titulo">
      <div className="portada__grid">
        {/* Imagen hero */}
        <ImageSlot
          src="/img/inicio/hero.jpg"
          alt="Personas en el centro histórico de San Francisco de Campeche al atardecer"
          className="portada__hero"
          fallback={<FondoSilueta tono="#9F2241" />}
          caption={
            <div className="portada__hero-texto">
              <span className="portada__kicker">Estado de Campeche</span>
              <h2 id="portada-titulo" className="portada__titulo">
                Un territorio que se planea con su gente
              </h2>
              <p className="portada__bajada">
                Consulta cómo se ordena el territorio campechano: sus instrumentos de planeación,
                su cartografía oficial y los datos que sustentan cada decisión.
              </p>
              <button type="button" className="portada__cta" onClick={irAlTerritorio}>
                Explorar el territorio <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          }
        />

        {/* Mosaico histórico */}
        <div className="portada__mosaico" role="list" aria-label="Campeche a través del tiempo">
          <h3 className="portada__mosaico-titulo">Campeche a través del tiempo</h3>
          {EPOCAS.map((e) => (
            <div key={e.id} role="listitem" className="portada__tile" tabIndex={0}>
              <ImageSlot
                src={e.src}
                alt={`${e.titulo}: ${e.texto}`}
                fallback={
                  <div className="portada-fallback" style={{ '--tono': e.tono } as CSSProperties}>
                    <span className="portada-fallback__icono">{e.icono}</span>
                  </div>
                }
                caption={
                  <>
                    <span className="portada__tile-periodo">{e.periodo}</span>
                    <strong className="portada__tile-titulo">{e.titulo}</strong>
                    <span className="portada__tile-texto">{e.texto}</span>
                  </>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
