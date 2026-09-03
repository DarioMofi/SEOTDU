import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

export default function LoginCard() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario && contrasena) {
      setShowPoliciesModal(true);
    }
  };

  const handleAcceptPolicies = () => {
    login(contrasena);
    setShowPoliciesModal(false);
    navigate('/admin-visor');
  };

  const handleCancelPolicies = () => {
    setShowPoliciesModal(false);
  };

  return (
    <div className="login-page">
      <div className="login-card" role="main" aria-labelledby="login-title">
        <div className="login-card__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="login-card__title" id="login-title">Inicio de Sesión</h1>
        <p className="login-card__subtitle">Credenciales Institucionales Gubernamentales</p>
        <div className="login-card__divider" aria-hidden="true" />

        <form onSubmit={handleSubmit} aria-label="Formulario de inicio de sesión">
          <div className="form-group">
            <label className="form-label" htmlFor="usuario">
              Usuario institucional
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              className="form-input"
              placeholder="usuario@campeche.gob.mx"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contrasena">
              Contraseña
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="contrasena"
                name="contrasena"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--c-gray-dk)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-card__submit"
          >
            Acceder al Sistema
          </button>
        </form>

        <div className="login-card__back">
          <span>¿Sin credenciales?</span>
          <a href="mailto:soporte@campeche.gob.mx" aria-label="Contactar soporte institucional">
            Contactar soporte
          </a>
          <span style={{ margin: '0 6px', color: '#ccc' }}>•</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-guinda)', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'var(--font-body)' }}
            aria-label="Regresar al inicio"
          >
            ← Regresar al inicio
          </button>
        </div>
      </div>

      {/* Modal institucional de politicas de uso */}
      {showPoliciesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              Sistema Estatal de Ordenamiento Territorial y Desarrollo Urbano (SEOTDU) del Estado de Campeche
            </h2>
            <h3 className="modal-subtitle">Políticas de uso del sitio</h3>
            
            <div className="modal-text">
              <p>
                La información geoespacial y estadística gestionada en este módulo de la plataforma del Gobierno del Estado de Campeche se encuentra en actualización continua por parte de las unidades administrativas competentes. Debido a la naturaleza dinámica del sistema, los datos pueden contener diferencias en relación al tema o característica que representa.
              </p>
              <p>
                Para fines de estandarización, todas las capas espaciales han sido reproyectadas al sistema EPSG 4326. Es responsabilidad estricta del usuario verificar la exactitud, integridad y vigencia de la información antes de realizar cualquier análisis o alteración en el sistema.
              </p>
              <p>
                Si selecciona la opción <strong>Aceptar</strong> ingresará al SEOTDU. Si selecciona <strong>Cancelar</strong> permanecerá en la página de inicio de sesión.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn-accept" onClick={handleAcceptPolicies}>
                Aceptar
              </button>
              <button type="button" className="modal-btn modal-btn-cancel" onClick={handleCancelPolicies}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}