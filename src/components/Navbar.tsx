import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchValue, setSearchValue] = useState('')

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Catálogo de Instrumentos', path: '/catalogo' },
    { label: 'Geovisor', path: '/geovisor' },
  ]

  return (
    <nav className="navbar" role="navigation" aria-label="Menú principal">
      <div className="navbar__inner">
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

        <div className="navbar__search">
          <label htmlFor="site-search" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Buscar en el sitio
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="site-search"
              type="search"
              className="navbar__search-input"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              aria-label="Buscar en el sitio"
              style={{ paddingRight: '36px' }}
            />
            <span style={{ position: 'absolute', right: '12px', display: 'flex', color: 'var(--c-gray-dk)', pointerEvents: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
