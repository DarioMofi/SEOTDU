export default function Hero() {
  return (
    <section className="hero" aria-label="Presentación principal">
      {/* Fotografía de alta resolución con sobrevuelo de cámara cinematográfico */}
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
          Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano del estado de Campeche
        </h1>
      </div>
    </section>
  )
}
