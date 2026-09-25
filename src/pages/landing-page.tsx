import { useNavigate } from 'react-router-dom'
import Header from '../components/plataforma/header'
import Navbar from '../components/plataforma/navbar'
import Hero from '../components/plataforma/hero'
import Larguillo from '../components/plataforma/larguillo'
import FaqBox from '../components/plataforma/faq-box'
import Footer from '../components/plataforma/footer'
import Underfooter from '../components/plataforma/underfooter'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="page-shell">
      <Header />
      <Navbar />

      <main id="main-content">
        <Hero />
        
        <section className="bg-white pt-1">
          <Larguillo />
        </section>

        {/* Sección de interacción: descripción + FAQ */}
        <section className="interaction" aria-labelledby="interaction-heading">
          <div className="interaction__inner">
            {/* Columna izquierda (60%) */}
            <div>
              <h2
                id="interaction-heading"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--c-guinda)',
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                Acceso Rápido y Consultas Frecuentes
              </h2>
              <p className="interaction__text">
                Explora el territorio de Campeche a través de nuestras herramientas de planeación y
                ordenamiento. Consulte normativas, usos de suelo y planes de desarrollo del
                municipio. Acceda al visualizador interactivo o busque documentos oficiales
                directamente en el acervo institucional.
              </p>
             
              <div className="interaction__actions">
                <button
                  className="btn btn--primary"
                  onClick={() => navigate('/geovisor')}
                  aria-label="Abrir Geovisor interactivo"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Abrir Geovisor
                </button>
                <button
                  className="btn btn--outline"
                  onClick={() => navigate('/catalogo')}
                  aria-label="Consultar catálogo de instrumentos"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  Consultar Catálogo
                </button>
              </div>
            </div>

            {/* Columna derecha (40%) */}
            <FaqBox />
          </div>
        </section>

        {/* Cuadricula de modulos, desactivada. Para reactivarla hay que volver
            a importar ModulesGrid desde components/plataforma/modules-grid. */}
      </main>

      <Footer />
      <Underfooter />
    </div>
  )
}
