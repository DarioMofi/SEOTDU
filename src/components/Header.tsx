import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  const handleImgError = (e) => {
    e.currentTarget.style.display = 'none'
    const placeholder = e.currentTarget.nextElementSibling
    if (placeholder) placeholder.style.display = 'flex'
  }

  return (
    <header className="header" role="banner">
      <div className="header__inner">
        {/* Logotipos institucionales */}
        <div className="header__logos">
          {/* Logo Campeche */}
          <div style={{ position: 'relative', height: 56 }}>
            <img
              src="/gobiernoparatodos.jpeg"
              alt="Gobierno para todos"
              className="header__logo-img header__logo-img--campeche"
              onError={handleImgError}
            />
            <div
              className="header__logo-placeholder header__logo-img--campeche"
              style={{ display: 'none', height: 56 }}
            >
              <span style={{ fontSize: 10, color: 'var(--c-gray-md)', textAlign: 'center', lineHeight: 1.3 }}>
                Logo<br />Campeche
              </span>
            </div>
          </div>

          <div className="header__logo-divider" aria-hidden="true" />

          {/* Logo Gobierno para Todos */}
          <div style={{ position: 'relative', height: 56 }}>
            <img
              src="/logocampeche.jpg"
              alt="Logo Campeche"
              className="header__logo-img header__logo-img--gobierno"
              onError={handleImgError}
            />
            <div
              className="header__logo-placeholder header__logo-img--gobierno"
              style={{ display: 'none', height: 56 }}
            >
              <span style={{ fontSize: 10, color: 'var(--c-gray-md)', textAlign: 'center', lineHeight: 1.3 }}>
                Gobierno<br />para Todos
              </span>
            </div>
          </div>
        </div>

        {/* Botón de perfil / inicio de sesión */}
        <button 
          className="header__user-btn" 
          aria-label="Iniciar sesion"
          onClick={() => navigate('/login')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </header>
  )
}
