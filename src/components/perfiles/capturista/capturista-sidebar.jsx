import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth-context';
import { LogOut, ChevronDown, ChevronUp, CheckCircle2, FileText, Map, History } from 'lucide-react';
import { CapturistaProfileIcon } from '../../common/role-icons';
import './capturista.css';

const CapturistaSidebar = ({ 
  onOpenModal, 
  isVerifying, 
  onFinalSubmit, 
  capasEnBorradores = [], 
  capasEnRevision = [],
  instrumentosEnBorradores = [],
  instrumentosEnRevision = []
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bandejaCartografiaOpen, setBandejaCartografiaOpen] = useState(true);
  const [bandejaInstrumentosOpen, setBandejaInstrumentosOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmitAndReset = () => {
    onFinalSubmit();
    setTermsAccepted(false);
  };

  /* Cerrar sesion limpia el rol y regresa al inicio publico, no al login:
     el usuario sale de la plataforma institucional, no vuelve a la puerta. */
  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="admin-sidebar capturista-sidebar">

      <div className="admin-profile-section">
        <CapturistaProfileIcon size={64} className="profile-icon" color="#FFFFFF" />
        <div className="profile-info">
          <span className="profile-greeting">Bienvenid@</span>
          <span className="profile-role">Capturista</span>
          <span className="user-email">ejemplo@gobcampeche.com</span>
          <button 
            type="button"
            onClick={() => navigate('/logs/user/capturista_01')}
            title="Ver Historial de Actividades"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              marginTop: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--c-dorado, #BC955B)',
              fontSize: '13px',
              fontStyle: 'italic',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              textAlign: 'left'
            }}
          >
            <History size={14} />
            <span>Historial de Actividades</span>
          </button>
        </div>
      </div>

      <nav className="admin-nav">
        <div className="admin-nav-group">
          
          <div className="admin-nav-header">
            <span className="nav-title">SUBIR AL SISTEMA</span>
          </div>

          <div style={{ padding: '0 20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              className="btn-base btn-white" 
              onClick={() => onOpenModal('cartografia')} 
              disabled={isVerifying} 
              style={{ opacity: isVerifying ? 0.5 : 1, justifyContent: 'flex-start', padding: '0 14px', alignItems: 'center' }}
            >
              <span style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1, marginRight: '6px' }}>+</span> Cartografía
            </button>
            <button 
              className="btn-base btn-white" 
              onClick={() => onOpenModal('instrumento')} 
              disabled={isVerifying} 
              style={{ opacity: isVerifying ? 0.5 : 1, justifyContent: 'flex-start', padding: '0 14px', alignItems: 'center' }}
            >
              <span style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1, marginRight: '6px' }}>+</span> Instrumentos
            </button>
          </div>

          {/* Banner UX del Último Paso para Cartografía */}
          {isVerifying && (
            <div style={{ 
              margin: '0 20px 16px', 
              padding: '12px 14px', 
              background: 'var(--c-white)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)' 
            }}>
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 6px', color: 'var(--c-guinda)', fontSize: '13px', fontWeight: '700' }}>
                <CheckCircle2 size={16} color="#10B981" /> Último paso.
              </h5>
              
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '10px', lineHeight: '1.35' }}>
                Revisa que la visualización de la capa sea correcta antes de enviarla.
              </p>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.35', fontWeight: '500' }}>
                  Estoy de acuerdo con enviar la capa a la Etapa de Revisión Administrativa.
                </span>
              </label>

              <button 
                className="btn-base btn-primary" 
                onClick={handleSubmitAndReset} 
                disabled={!termsAccepted}
                style={{ 
                  width: '100%', 
                  height: '34px',
                  fontSize: '12px',
                  background: termsAccepted ? '#10B981' : '#E5E7EB', 
                  color: termsAccepted ? '#ffffff' : '#9CA3AF',
                  cursor: termsAccepted ? 'pointer' : 'not-allowed',
                  border: 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Enviar a revisión
              </button>
            </div>
          )}

          <div className="admin-nav-header">
            <span className="nav-title">BANDEJA DE ENTRADA</span>
          </div>

          {/* Acordeón 1: Cartografía */}
          <button 
            className={`admin-nav-link ${bandejaCartografiaOpen ? 'active' : ''}`} 
            onClick={() => setBandejaCartografiaOpen(!bandejaCartografiaOpen)}
          >
            <Map size={18} />
            <span>Cartografía</span>
            {bandejaCartografiaOpen ? <ChevronUp size={16} className="nav-chevron" /> : <ChevronDown size={16} className="nav-chevron" />}
          </button>

          <div className={`admin-nav-submenu ${bandejaCartografiaOpen ? 'open' : ''}`} style={{ background: 'transparent', maxHeight: bandejaCartografiaOpen ? '800px' : '0' }}>
            <div className="box-container">
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">En Borradores</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {capasEnBorradores.length > 0 ? (
                    capasEnBorradores.map((capa, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <span className="bandeja-item" title={capa}>{capa}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Bandeja vacía</span>
                  )}
                </div>
              </div>

              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">En Revisión</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {capasEnRevision.length > 0 ? (
                    capasEnRevision.map((capa, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <span className="bandeja-item" title={capa}>{capa}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Sin capas en revisión</span>
                  )}
                </div>
              </div>

              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">Aprobados</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <span className="bandeja-item">red_vial_primaria</span>
                </div>
              </div>

              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">Rechazados</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <span className="bandeja-item">censo_paraderos_2025</span>
                  <span style={{ fontSize: '11px', color: '#FCA5A5', cursor: 'pointer', textDecoration: 'underline' }}>
                    Ver comentarios
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Acordeón 2: Instrumentos Normativos */}
          <button 
            className={`admin-nav-link ${bandejaInstrumentosOpen ? 'active' : ''}`} 
            onClick={() => setBandejaInstrumentosOpen(!bandejaInstrumentosOpen)}
            style={{ marginTop: '8px' }}
          >
            <FileText size={18} />
            <span>Instrumentos</span>
            {bandejaInstrumentosOpen ? <ChevronUp size={16} className="nav-chevron" /> : <ChevronDown size={16} className="nav-chevron" />}
          </button>

          <div className={`admin-nav-submenu ${bandejaInstrumentosOpen ? 'open' : ''}`} style={{ background: 'transparent', maxHeight: bandejaInstrumentosOpen ? '800px' : '0' }}>
            <div className="box-container">
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">En Borradores</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {instrumentosEnBorradores.length > 0 ? (
                    instrumentosEnBorradores.map((inst, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <span className="bandeja-item" title={inst}>{inst}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Bandeja vacía</span>
                  )}
                </div>
              </div>

              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">En Revisión</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {instrumentosEnRevision.length > 0 ? (
                    instrumentosEnRevision.map((inst, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <span className="bandeja-item" title={inst}>{inst}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Sin instrumentos en revisión</span>
                  )}
                </div>
              </div>

              <div style={{ width: '100%', overflow: 'hidden' }}>
                <h5 className="bandeja-category-title">Aprobados</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <span className="bandeja-item">PIMUS_Campeche_2024.pdf</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="admin-nav-group" style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button className="admin-nav-link text-logout" onClick={cerrarSesion}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default CapturistaSidebar;