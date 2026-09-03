import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth-context';
import { Eye, LogOut, ChevronDown, ChevronUp, Map, FileText, Search } from 'lucide-react';
import '../capturista/capturista.css';
import './auditor.css';

interface AuditorSidebarProps {
  /* El segundo argumento se pasa desde el listado de instrumentos, pero hoy el
     handler de admin-map-viewer solo lee el primero. */
  onSelectCapa?: (nombre: string, tipo?: string) => void;
  capaActiva?: string;
  onSelectInstrumento?: (nombre: string) => void;
  elementoActivo?: string;
}

const AuditorSidebar = ({ onSelectCapa, capaActiva, onSelectInstrumento, elementoActivo }: AuditorSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [bandejaCartografiaOpen, setBandejaCartografiaOpen] = useState(true);
  const [bandejaInstrumentosOpen, setBandejaInstrumentosOpen] = useState(false);

  /* Mock de capas e instrumentos auditables */
  const capasAuditables = ['red_ciclovias_v2', 'pimus_municipio_carmen', 'censo_paraderos_2026'];
  const instrumentosAuditables = ['PIMUS_Carmen_2025.pdf', 'Programa_Movilidad_Estatal_2024.pdf', 'Dictamen_Normativo_Urbano.pdf'];

  const activo = elementoActivo || capaActiva;

  /* Cerrar sesion limpia el rol y regresa al inicio publico, no al login:
     el usuario sale de la plataforma institucional, no vuelve a la puerta. */
  const cerrarSesion = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="admin-sidebar auditor-sidebar">

      <div className="admin-profile-section">
        <Eye size={64} className="profile-icon" color="#9CA3AF" />
        <div className="profile-info">
          <span className="profile-greeting">Bienvenid@ Auditor@</span>
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
            <Eye size={14} />
            <span>Bitácora de Loggs</span>
          </button>
        </div>
      </div>

      <nav className="admin-nav">
        <div className="admin-nav-group">
          
          {/* Buscador actualizado */}
          <div className="sidebar-search-container">
            <div className="search-input-wrapper">
              <Search size={16} color="rgba(255,255,255,0.6)" />
              <input type="text" placeholder="Buscar usuario, cartografia o instrumento" />
            </div>
          </div>

          {/* Título de sección actualizado */}
          <div className="admin-nav-header">
            <span className="nav-title">ACTIVIDAD</span>
          </div>

          {/* Nuevo: Filtro de fecha a fecha */}
          <div style={{ padding: '0 20px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>Desde</label>
              <input 
                type="date" 
                style={{ 
                  width: '100%', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '4px', 
                  color: '#fff', 
                  padding: '6px 8px', 
                  fontSize: '12px', 
                  outline: 'none', 
                  fontFamily: 'var(--font-body)',
                  colorScheme: 'dark' /* Ayuda a que el icono del calendario del navegador se vea bien en fondos oscuros */
                }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block', textTransform: 'uppercase' }}>Hasta</label>
              <input 
                type="date" 
                style={{ 
                  width: '100%', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '4px', 
                  color: '#fff', 
                  padding: '6px 8px', 
                  fontSize: '12px', 
                  outline: 'none', 
                  fontFamily: 'var(--font-body)',
                  colorScheme: 'dark'
                }} 
              />
            </div>
          </div>

          <button className={`admin-nav-link ${bandejaCartografiaOpen ? 'active' : ''}`} onClick={() => setBandejaCartografiaOpen(!bandejaCartografiaOpen)}>
            <Map size={18} />
            <span>Historial de Cartografia</span>
            {bandejaCartografiaOpen ? <ChevronUp size={16} className="nav-chevron" /> : <ChevronDown size={16} className="nav-chevron" />}
          </button>

          <div className={`admin-nav-submenu ${bandejaCartografiaOpen ? 'open' : ''}`} style={{ background: 'transparent', maxHeight: bandejaCartografiaOpen ? '800px' : '0' }}>
            <div className="box-container">
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {capasAuditables.map((capa, i) => (
                    <div 
                      key={i} 
                      onClick={() => onSelectCapa && onSelectCapa(capa)} 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 8px', borderRadius: '4px', background: activo === capa ? 'rgba(255, 255, 255, 0.18)' : 'transparent' }}
                    >
                      <FileText size={14} color={activo === capa ? '#fff' : 'var(--c-white, #ffffff)'} />
                      <span className="bandeja-item" style={{ color: 'var(--c-white, #ffffff)', fontWeight: activo === capa ? '600' : 'normal' }}>{capa}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button className={`admin-nav-link ${bandejaInstrumentosOpen ? 'active' : ''}`} onClick={() => setBandejaInstrumentosOpen(!bandejaInstrumentosOpen)} style={{ marginTop: '8px' }}>
            <FileText size={18} />
            <span>Historial de Instrumentos</span>
            {bandejaInstrumentosOpen ? <ChevronUp size={16} className="nav-chevron" /> : <ChevronDown size={16} className="nav-chevron" />}
          </button>

          <div className={`admin-nav-submenu ${bandejaInstrumentosOpen ? 'open' : ''}`} style={{ background: 'transparent', maxHeight: bandejaInstrumentosOpen ? '800px' : '0' }}>
            <div className="box-container">
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {instrumentosAuditables.map((inst, i) => (
                    <div 
                      key={i} 
                      onClick={() => onSelectInstrumento ? onSelectInstrumento(inst) : (onSelectCapa && onSelectCapa(inst, 'instrumento'))} 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 8px', borderRadius: '4px', background: activo === inst ? 'rgba(255, 255, 255, 0.18)' : 'transparent' }}
                    >
                      <FileText size={14} color={activo === inst ? '#fff' : 'var(--c-white, #ffffff)'} />
                      <span className="bandeja-item" style={{ color: 'var(--c-white, #ffffff)', fontWeight: activo === inst ? '600' : 'normal' }}>{inst}</span>
                    </div>
                  ))}
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

export default AuditorSidebar;