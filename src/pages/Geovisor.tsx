import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Underfooter from '../components/Underfooter'

export default function Geovisor() {
  return (
    <div className="page-shell">
      <Header />
      <Navbar />

      <main id="main-content" className="construction" aria-live="polite">
        <h1 className="construction__title">Geovisor Territorial</h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--c-guinda)',
            fontWeight: 700,
            margin: '4px 0 0',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Se encuentra en construcción
        </p>
        <p className="construction__subtitle">
          El visualizador geográfico interactivo del estado de Campeche se encuentra en etapa de
          desarrollo. Próximamente podrá consultar capas temáticas y zonificaciones territoriales.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            marginTop: 8,
            fontSize: 13,
            color: 'var(--c-gray-md)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--c-verde)',
            }}
            aria-hidden="true"
          />
          Uso de suelo
          <span style={{ color: '#ccc' }}>·</span>
          Zonificación
          <span style={{ color: '#ccc' }}>·</span>
          Áreas naturales protegidas
        </div>
      </main>

      <Footer />
      <Underfooter />
    </div>
  )
}
