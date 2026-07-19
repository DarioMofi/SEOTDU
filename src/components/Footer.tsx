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
            <li><a href="#" className="footer__link">Transparencia Estatal</a></li>
            <li><a href="#" className="footer__link">Conectividad Para Todos</a></li>
            <li><a href="#" className="footer__link">Laboratorios de Transformación Digital</a></li>
            <li><a href="#" className="footer__link">Ko'ox</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
