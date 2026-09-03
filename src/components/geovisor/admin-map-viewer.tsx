import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, ScaleControl, Polyline, Marker, Tooltip, useMapEvents, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { Download, Map, List, Plus, Minus, Ruler, ChevronDown, ChevronUp, Printer, UploadCloud, XCircle, CheckCircle } from 'lucide-react';

import { useAuth } from '../../context/auth-context';

// Importación de Sidebars específicos de cada rol
import AdministradorSidebar from '../perfiles/administradora/administrador-sidebar';
import CapturistaSidebar from '../perfiles/capturista/capturista-sidebar';
import AuditorSidebar from '../perfiles/auditora/auditor-sidebar';

// Importación de Paneles y Modales específicos
import PanelDictamen from '../perfiles/administradora/panel-dictamen';
import CapturistaModal from '../perfiles/capturista/capturista-modal';

import 'leaflet/dist/leaflet.css';
import './admin-map-viewer.css';
import '../perfiles/administradora/admin.css';
import '../perfiles/capturista/capturista.css';
import '../perfiles/auditora/auditor.css';

/* Helper para capturar la instancia del mapa */
const MapInstanceCapture = ({ setMapInstance }: { setMapInstance: (map: L.Map) => void }) => {
  const map = useMap();
  useEffect(() => { setMapInstance(map); }, [map, setMapInstance]);
  return null;
};

/* Helper para el vuelo automático del mapa (Auditor) */
const MapFlyTo = ({ capaActiva }: { capaActiva: string }) => {
  const map = useMap();
  useEffect(() => {
    if (capaActiva) map.flyTo([19.83, -90.54], 11, { duration: 1.5 });
  }, [capaActiva, map]);
  return null;
};

/* Componente para la herramienta de medicion lineal */
const MeasureTool = ({ isMeasuring }: { isMeasuring: boolean }) => {
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [distance, setDistance] = useState(0);

  useMapEvents({
    click(e) {
      if (!isMeasuring) return;
      const newPoints = [...points, e.latlng];
      setPoints(newPoints);
      if (newPoints.length > 1) {
        let dist = 0;
        for (let i = 0; i < newPoints.length - 1; i++) {
          dist += newPoints[i].distanceTo(newPoints[i + 1]);
        }
        setDistance(dist);
      }
    }
  });

  useEffect(() => { if (!isMeasuring) { setPoints([]); setDistance(0); } }, [isMeasuring]);

  if (!isMeasuring || points.length === 0) return null;
  const dotIcon = L.divIcon({ className: 'measure-dot', iconSize: [10, 10] });

  return (
    <>
      <Polyline positions={points} color="#6b1428" weight={3} dashArray="5, 10" />
      {points.map((p, i) => (
        <Marker key={i} position={p} icon={dotIcon}>
          {i === points.length - 1 && points.length > 1 && (
            <Tooltip permanent direction="right" offset={[10, 0]} className="measure-tooltip">
              {(distance / 1000).toFixed(2)} km
            </Tooltip>
          )}
        </Marker>
      ))}
    </>
  );
};

const mockGeoJSONData: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { id: "T-001" },
    geometry: { type: "Polygon", coordinates: [[[-90.58, 19.82], [-90.48, 19.82], [-90.48, 19.88], [-90.58, 19.88], [-90.58, 19.82]]] }
  }]
};

const CAMPECHE_BOUNDS: L.LatLngBoundsExpression = [[13.5, -97.0], [25.0, -83.0]];

const AdminMapViewer = () => {
  const { role } = useAuth(); // ESTADO GLOBAL (Rol: 'administrador', 'capturista' o 'auditor')

  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  
  /* Herramientas de Mapa */
  const [mapaBaseOpen, setMapaBaseOpen] = useState(false);
  const [activeBaseMap, setActiveBaseMap] = useState('esriClaro');
  const [isMeasuring, setIsMeasuring] = useState(false);

  /* Logica de arrastre de la caja de herramientas */
  const [herramientasPos, setHerramientasPos] = useState({ x: 380, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ startX: 0, startY: 0, x: 0, y: 0 });

  /* --- Estados Globales del Visor (Compartidos) --- */
  const [capaActiva, setCapaActiva] = useState('');
  
  /* --- Estados Específicos: Administrador --- */
  const [isDictamenOpen, setIsDictamenOpen] = useState(false);
  const [recursoDictamen, setRecursoDictamen] = useState('');
  const [tipoDictamen, setTipoDictamen] = useState<'cartografia' | 'instrumento'>('cartografia');
  const [instrumentoActivoAdmin, setInstrumentoActivoAdmin] = useState('');
  /* Nada en la interfaz lista todavia las capas aprobadas; se conserva el
     setter para no perder el flujo cuando exista esa vista. */
  const [, setCapasAprobadas] = useState<string[]>(['red_vial_primaria']);
  const [capasEnRevision, setCapasEnRevision] = useState(['red_ciclovias_v2', 'censo_paraderos_2026', 'pimus_municipio_carmen']);
  const [instrumentosEnRevisionAdmin, setInstrumentosEnRevisionAdmin] = useState(['PIMUS_Carmen_2025.pdf', 'Programa_Movilidad_Estatal_2024.pdf']);
  
  /* --- Estados Específicos: Capturista --- */
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; tipo: 'cartografia' | 'instrumento' }>({ isOpen: false, tipo: 'cartografia' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [capasEnBorradores, setCapasEnBorradores] = useState<string[]>([]);
  const [instrumentosEnBorradores] = useState<string[]>([]);
  const [instrumentosEnRevision, setInstrumentosEnRevision] = useState(['PIMUS_Carmen_2025.pdf']);
  const [actionLog, setActionLog] = useState('');

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { startX: e.clientX, startY: e.clientY, x: herramientasPos.x, y: herramientasPos.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setHerramientasPos({
        x: dragStartPos.current.x + (e.clientX - dragStartPos.current.startX),
        y: dragStartPos.current.y + (e.clientY - dragStartPos.current.startY)
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  const renderBaseMap = () => {
    switch (activeBaseMap) {
      /* Esri Canvas, claro y oscuro. Van sin su capa de etiquetas
         (`*_Reference`) a propósito: sus topónimos son exónimos en inglés
         («Havana», no «La Habana»).

         `maxNativeZoom` porque el teselado de Esri solo llega a z16: sin eso el
         mapa se queda en blanco al acercar más. */
      case 'esriClaro': return (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          maxNativeZoom={16}
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
        />
      );
      case 'esriObscuro': return (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={19}
          maxNativeZoom={16}
          attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
        />
      );
      case 'googleTer': return <TileLayer url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" />;
      case 'googleSat': return <TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />;
      default: return null;
    }
  };

  /* Funciones Administrador */
  const handleSelectCapaAdmin = (nombreCapa: string) => {
    setCapaActiva(nombreCapa);
    setInstrumentoActivoAdmin('');
    setRecursoDictamen(nombreCapa);
    setTipoDictamen('cartografia');
    setIsDictamenOpen(true);
    if (mapInstance) mapInstance.flyTo([19.85, -90.53], 12, { duration: 1.5 });
  };

  const handleSelectInstrumentoAdmin = (nombreInstrumento: string) => {
    setCapaActiva('');
    setInstrumentoActivoAdmin(nombreInstrumento);
    setRecursoDictamen(nombreInstrumento);
    setTipoDictamen('instrumento');
    setIsDictamenOpen(true);
  };

  const procesarDictamen = (decision: 'aprobar' | 'rechazar', _comentario: string) => {
    if (tipoDictamen === 'cartografia') {
      setCapasEnRevision(prev => prev.filter(c => c !== recursoDictamen));
      if (decision === 'aprobar') {
        setCapasAprobadas(prev => [recursoDictamen, ...prev]);
      }
    } else {
      setInstrumentosEnRevisionAdmin(prev => prev.filter(inst => inst !== recursoDictamen));
    }
    setIsDictamenOpen(false);
    setRecursoDictamen('');
    setCapaActiva('');
    setInstrumentoActivoAdmin('');
  };

  /* Funciones Capturista */
  const handleOpenCapturistaModal = (tipo: 'cartografia' | 'instrumento') => {
    setModalConfig({ isOpen: true, tipo });
  };

  const handleVerifyLayer = (nombreArchivo: string) => {
    setCapaActiva(nombreArchivo);
    setCapasEnBorradores(prev => [nombreArchivo, ...prev]);
    setActionLog(`Carga inicial: Archivos de "${nombreArchivo}" retenidos en memoria local.`);
    setIsVerifying(true);
    if (mapInstance) mapInstance.flyTo([19.85, -90.53], 12, { duration: 1.5 });
  };

  const handleSubmitInstrumento = (nombreDocumento: string) => {
    setInstrumentosEnRevision(prev => [nombreDocumento, ...prev]);
    setActionLog(`Instrumento enviado: "${nombreDocumento}" registrado para dictamen institucional.`);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleFinalSubmit = () => {
    if (capaActiva) {
      setCapasEnBorradores(prev => prev.filter(capa => capa !== capaActiva));
      setCapasEnRevision(prev => [capaActiva, ...prev]);
      setActionLog(`Confirmación EPSG y visualización: "${capaActiva}" enviada a revisión institucional.`);
    }
    setIsVerifying(false);
    setCapaActiva('');
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    if (mapInstance) mapInstance.flyTo([19.3, -90.5], 8, { duration: 1.5 });
  };

  /* Funciones Auditor */
  const [instrumentoActivoAuditor, setInstrumentoActivoAuditor] = useState('');
  const handleSelectCapaAuditoria = (nombreCapa: string) => {
    setInstrumentoActivoAuditor('');
    setCapaActiva(nombreCapa);
  };
  const handleSelectInstrumentoAuditoria = (nombreInstrumento: string) => {
    setCapaActiva('');
    setInstrumentoActivoAuditor(nombreInstrumento);
  };

  /* Determinar Color y Estilo de la capa según rol o estado */
  const getGeoJsonStyle = () => {
    if (role === 'administrador') return { color: '#F59E0B', weight: 4, fillColor: '#F59E0B', fillOpacity: 0.3 };
    if (role === 'capturista') return { color: '#9F2241', weight: 2, fillColor: '#9F2241', fillOpacity: 0.4 };
    if (role === 'auditor') return { color: '#6B7280', weight: 2, fillColor: '#6B7280', fillOpacity: 0.2 };
    return { color: '#3388ff', weight: 2, fillColor: '#3388ff', fillOpacity: 0.2 };
  };

  return (
    <div className="dashboard-fullscreen-container">
      
      {/* AREA DEL MAPA Y HERRAMIENTAS GLOBALES */}
      <div className={`dashboard-map-area ${isMeasuring ? 'measuring-mode' : ''}`}>
        
        {/* CAJA DE HERRAMIENTAS UNIFICADA */}
        <div className="draggable-wrapper" style={{ left: `${herramientasPos.x}px`, top: `${herramientasPos.y}px`, position: 'absolute', zIndex: 1000, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '8px' }}>
          
          <div className="floating-panel" style={{ position: 'relative', top: 'auto', left: 'auto', width: '280px', margin: 0 }}>
            <div className="panel-header drag-handle" onMouseDown={handleMouseDown}>
              <List size={18} /><h4>Herramientas del Mapa</h4>
            </div>

            <div className="panel-content" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h5 className="panel-section-title">Simbología Activa</h5>
              {capaActiva ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: getGeoJsonStyle().fillColor, border: `2px solid ${getGeoJsonStyle().color}`, borderRadius: '2px', opacity: 0.6 }}></div>
                    <span style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={capaActiva}>
                      {capaActiva}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '24px' }}>
                    {role === 'auditor' ? 'Capa Histórica (Auditoría)' : (isVerifying ? 'Capa Vectorial (En memoria)' : 'Capa Vectorial Activa')}
                  </span>
                </div>
              ) : (
                <p className="text-muted" style={{ margin: 0 }}>No hay capas activas en el visor.</p>
              )}
            </div>

            {/* Elemento solo para Administradores */}
            {role === 'administrador' && (
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                <button className="btn-base btn-tertiary">
                  <Printer size={16} /> Imprimir Plano
                </button>
              </div>
            )}

            <div className="accordion-section">
              <button className="accordion-header" onClick={() => setMapaBaseOpen(!mapaBaseOpen)}>
                <div className="header-title"><Map size={16} /><span>Mapa Base</span></div>
                {mapaBaseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`accordion-content ${mapaBaseOpen ? 'open' : ''}`}>
                <div className="base-map-grid" style={{ marginTop: '8px' }}>
                  <button className={`base-map-btn ${activeBaseMap === 'esriClaro' ? 'active' : ''}`} onClick={() => setActiveBaseMap('esriClaro')}>Claro</button>
                  <button className={`base-map-btn ${activeBaseMap === 'esriObscuro' ? 'active' : ''}`} onClick={() => setActiveBaseMap('esriObscuro')}>Obscuro</button>
                  <button className={`base-map-btn ${activeBaseMap === 'googleTer' ? 'active' : ''}`} onClick={() => setActiveBaseMap('googleTer')}>Terreno</button>
                  <button className={`base-map-btn ${activeBaseMap === 'googleSat' ? 'active' : ''}`} onClick={() => setActiveBaseMap('googleSat')}>Satelital</button>
                </div>
              </div>
            </div>
          </div>

          <div className="external-toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={() => mapInstance?.zoomIn()} title="Acercar"><Plus size={16} /></button>
            <button onClick={() => mapInstance?.zoomOut()} title="Alejar"><Minus size={16} /></button>
            <button className={isMeasuring ? 'active' : ''} onClick={() => setIsMeasuring(!isMeasuring)} title="Medir distancia"><Ruler size={16} /></button>
          </div>
        </div>

        <MapContainer center={[19.3, -90.5]} zoom={8} minZoom={7} maxBounds={CAMPECHE_BOUNDS} zoomControl={false} style={{ width: '100%', height: '100%', zIndex: 1 }} preferCanvas={true}>
          <MapInstanceCapture setMapInstance={setMapInstance} />
          {renderBaseMap()}
          {role === 'auditor' && <MapFlyTo capaActiva={capaActiva} />}
          
          {capaActiva && (
            <GeoJSON 
              key={capaActiva} 
              data={mockGeoJSONData} 
              pathOptions={getGeoJsonStyle()} 
            />
          )}
          <ScaleControl position="bottomleft" imperial={false} />
          <MeasureTool isMeasuring={isMeasuring} />
        </MapContainer>
      </div>

      {/* RENDERIZADO CONDICIONAL DE SIDEBARS */}
      <div className="floating-sidebar-wrapper">
        {role === 'administrador' && (
          <AdministradorSidebar 
            capasEnRevision={capasEnRevision} 
            instrumentosEnRevision={instrumentosEnRevisionAdmin}
            onSelectCapa={handleSelectCapaAdmin} 
            capaActiva={capaActiva}
            onSelectInstrumento={handleSelectInstrumentoAdmin}
            instrumentoActivo={instrumentoActivoAdmin}
          />
        )}
        {role === 'capturista' && (
          <CapturistaSidebar 
            onOpenModal={handleOpenCapturistaModal} 
            isVerifying={isVerifying} 
            onFinalSubmit={handleFinalSubmit}
            capasEnBorradores={capasEnBorradores} 
            capasEnRevision={capasEnRevision}
            instrumentosEnBorradores={instrumentosEnBorradores}
            instrumentosEnRevision={instrumentosEnRevision}
            actionLog={actionLog}
          />
        )}
        {role === 'auditor' && (
          <AuditorSidebar 
            onSelectCapa={handleSelectCapaAuditoria} 
            capaActiva={capaActiva}
            onSelectInstrumento={handleSelectInstrumentoAuditoria}
            elementoActivo={capaActiva || instrumentoActivoAuditor}
          />
        )}
      </div>

      {/* RENDERIZADO CONDICIONAL DE PANELES EXCLUSIVOS */}

      {/* Administrador: Dictamen */}
      {role === 'administrador' && (
        <PanelDictamen 
          elemento={recursoDictamen}
          tipo={tipoDictamen}
          isOpen={isDictamenOpen} 
          onClose={() => {
            setIsDictamenOpen(false);
            setRecursoDictamen('');
            setCapaActiva('');
            setInstrumentoActivoAdmin('');
          }} 
          onDictamen={procesarDictamen} 
        />
      )}

      {/* Capturista: Modal de carga */}
      {role === 'capturista' && (
        <CapturistaModal 
          isOpen={modalConfig.isOpen} 
          tipo={modalConfig.tipo}
          isVerifying={isVerifying}
          onClose={() => {
            setModalConfig(prev => ({ ...prev, isOpen: false }));
            setIsVerifying(false);
            setCapaActiva('');
          }} 
          onVerify={handleVerifyLayer} 
          onSubmitInstrumento={handleSubmitInstrumento}
        />
      )}

      {/* Auditor: Línea de tiempo */}
      {role === 'auditor' && (capaActiva || instrumentoActivoAuditor) && (
        <div className="floating-right-panel" style={{ width: '380px', height: 'calc(100% - 48px)', bottom: '24px' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="panel-section-title" style={{ margin: 0, fontSize: '10px' }}>Registro de Actividad</span>
              <h3 style={{ margin: '2px 0 0', fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '230px' }} title={capaActiva || instrumentoActivoAuditor}>
                {capaActiva || instrumentoActivoAuditor}
              </h3>
            </div>
            <button className="btn-base btn-tertiary" style={{ width: 'auto', padding: '0 8px', height: '28px', fontSize: '11px', gap: '4px' }}>
              <Download size={12} /> PDF
            </button>
          </div>
          <div className="timeline-container">
            {/* Acciones en forma ascendente: más antiguas arriba, más recientes abajo */}
            <div className="timeline-item">
              <div className="timeline-icon upload"><UploadCloud size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-user">Capturista (Juan C.)</span>
                  <span className="timeline-date">10 Ago 2026, 10:00</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  {instrumentoActivoAuditor 
                    ? 'Carga inicial del documento normativo en formato PDF.' 
                    : 'Carga inicial del archivo .geojson y metadatos.'}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon reject"><XCircle size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-user">Administradora (Rocío)</span>
                  <span className="timeline-date">11 Ago 2026, 11:45</span>
                </div>
                <p className="timeline-comment">
                  {instrumentoActivoAuditor
                    ? '"Falta adjuntar el anexo de metodología y verificar firmas en la última sección."'
                    : '"La capa tiene un desfase de 30 metros en la zona norte del polígono. Revisar EPSG antes de volver a enviar."'}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon upload"><UploadCloud size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-user">Capturista (Juan C.)</span>
                  <span className="timeline-date">11 Ago 2026, 16:30</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  {instrumentoActivoAuditor 
                    ? 'Se subió la versión corregida con el anexo metodológico.' 
                    : 'Se subió la corrección geométrica de la capa.'}
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon approve"><CheckCircle size={16} /></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-user">Administradora (Rocío)</span>
                  <span className="timeline-date">12 Ago 2026, 09:15</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px' }}>
                  {instrumentoActivoAuditor 
                    ? 'Instrumento normativo aprobado y resguardado formalmente.' 
                    : 'Capa aprobada y publicada en el tablero operativo.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMapViewer;