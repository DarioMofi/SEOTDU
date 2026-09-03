import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth-context';
import { LogOut, ChevronDown, ChevronUp, Map, FileText, Settings } from 'lucide-react';
import { AdminProfileIcon } from '../../common/role-icons';
import '../capturista/capturista.css';

const AdministradorSidebar = ({ 
  capasEnRevision = [], 
  instrumentosEnRevision = [], 
  onSelectCapa, 
  capaActiva,
  onSelectInstrumento,
  instrumentoActivo
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bandejaCartografiaOpen, setBandejaCartografiaOpen] = useState(true);
  const [bandejaInstrumentosOpen, setBandejaInstrumentosOpen] = useState(true);

  /* Cerrar sesion limpia el rol y regresa al inicio publico, no al login:
     el usuario sale de la plataforma institucional, no vuelve a la puerta. */
  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="admin-sidebar administrador-sidebar">

      <div className="admin-profile-section">
        <AdminProfileIcon size={64} className="profile-icon" color="#FFFFFF" />
        <div className="profile-info">
          <span className="profile-greeting">Bienvenid@ Administrador@</span>
          <span className="user-email">ejemplo@gobcampeche.mx</span>
          <button 
            type="button"
            onClick={() => navigate('/logs/global')}
            title="Ver Bitácora de Loggs"
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
            <Settings size={14} />
            <span>Bitácora de Loggs</span>
          </button>
        </div>
      </div>

      <nav className="admin-nav">
        <div className="admin-nav-group">
          
          <div className="admin-nav-header">
            <span className="nav-title">EN REVISIÓN</span>
          </div>

          {/* 1. Solicitudes de Cartografía en Revisión */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {capasEnRevision.length > 0 ? (
                    capasEnRevision.map((capa, i) => (
                      <div 
                        key={i} 
                        onClick={() => onSelectCapa && onSelectCapa(capa)} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          cursor: 'pointer', 
                          padding: '6px 8px', 
                          borderRadius: '4px', 
                          background: capaActiva === capa ? 'rgba(255, 255, 255, 0.12)' : 'transparent' 
                        }}
                      >
                        <span className="status-dot revision" />
                        <span className="bandeja-item" style={{ color: capaActiva === capa ? '#fff' : 'rgba(255, 255, 255, 0.9)' }}>
                          {capa}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '6px 8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      Sin cartografías en revisión
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Solicitudes de Instrumentos en Revisión */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {instrumentosEnRevision.length > 0 ? (
                    instrumentosEnRevision.map((inst, i) => (
                      <div 
                        key={i} 
                        onClick={() => onSelectInstrumento && onSelectInstrumento(inst)} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          cursor: 'pointer', 
                          padding: '6px 8px', 
                          borderRadius: '4px', 
                          background: instrumentoActivo === inst ? 'rgba(255, 255, 255, 0.12)' : 'transparent' 
                        }}
                      >
                        <span className="status-dot revision" />
                        <span className="bandeja-item" style={{ color: instrumentoActivo === inst ? '#fff' : 'rgba(255, 255, 255, 0.9)' }}>
                          {inst}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '6px 8px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      Sin instrumentos en revisión
                    </div>
                  )}
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

export default AdministradorSidebar;