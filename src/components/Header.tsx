import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header className="header" role="banner">
      <div className="header__inner" style={{ justifyContent: 'flex-end', padding: '4px 24px' }}>
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
