import Header from '../components/plataforma/header'
import Navbar from '../components/plataforma/navbar'
import Footer from '../components/plataforma/footer'
import Underfooter from '../components/plataforma/underfooter'

export default function Catalogo() {
  return (
    <div className="page-shell">
      <Header />
      <Navbar />

      <main id="main-content" className="construction" aria-live="polite">
        <h1 className="construction__title">Catálogo de Instrumentos</h1>
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
          Estamos desarrollando el acervo institucional de instrumentos de planeación y ordenamiento
          territorial. Próximamente disponible.
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
              background: 'var(--c-beige-lt)',
            }}
            aria-hidden="true"
          />
          Planes de desarrollo urbano
          <span style={{ color: '#ccc' }}>·</span>
          Ordenamiento ecológico
          <span style={{ color: '#ccc' }}>·</span>
          Normas territoriales
        </div>
      </main>

      <Footer />
      <Underfooter />
    </div>
  )
}
