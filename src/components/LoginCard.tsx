import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginCard() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', contrasena: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1400)
  }

  return (
    <div className="login-page">
      <div className="login-card" role="main" aria-labelledby="login-title">
        {/* Ícono institucional */}
        <div className="login-card__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="login-card__title" id="login-title">Inicio de Sesión</h1>
        <p className="login-card__subtitle">Credenciales Institucionales Gubernamentales</p>
        <div className="login-card__divider" aria-hidden="true" />

        <form onSubmit={handleSubmit} noValidate aria-label="Formulario de inicio de sesión">
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
              value={form.usuario}
              onChange={handleChange}
              autoComplete="username"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contrasena">
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.contrasena}
              onChange={handleChange}
              autoComplete="current-password"
              required
              aria-required="true"
            />
          </div>

          <button
            type="submit"
            className="login-card__submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Verificando...' : 'Acceder al Sistema'}
          </button>
        </form>

        <div className="login-card__back">
          <span>¿Sin credenciales?</span>
          <a href="mailto:soporte@campeche.gob.mx" aria-label="Contactar soporte institucional">
            Contactar soporte
          </a>
          <span style={{ margin: '0 6px', color: '#ccc' }}>·</span>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-guinda)', fontWeight: 600, fontSize: 13, padding: 0, fontFamily: 'var(--font-body)' }}
            aria-label="Regresar a inicio"
          >
            ← Regresar al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
