import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, ArrowRight, ArrowLeft, CheckCircle, FileText, Database, AlertTriangle, File, Palette, RefreshCw, PlusCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import './capturista.css';
import catalogos from '../../plataforma/catalogo-prueba.json';

const CapturistaModal = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  onSubmitInstrumento, 
  tipo = 'cartografia',
  isVerifying = false
}) => {
  const [step, setStep] = useState(1);
  const [accion, setAccion] = useState('nuevo'); // 'nuevo' | 'actualizar'
  const [elementoAActualizar, setElementoAActualizar] = useState('');
  const [epsgConfirmed, setEpsgConfirmed] = useState(false);
  
  const [archivo, setArchivo] = useState(null);
  const [estilo, setEstilo] = useState(null);
  const [documento, setDocumento] = useState(null);

  // Estados de Ficha Técnica (Paso 2)
  const [fuente, setFuente] = useState('');
  const [fuenteOtra, setFuenteOtra] = useState('');
  const [responsable, setResponsable] = useState('Gobierno de Campeche');
  const [escala, setEscala] = useState('');
  const [periodicidad, setPeriodicidad] = useState('');
  const [monitor, setMonitor] = useState('');
  const [instrumentoOrigen, setInstrumentoOrigen] = useState('');
  const [horizonte, setHorizonte] = useState('');
  const [fecha, setFecha] = useState('');
  const [ejeEvaluacion, setEjeEvaluacion] = useState('');

  const [dragActive, setDragActive] = useState({ a: false, b: false, c: false });
  const [fileError, setFileError] = useState(null); 
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const prevTipoRef = useRef(tipo);
  const maxSteps = 3;
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  useEffect(() => {
    if (documento && documento instanceof File) {
      const url = URL.createObjectURL(documento);
      setPdfPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfPreviewUrl(null);
    }
  }, [documento]);

  const resetForm = () => {
    setStep(1);
    setAccion('nuevo');
    setElementoAActualizar('');
    setEpsgConfirmed(false);
    setArchivo(null);
    setEstilo(null);
    setDocumento(null);
    setFuente('');
    setFuenteOtra('');
    setResponsable('Gobierno de Campeche');
    setEscala('');
    setPeriodicidad('');
    setMonitor('');
    setInstrumentoOrigen('');
    setHorizonte('');
    setFecha('');
    setEjeEvaluacion('');
    setFileError(null);
    setIsCollapsed(false);
  };

  // Al abrir el modal asegurar que no esté colapsado (salvo en modo verificación)
  useEffect(() => {
    if (isOpen && !isVerifying) {
      setIsCollapsed(false);
    }
  }, [isOpen, isVerifying]);

  // Si se cierra definitivamente el modal, reiniciar el formulario
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Solo si cambia de tipo (ej. de cartografía a instrumento) se reinicia el formulario
  useEffect(() => {
    if (prevTipoRef.current !== tipo) {
      prevTipoRef.current = tipo;
      resetForm();
    }
  }, [tipo]);

  if (!isOpen) return null;

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, maxSteps));
    setFileError(null); 
  };
  
  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setFileError(null);
  };

  const isValidExtension = (fileName, allowedExtensions) => {
    if (!fileName) return false;
    const ext = `.${fileName.split('.').pop().toLowerCase()}`;
    return allowedExtensions.includes(ext);
  };

  const handleDragOver = (e, zone) => {
    e.preventDefault();
    setDragActive({ ...dragActive, [zone]: true });
  };
  const handleDragLeave = (e, zone) => {
    e.preventDefault();
    setDragActive({ ...dragActive, [zone]: false });
  };

  const handleDropArchivo = (e) => {
    e.preventDefault();
    setDragActive({ ...dragActive, a: false });
    const file = e.dataTransfer.files[0];
    if (file && isValidExtension(file.name, ['.geojson', '.kml', '.gpkg', '.zip'])) {
      setArchivo(file);
      setFileError(null);
    } else if (file) {
      setFileError("Intente de nuevo. La capa espacial debe tener extensión .geojson, .kml, .gpkg o .zip");
    }
  };

  const handleDropEstilo = (e) => {
    e.preventDefault();
    setDragActive({ ...dragActive, b: false });
    const file = e.dataTransfer.files[0];
    if (file && isValidExtension(file.name, ['.sld', '.qml'])) {
      setEstilo(file);
      setFileError(null);
    } else if (file) {
      setFileError("Intente de nuevo. El archivo de estilo debe tener extensión .sld o .qml");
    }
  };

  const handleDropDocumento = (e) => {
    e.preventDefault();
    setDragActive({ ...dragActive, c: false });
    const file = e.dataTransfer.files[0];
    if (file && isValidExtension(file.name, ['.pdf'])) {
      setDocumento(file);
      setFileError(null);
    } else if (file) {
      setFileError("Intente de nuevo. El documento técnico debe ser formato .pdf");
    }
  };

  const handleRequestClose = () => {
    // Si hay archivos cargados (Paso 1), pedir confirmación
    const hasFiles = Boolean(archivo || estilo || documento);
    if (hasFiles) {
      setShowConfirmModal(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    resetForm();
    setShowConfirmModal(false);
    onClose();
  };

  const handleFinishInstrumento = () => {
    const nombre = documento?.name || (accion === 'actualizar' && elementoAActualizar ? `${elementoAActualizar} (Actualizado).pdf` : 'Nuevo_Instrumento.pdf');
    if (onSubmitInstrumento) {
      onSubmitInstrumento(nombre);
    }
    resetForm();
    onClose();
  };

  const handleFinishCartografia = () => {
    const nombre = archivo?.name || (accion === 'actualizar' && elementoAActualizar ? `${elementoAActualizar}_v2` : 'capa_nueva');
    onVerify(nombre);
    setIsCollapsed(true); // Se repliega automáticamente para ver el mapa, pero dejando drawer-expand-tab visible
  };

  // Mock de elementos existentes para la opción de actualizar
  const elementosExistentes = tipo === 'instrumento' 
    ? ['PIMUS_Campeche_2024.pdf', 'Plan_Estatal_Desarrollo_2021_2027.pdf', 'Ley_Movilidad_Campeche_2023.pdf']
    : ['red_vial_primaria', 'censo_paraderos_2025', 'ciclovias_sector_norte'];

  return (
    <>
      {/* Pestaña lateral cuando el drawer está replegado (visible incluso tras paso 3) */}
      {isOpen && isCollapsed && (
        <button 
          className="drawer-expand-tab" 
          onClick={() => setIsCollapsed(false)}
          title="Desplegar registro para editar"
        >
          <ChevronLeft size={16} />
          <span>
            {isVerifying ? 'Editar Ficha y Capa' : `Registro en curso (${tipo === 'instrumento' ? 'Instrumento' : 'Cartografía'} - Paso ${step}/${maxSteps})`}
          </span>
        </button>
      )}

      {/* Overlay: hacer clic fuera repliega el modal sin perder avance */}
      {isOpen && (
        <div 
          className={`modal-drawer-overlay ${isCollapsed ? 'hidden' : ''}`} 
          onClick={() => setIsCollapsed(true)}
          title="Haga clic fuera para replegar"
        ></div>
      )}

      <div className={`modal-drawer ${isCollapsed ? 'collapsed' : ''}`}>
        
        <div className="modal-drawer-header">
          <div>
            <h3 style={{ margin: 0, color: 'var(--c-guinda)', fontFamily: 'var(--font-heading)' }}>
              {tipo === 'instrumento' ? 'Registrar Instrumento Normativo' : 'Registrar Capa Cartográfica'}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Paso {step} de {maxSteps} — Modo: {accion === 'nuevo' ? 'Nuevo' : 'Actualización'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className="btn-minimize-drawer" 
              onClick={() => setIsCollapsed(true)} 
              title="Replegar panel"
            >
              <ChevronRight size={20} />
            </button>
            <button 
              className="btn-close-drawer" 
              onClick={handleRequestClose} 
              title="Cerrar y descartar cuestionario"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-drawer-content">
          
          {/* PASO 1: CARGA DE ARCHIVOS Y CONFIGURACIÓN DE ACCIÓN */}
          {step === 1 && (
            <div className="wizard-step">
              
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-guinda-dk)' }}>
                <UploadCloud size={18} /> 1. Carga de Archivos
              </h4>

              {/* Selector de Acción: Nuevo vs Actualizar */}
              <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--c-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--c-guinda-dk)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Tipo de Operación
                </label>
                <div style={{ display: 'flex', gap: '12px', marginBottom: accion === 'actualizar' ? '12px' : '0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: accion === 'nuevo' ? '600' : '400', color: 'var(--text-primary)' }}>
                    <input 
                      type="radio" 
                      name="tipoAccion" 
                      value="nuevo" 
                      checked={accion === 'nuevo'} 
                      onChange={() => setAccion('nuevo')} 
                    />
                    <PlusCircle size={15} color="var(--c-guinda)" /> Nuevo elemento
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: accion === 'actualizar' ? '600' : '400', color: 'var(--text-primary)' }}>
                    <input 
                      type="radio" 
                      name="tipoAccion" 
                      value="actualizar" 
                      checked={accion === 'actualizar'} 
                      onChange={() => setAccion('actualizar')} 
                    />
                    <RefreshCw size={15} color="#2563EB" /> Actualizar existente
                  </label>
                </div>

                {accion === 'actualizar' && (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Seleccione el elemento a reemplazar/actualizar:
                    </label>
                    <select 
                      className="form-input" 
                      value={elementoAActualizar} 
                      onChange={(e) => setElementoAActualizar(e.target.value)}
                      style={{ fontSize: '12px' }}
                    >
                      <option value="">Seleccione elemento...</option>
                      {elementosExistentes.map((elem, i) => (
                        <option key={i} value={elem}>{elem}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {fileError && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#991B1B', lineHeight: '1.4' }}>
                    <strong><AlertTriangle size={14} style={{ display: 'inline', marginBottom: '-2px', marginRight: '4px' }}/> Error:</strong> {fileError}
                  </span>
                  <button onClick={() => setFileError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#991B1B' }}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Si es Cartografía, pedimos Capa Espacial y Estilo */}
              {tipo === 'cartografia' && (
                <>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      A. Capa Espacial <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div 
                      className="drag-drop-zone" 
                      onDrop={handleDropArchivo} 
                      onDragOver={(e) => handleDragOver(e, 'a')} 
                      onDragLeave={(e) => handleDragLeave(e, 'a')}
                      style={{ 
                        padding: '20px', 
                        borderColor: archivo ? 'var(--c-guinda)' : dragActive.a ? 'var(--c-guinda)' : 'var(--border-color)', 
                        background: archivo || dragActive.a ? 'rgba(159, 34, 65, 0.05)' : 'var(--c-bg)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {archivo ? (
                        <>
                          <File size={24} color="var(--c-guinda)" />
                          <p style={{ margin: '8px 0 8px', fontWeight: '600', color: 'var(--c-guinda)', fontSize: '13px' }}>{archivo.name}</p>
                          <button className="btn-base btn-tertiary" onClick={() => setArchivo(null)} style={{ width: 'auto', height: '32px', fontSize: '12px', padding: '0 12px' }}>Quitar</button>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={24} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                          <p style={{ fontSize: '12px', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 4px', fontWeight: '500' }}>Arrastra tus archivos aquí o</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 12px' }}>Formatos: <strong>GeoJSON, KML, GeoPackage o .zip</strong></p>
                          
                          <label className="btn-base btn-secondary" style={{ cursor: 'pointer', width: 'auto', height: '36px', fontSize: '12px' }}>
                            Explorar
                            <input 
                              type="file" 
                              accept=".geojson,.kml,.gpkg,.zip" 
                              style={{ display: 'none' }} 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && isValidExtension(file.name, ['.geojson', '.kml', '.gpkg', '.zip'])) {
                                  setArchivo(file);
                                  setFileError(null);
                                } else if (file) {
                                  setFileError("Intente de nuevo. La capa espacial debe tener extensión .geojson, .kml, .gpkg o .zip");
                                }
                              }} 
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', padding: '12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={epsgConfirmed} onChange={(e) => setEpsgConfirmed(e.target.checked)} style={{ marginTop: '3px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '12px', color: '#991B1B', lineHeight: '1.4' }}>
                        <strong><AlertTriangle size={12} style={{ display: 'inline', marginBottom: '-2px' }}/> Advertencia:</strong> Solo se aceptan archivos con proyección <strong>EPSG:4326</strong>.
                      </span>
                    </label>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      B. Archivo de Estilo <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '400' }}>(Opcional)</span>
                    </label>
                    <div 
                      className="drag-drop-zone" 
                      onDrop={handleDropEstilo} 
                      onDragOver={(e) => handleDragOver(e, 'b')} 
                      onDragLeave={(e) => handleDragLeave(e, 'b')}
                      style={{ 
                        padding: '20px', 
                        borderColor: estilo ? 'var(--c-guinda)' : dragActive.b ? 'var(--c-guinda)' : 'var(--border-color)', 
                        background: estilo || dragActive.b ? 'rgba(159, 34, 65, 0.05)' : 'var(--c-bg)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {estilo ? (
                        <>
                          <Palette size={24} color="var(--c-guinda)" />
                          <p style={{ margin: '8px 0 8px', fontWeight: '600', color: 'var(--c-guinda)', fontSize: '13px' }}>{estilo.name}</p>
                          <button className="btn-base btn-tertiary" onClick={() => setEstilo(null)} style={{ width: 'auto', height: '32px', fontSize: '12px', padding: '0 12px' }}>Quitar</button>
                        </>
                      ) : (
                        <>
                          <Palette size={24} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                          <p style={{ fontSize: '12px', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 4px', fontWeight: '500' }}>Arrastra tu archivo aquí o</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 12px' }}>Formatos: <strong>.SLD o .QML</strong></p>
                          
                          <label className="btn-base btn-secondary" style={{ cursor: 'pointer', width: 'auto', height: '36px', fontSize: '12px' }}>
                            Explorar 
                            <input 
                              type="file" 
                              accept=".sld,.qml" 
                              style={{ display: 'none' }} 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && isValidExtension(file.name, ['.sld', '.qml'])) {
                                  setEstilo(file);
                                  setFileError(null);
                                } else if (file) {
                                  setFileError("Intente de nuevo. El archivo de estilo debe tener extensión .sld o .qml");
                                }
                              }} 
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Expediente Técnico (Siempre requerido tanto para Cartografía como para Instrumentos) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {tipo === 'instrumento' ? 'Documento Normativo en PDF' : 'C. Expediente Técnico / Legal'} <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div 
                  className="drag-drop-zone" 
                  onDrop={handleDropDocumento} 
                  onDragOver={(e) => handleDragOver(e, 'c')} 
                  onDragLeave={(e) => handleDragLeave(e, 'c')}
                  style={{ 
                    padding: '20px', 
                    borderColor: documento ? 'var(--c-guinda)' : dragActive.c ? 'var(--c-guinda)' : 'var(--border-color)', 
                    background: documento || dragActive.c ? 'rgba(159, 34, 65, 0.05)' : 'var(--c-bg)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {documento ? (
                    <>
                      <FileText size={24} color="var(--c-guinda)" />
                      <p style={{ margin: '8px 0 8px', fontWeight: '600', color: 'var(--c-guinda)', fontSize: '13px' }}>{documento.name}</p>
                      <button className="btn-base btn-tertiary" onClick={() => setDocumento(null)} style={{ width: 'auto', height: '32px', fontSize: '12px', padding: '0 12px' }}>Quitar</button>
                    </>
                  ) : (
                    <>
                      <FileText size={24} color="var(--text-secondary)" style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 4px', fontWeight: '500' }}>Arrastra tu archivo aquí o</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 12px' }}>Formatos: <strong>.PDF</strong></p>
                      
                      <label className="btn-base btn-secondary" style={{ cursor: 'pointer', width: 'auto', height: '36px', fontSize: '12px' }}>
                        Explorar 
                        <input 
                          type="file" 
                          accept=".pdf" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && isValidExtension(file.name, ['.pdf'])) {
                              setDocumento(file);
                              setFileError(null);
                            } else if (file) {
                              setFileError("Intente de nuevo. El documento técnico debe ser formato .pdf");
                            }
                          }} 
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: FICHA TÉCNICA INSTITUCIONAL */}
          {step === 2 && (
            <div className="wizard-step">
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-guinda-dk)' }}>
                <FileText size={18} /> 2. Ficha Técnica Institucional
              </h4>
              
              <div className="form-group">
                <label>{tipo === 'instrumento' ? 'Título del Instrumento' : 'Nombre de la Capa'}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={tipo === 'instrumento' ? 'Ej. Programa Municipal de Movilidad Urbana Sustentable' : 'Ej. Red Vial Primaria Estatal'} 
                  defaultValue={accion === 'actualizar' ? elementoAActualizar : ''}
                />
              </div>

              {/* Fila 1: Fuente y Responsable */}
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Fuente</label>
                  <select 
                    className="form-input" 
                    value={fuente} 
                    onChange={(e) => setFuente(e.target.value)}
                  >
                    <option value="">Seleccione fuente...</option>
                    <option value="INEGI">INEGI</option>
                    <option value="CONAPO">CONAPO</option>
                    <option value="CENAPRED">CENAPRED</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div>
                  <label>Responsable</label>
                  <select 
                    className="form-input" 
                    value={responsable} 
                    onChange={(e) => setResponsable(e.target.value)}
                  >
                    <option value="Gobierno de Campeche">Gobierno de Campeche</option>
                  </select>
                </div>
              </div>

              {/* Campo condicional para Fuente "Otra" */}
              {fuente === 'Otra' && (
                <div className="form-group">
                  <label>Especifique la Fuente <span style={{ color: '#EF4444' }}>*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Escriba el nombre de la institución o fuente..." 
                    value={fuenteOtra}
                    onChange={(e) => setFuenteOtra(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Fila 2: Escala Territorial y Periodicidad */}
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Escala Territorial</label>
                  <select 
                    className="form-input"
                    value={escala}
                    onChange={(e) => setEscala(e.target.value)}
                  >
                    <option value="">Seleccione escala...</option>
                    {catalogos.cat_cobertura.map(item => (<option key={item.id} value={item.id}>{item.etiqueta}</option>))}
                  </select>
                </div>
                <div>
                  <label>Periodicidad</label>
                  <select 
                    className="form-input"
                    value={periodicidad}
                    onChange={(e) => setPeriodicidad(e.target.value)}
                  >
                    <option value="">Seleccione periodicidad...</option>
                    {catalogos.cat_periodicidad.map(item => (<option key={item.id} value={item.id}>{item.etiqueta}</option>))}
                  </select>
                </div>
              </div>

              {/* Fila 3: Monitor e Instrumento de Origen */}
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Monitor</label>
                  <select 
                    className="form-input"
                    value={monitor}
                    onChange={(e) => setMonitor(e.target.value)}
                  >
                    <option value="">Seleccione monitor...</option>
                    <option value="mapa_base">Mapa base</option>
                    <option value="ordenamiento_territorial">Modelo de Ordenamiento Territorial</option>
                    <option value="ambiental">Ambiental</option>
                    <option value="social">Social</option>
                    <option value="infraestructura">Infraestructura</option>
                    <option value="economico">Economico</option>
                  </select>
                </div>
                <div>
                  <label>Instrumento de Origen</label>
                  <select 
                    className="form-input"
                    value={instrumentoOrigen}
                    onChange={(e) => setInstrumentoOrigen(e.target.value)}
                  >
                    <option value="">Seleccione el marco normativo...</option>
                    {catalogos.cat_instrumento.map(item => (<option key={item.id} value={item.id}>{item.etiqueta}</option>))}
                  </select>
                </div>
              </div>

              {/* Fila 4: Fecha y Horizonte de Planeación */}
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label>Fecha</label>
                  <select 
                    className="form-input"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  >
                    <option value="">Seleccione año...</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div>
                  <label>Horizonte de Planeación</label>
                  <select 
                    className="form-input"
                    value={horizonte}
                    onChange={(e) => setHorizonte(e.target.value)}
                  >
                    <option value="">Seleccione horizonte...</option>
                    <option value="corto">Corto</option>
                    <option value="mediano">Mediano</option>
                    <option value="largo">Largo</option>
                  </select>
                </div>
              </div>

              {/* Fila 5: Eje de Evaluación */}
              <div className="form-group">
                <label>Eje de Evaluación</label>
                <select 
                  className="form-input"
                  value={ejeEvaluacion}
                  onChange={(e) => setEjeEvaluacion(e.target.value)}
                >
                  <option value="">Seleccione eje...</option>
                  <option value="resultado">Resultado</option>
                  <option value="gestion">Gestión</option>
                </select>
              </div>

            </div>
          )}

          {/* PASO 3: VALIDACIÓN DE DATOS (Cartografía) */}
          {step === 3 && tipo === 'cartografia' && (
            <div className="wizard-step">
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-guinda-dk)' }}>
                <Database size={18} /> 3. Validación de Datos
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Para proteger la integridad de la base de datos geográfica, su archivo debe cumplir con los lineamientos del diccionario de datos.
              </p>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    <tr><th style={{ padding: '10px 12px' }}>Campo</th><th style={{ padding: '10px 12px' }}>Esperado</th><th style={{ padding: '10px 12px' }}>Detectado</th><th style={{ padding: '10px 12px', textAlign: 'center' }}>Estatus</th></tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px dashed #E5E7EB' }}><td style={{ padding: '10px 12px', fontWeight: '600', fontFamily: 'monospace' }}>cve_ent</td><td style={{ padding: '10px 12px', color: '#3B82F6' }}>Texto</td><td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>cve_ent</td><td style={{ padding: '10px 12px', textAlign: 'center', color: '#10B981' }}>✅</td></tr>
                    <tr style={{ background: '#FEF2F2' }}><td style={{ padding: '10px 12px', fontWeight: '600', fontFamily: 'monospace' }}>poblacion</td><td style={{ padding: '10px 12px', color: '#10B981' }}>Numérico</td><td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#DC2626' }}>Texto</td><td style={{ padding: '10px 12px', textAlign: 'center', color: '#DC2626' }}>❌</td></tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '12px', color: '#991B1B', lineHeight: '1.4' }}>
                <strong><AlertTriangle size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Error de atributos:</strong> La estructura no coincide estrictamente. Por favor, <strong>corrija la tabla de atributos</strong> antes del dictamen final.
              </div>
            </div>
          )}

          {/* PASO 3: VALIDACIÓN DE DATOS (Instrumentos) */}
          {step === 3 && tipo === 'instrumento' && (
            <div className="wizard-step">
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-guinda-dk)' }}>
                <FileText size={18} /> 3. Validación de Datos
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Revise la previsualización del documento y los datos capturados en la ficha técnica antes de enviar a revisión.
              </p>

              {/* Previsualización del PDF (Página 1) */}
              <div style={{ marginBottom: '18px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#F9FAFB' }}>
                <div style={{ padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-guinda-dk)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> Vista Previa: Primera Página
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{documento?.name || 'Documento.pdf'}</span>
                </div>
                {pdfPreviewUrl ? (
                  <iframe 
                    src={`${pdfPreviewUrl}#page=1&toolbar=0&navpanes=0`} 
                    style={{ width: '100%', height: '220px', border: 'none' }} 
                    title="Previsualización PDF"
                  />
                ) : (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FileText size={40} color="var(--c-guinda)" style={{ opacity: 0.6, margin: '0 auto 8px', display: 'block' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{documento?.name || 'Instrumento_Normativo.pdf'}</span>
                    <p style={{ fontSize: '11px', margin: '4px 0 0' }}>Primera página lista para dictamen administrativo</p>
                  </div>
                )}
              </div>

              {/* Ficha Técnica en Formato Lista */}
              <div>
                <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-guinda-dk)', margin: '0 0 8px' }}>
                  Ficha Técnica Institucional
                </h5>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', fontSize: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Título / Documento:</strong>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{documento?.name || (accion === 'actualizar' ? elementoAActualizar : 'Nuevo Instrumento')}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Fuente:</strong>
                    <span>{fuente === 'Otra' ? `Otra (${fuenteOtra || 'No especificada'})` : fuente || 'No especificada'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Responsable:</strong>
                    <span>{responsable || 'Gobierno de Campeche'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Escala Territorial:</strong>
                    <span>{catalogos.cat_cobertura.find(c => c.id === escala)?.etiqueta || escala || 'No especificada'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Periodicidad:</strong>
                    <span>{catalogos.cat_periodicidad.find(p => p.id === periodicidad)?.etiqueta || periodicidad || 'No especificada'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Monitor:</strong>
                    <span style={{ textTransform: 'capitalize' }}>{monitor ? monitor.replace('_', ' ') : 'No especificado'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Instrumento de Origen:</strong>
                    <span>{catalogos.cat_instrumento.find(i => i.id === instrumentoOrigen)?.etiqueta || instrumentoOrigen || 'No especificado'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Fecha (Año):</strong>
                    <span>{fecha || 'No especificada'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Horizonte de Planeación:</strong>
                    <span style={{ textTransform: 'capitalize' }}>{horizonte || 'No especificado'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', padding: '8px 12px' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Eje de Evaluación:</strong>
                    <span style={{ textTransform: 'capitalize' }}>
                      {ejeEvaluacion === 'gestion' ? 'Gestión' : (ejeEvaluacion === 'resultado' ? 'Resultado' : ejeEvaluacion || 'No especificado')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-drawer-footer">
          {step > 1 ? (
            <button className="btn-base btn-secondary" onClick={handleBack} style={{ width: 'auto' }}>
              <ArrowLeft size={14} /> Atrás
            </button>
          ) : <div></div>}
          
          {/* Botones de acción final o avance */}
          {step < maxSteps ? (
            <button 
              className="btn-base btn-primary" 
              onClick={handleNext} 
              style={{ width: 'auto' }}
            >
              Siguiente <ArrowRight size={14} />
            </button>
          ) : tipo === 'instrumento' ? (
            <button 
              className="btn-base btn-primary" 
              onClick={handleFinishInstrumento} 
              style={{ width: 'auto', background: 'var(--status-aprobado, #10B981)' }}
            >
              <CheckCircle size={14} /> Enviar a revisión
            </button>
          ) : (
            <button 
              className="btn-base btn-primary" 
              onClick={handleFinishCartografia} 
              style={{ width: 'auto', background: 'var(--status-aprobado, #10B981)' }}
            >
              <CheckCircle size={14} /> Verificar en geovisualizador
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación para descartar datos si hay archivos cargados */}
      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} color="var(--c-guinda)" />
            </div>
            <h4 className="confirm-modal-title">¿Cerrar cuestionario?</h4>
            <p className="confirm-modal-text">
              Se está cerrando el cuestionario y se eliminarán los datos y archivos cargados. ¿Desea continuar?
            </p>
            <div className="confirm-modal-actions">
              <button 
                className="btn-base btn-secondary" 
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-base btn-primary btn-danger" 
                onClick={handleConfirmClose}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CapturistaModal;