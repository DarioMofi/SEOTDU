export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        {/* Columna 1: Institucional / Logos */}
        <div>
          {/* El titulo va dentro del bloque para que comparta centro con el
              escudo; el tamano lo pone `.footer__logo-img`. */}
          <div className="footer__logo-row">
            <h3 className="footer__col-title">Institucional</h3>
            <img
              src="/gobiernoparatodos.jpeg"
              alt="Gobierno del Estado de Campeche"
              className="footer__logo-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <p style={{ fontSize: 14, color: 'var(--c-guinda)', lineHeight: 1.6, marginTop: 8 }}>
              Campeche.gob.mx
            </p>
          </div>
        </div>

        {/* Columna 2: Transparencia */}
        <div>
          <h3 className="footer__col-title">Transparencia</h3>
          <ul className="footer__links">
            <li><a href="#" className="footer__link">Plataforma Nacional de Transparencia</a></li>
            <li><a href="#" className="footer__link">ITDIF</a></li>
            <li><a href="#" className="footer__link">Presupuesto Ciudadano</a></li>
            <li><a href="#" className="footer__link">Indicadores de Desempeño</a></li>
            <li><a href="#" className="footer__link">Consejo de Armonización Contable</a></li>
            <li><a href="#" className="footer__link">Programa Anual de Evaluación</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h3 className="footer__col-title">Contacto</h3>
          <div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true"></span>
              <span>Tel. (981) 8119200</span>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true"></span>
              <span>X</span>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true"></span>
              <span>Facebook</span>
            </div>
            <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true"></span>
              <span>Instagram</span>
            </div>
             <div className="footer__contact-item">
              <span className="footer__contact-icon" aria-hidden="true"></span>
              <span>Tiktok</span>
            </div>
          </div>
        </div>

        {/* Columna 4: Enlaces */}
        <div>
          <h3 className="footer__col-title">Enlaces</h3>
          <ul className="footer__links">
            <li>
              <a
                href="https://sedumop.campeche.gob.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                SEDUMOP
              </a>
            </li>
            <li>
              <a
                href="https://www.infocam.gob.mx/infocam/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link"
              >
                INFOCAM
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
