import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Geovisor', path: '/geovisor' },
    { label: 'Catálogo de Instrumentos', path: '/catalogo' },
  ]

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
    const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null
    if (placeholder) placeholder.style.display = 'flex'
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Menú principal">
      <div className="navbar__inner" style={{ alignItems: 'center' }}>
        
        {/* Logotipos institucionales movidos desde el Header */}
        <div className="header__logos">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <img src="/gobiernoparatodos.jpeg" alt="Gobierno para todos" className="header__logo-img header__logo-img--campeche" onError={handleImgError} />
            <div className="header__logo-placeholder header__logo-img--campeche" style={{ display: 'none' }}>
              <span style={{ fontSize: 10, color: 'var(--c-gray-md)', textAlign: 'center', lineHeight: 1.3 }}>Logo<br />Campeche</span>
            </div>
          </div>
          <div className="header__logo-divider" aria-hidden="true" />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <img src="/logocampeche.jpg" alt="Logo Campeche" className="header__logo-img header__logo-img--gobierno" onError={handleImgError} />
            <div className="header__logo-placeholder header__logo-img--gobierno" style={{ display: 'none' }}>
              <span style={{ fontSize: 10, color: 'var(--c-gray-md)', textAlign: 'center', lineHeight: 1.3 }}>Gobierno<br />para Todos</span>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div>
          <ul className="navbar__nav" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  className={`navbar__link${isActive(item.path) ? ' navbar__link--active' : ''}`}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </nav>
  )
}
