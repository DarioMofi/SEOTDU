export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        {/* Columna 1: Institucional / Logos */}
        <div>
          <h3 className="footer__col-title">Institucional</h3>
          <div className="footer__logo-row">
            <img
              src="/gobiernoparatodos.jpeg"
              alt="Gobierno del Estado de Campeche"
              className="footer__logo-img"
              style={{ width: 120 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <img
              src="/gobiernoparatodos.jpg"
              alt="Gobierno para Todos"
              className="footer__logo-img"
              style={{ width: 140 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <p style={{ fontSize: 12, color: 'var(--c-gray-md)', lineHeight: 1.6, marginTop: 8 }}>
              Sistema Estatal de Planeación y Ordenamiento Territorial de Campeche.
            </p>
          </div>
        </div>

        {/* Columna 2: Transparencia */}
        <div>
          <h3 className="footer__col-title">Transparencia</h3>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">Portal de Obligaciones</a></li>
            <li><a href="#" className="footer__link">Declaración Patrimonial</a></li>
            <li><a href="#" className="footer__link">Compras Públicas</a></li>
            <li><a href="#" className="footer__link">Acceso a la Información</a></li>
            <li><a href="#" className="footer__link">Indicadores de Desempeño</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h3 className="footer__col-title">Contacto</h3>
          <div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">📍</span>
              <span>Av. 16 de Septiembre No. 348, Col. Centro, Campeche, Cam.</span>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">📞</span>
              <span>(981) 811-9200</span>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">✉️</span>
              <span>contacto@campeche.gob.mx</span>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true">🕐</span>
              <span>Lunes a Viernes, 8:00 - 15:00 hrs</span>
            </div>
          </div>
        </div>

        {/* Columna 4: Enlaces */}
        <div>
          <h3 className="footer__col-title">Enlaces</h3>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">Gobierno del Estado</a></li>
            <li><a href="#" className="footer__link">SEDATU</a></li>
            <li><a href="#" className="footer__link">INEGI</a></li>
            <li><a href="#" className="footer__link">CONABIO</a></li>
            <li><a href="#" className="footer__link">SEMARNAT</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
