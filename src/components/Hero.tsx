import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hero" aria-label="Presentación principal">
      {/* Imagen de fondo del estado de Campeche */}
      <img
        src="/campeche.jpeg"
        alt="Vista aérea del estado de Campeche"
        className="hero__bg"
        aria-hidden="true"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      {/* Overlay de contraste */}
      <div className="hero__overlay" aria-hidden="true" />

      <div className="hero__content">
        <h1 className="hero__title">
          Sistema Estatal de Planeación y Ordenamiento Territorial de Campeche
        </h1>
      </div>
    </section>
  )
}
