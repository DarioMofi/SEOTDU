import { useNavigate } from 'react-router-dom';
import { Eye, History, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

/**
 * Header único de la plataforma, público e institucional.
 *
 * Sin sesión se ve igual que siempre: la barra guinda con el botón de entrar.
 * Con sesión aparecen los dos controles que el módulo de roles necesita —
 * bitácora y cerrar sesión — en vez de montar un segundo header.
 */
export default function Header() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  // El identificador del usuario todavía no lo administra AuthContext: el
  // módulo de roles solo simula la sesión. Provisional hasta que haya login real.
  const userId = localStorage.getItem('sim_user_id') || 'usuario_actual';

  const handleUserClick = () => {
    if (role) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  /* El capturista solo ve su propio historial; administrador y auditor, el global. */
  const handleAbrirBitacora = () => {
    navigate(role === 'capturista' ? `/logs/user/${userId}` : '/logs/global');
  };

  const tituloBitacora =
    role === 'capturista'
      ? 'Mi historial de actividad'
      : role === 'auditor'
        ? 'Bitácora de registros'
        : 'Bitácora de auditoría global';

  return (
    <header className={role ? 'header header--sesion' : 'header'} role="banner">
      <div
        className="header__inner"
        style={{ justifyContent: 'flex-end', padding: '4px 24px', gap: '12px' }}
      >
        {role && (
          <button
            className="header__user-btn"
            aria-label={tituloBitacora}
            title={tituloBitacora}
            onClick={handleAbrirBitacora}
          >
            {role === 'auditor' ? (
              <Eye size={18} />
            ) : role === 'administrador' ? (
              <Settings size={18} />
            ) : (
              <History size={18} />
            )}
          </button>
        )}

        {/* Boton de perfil / inicio / cierre de sesion */}
        <button
          className="header__user-btn"
          aria-label={role ? 'Cerrar sesion' : 'Iniciar sesion'}
          title={role ? 'Cerrar sesion' : 'Iniciar sesion'}
          onClick={handleUserClick}
        >
          {role ? (
            <LogOut size={18} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
