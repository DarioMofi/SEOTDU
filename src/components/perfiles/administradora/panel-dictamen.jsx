import React, { useState } from 'react';
import { X, CheckCircle, XCircle, FileText, Map, Clock, PlusCircle, RefreshCw, Download, ExternalLink } from 'lucide-react';

const MOCK_FICHAS = {
  'red_ciclovias_v2': {
    tipo: 'cartografia',
    operacion: 'actualizar',
    archivoPdf: 'Expediente_Tecnico_Red_Ciclovias_v2.pdf',
    paginasPdf: 18,
    pesoPdf: '3.6 MB',
    titulo: 'Red de Ciclovías Sector Norte y Corredores Urbanos',
    fuente: 'INEGI',
    responsable: 'Gobierno de Campeche',
    escala: 'Municipal',
    periodicidad: 'Quinquenal',
    monitor: 'Infraestructura',
    instrumentoOrigen: 'PIMUS',
    fecha: '2025',
    horizonte: 'Mediano',
    ejeEvaluacion: 'Resultado',
    fechaEnvioRevision: '14 de Agosto de 2026, 11:30 hrs'
  },
  'censo_paraderos_2026': {
    tipo: 'cartografia',
    operacion: 'nuevo',
    archivoPdf: 'Expediente_Tecnico_Censo_Paraderos_2026.pdf',
    paginasPdf: 12,
    pesoPdf: '2.8 MB',
    titulo: 'Censo y Georreferenciación de Paraderos de Transporte',
    fuente: 'CENAPRED',
    responsable: 'Gobierno de Campeche',
    escala: 'Estatal',
    periodicidad: 'Anual',
    monitor: 'Social',
    instrumentoOrigen: 'ENAMOV',
    fecha: '2026',
    horizonte: 'Corto',
    ejeEvaluacion: 'Gestión',
    fechaEnvioRevision: '15 de Agosto de 2026, 09:15 hrs'
  },
  'pimus_municipio_carmen': {
    tipo: 'cartografia',
    operacion: 'nuevo',
    archivoPdf: 'Expediente_Zonificacion_PIMUS_Carmen.pdf',
    paginasPdf: 24,
    pesoPdf: '5.1 MB',
    titulo: 'Zonificación del Plan Integral de Movilidad de Carmen',
    fuente: 'CONAPO',
    responsable: 'Gobierno de Campeche',
    escala: 'Municipal',
    periodicidad: 'Cada 10 años',
    monitor: 'Ordenamiento Territorial',
    instrumentoOrigen: 'PIMUS',
    fecha: '2025',
    horizonte: 'Largo',
    ejeEvaluacion: 'Gestión',
    fechaEnvioRevision: '12 de Agosto de 2026, 16:45 hrs'
  },
  'PIMUS_Carmen_2025.pdf': {
    tipo: 'instrumento',
    operacion: 'actualizar',
    archivoPdf: 'PIMUS_Carmen_2025.pdf',
    paginasPdf: 42,
    pesoPdf: '8.4 MB',
    titulo: 'Programa Integral de Movilidad Urbana Sustentable (PIMUS) Carmen 2025',
    fuente: 'CONAPO',
    responsable: 'Gobierno de Campeche',
    escala: 'Municipal',
    periodicidad: 'Cada 15 años',
    monitor: 'Ordenamiento Territorial',
    instrumentoOrigen: 'PIMUS',
    fecha: '2025',
    horizonte: 'Largo',
    ejeEvaluacion: 'Gestión',
    fechaEnvioRevision: '10 de Agosto de 2026, 14:20 hrs'
  },
  'Programa_Movilidad_Estatal_2024.pdf': {
    tipo: 'instrumento',
    operacion: 'nuevo',
    archivoPdf: 'Programa_Movilidad_Estatal_2024.pdf',
    paginasPdf: 65,
    pesoPdf: '12.2 MB',
    titulo: 'Programa Estatal de Movilidad y Seguridad Vial 2024-2030',
    fuente: 'Gobierno de Campeche',
    responsable: 'Gobierno de Campeche',
    escala: 'Estatal',
    periodicidad: 'Sexenal',
    monitor: 'Infraestructura',
    instrumentoOrigen: 'LGMSV',
    fecha: '2024',
    horizonte: 'Largo',
    ejeEvaluacion: 'Resultado',
    fechaEnvioRevision: '08 de Agosto de 2026, 10:00 hrs'
  }
};

const PanelDictamen = ({ elemento, capa, tipo = 'cartografia', isOpen, onClose, onDictamen }) => {
  const [activeTab, setActiveTab] = useState('ficha');
  const [comentario, setComentario] = useState('');

  const targetRecurso = elemento || capa;
  if (!isOpen || !targetRecurso) return null;

  const isInstrumento = tipo === 'instrumento' || targetRecurso.endsWith('.pdf');

  const ficha = MOCK_FICHAS[targetRecurso] || {
    tipo: isInstrumento ? 'instrumento' : 'cartografia',
    operacion: 'nuevo',
    archivoPdf: isInstrumento ? targetRecurso : `Expediente_${targetRecurso}.pdf`,
    paginasPdf: 15,
    pesoPdf: '3.2 MB',
    titulo: targetRecurso,
    fuente: 'INEGI',
    responsable: 'Gobierno de Campeche',
    escala: 'Estatal',
    periodicidad: 'Anual',
    monitor: 'Infraestructura',
    instrumentoOrigen: 'PIMUS',
    fecha: '2026',
    horizonte: 'Mediano',
    ejeEvaluacion: 'Resultado',
    fechaEnvioRevision: '15 de Agosto de 2026, 12:00 hrs'
  };

  const isNuevo = ficha.operacion === 'nuevo';

  return (
    <div className={`audit-drawer ${isOpen ? 'open' : ''}`}>
      <div className="audit-drawer-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--c-guinda)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {isInstrumento ? <FileText size={12} /> : <Map size={12} />}
              {isInstrumento ? 'Dictamen de Instrumento' : 'Dictamen de Cartografía'}
            </span>
            <h3 style={{ margin: '3px 0 0', fontSize: '14.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '340px' }} title={targetRecurso}>
              {targetRecurso}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Etiqueta de Operación hasta abajo de audit-drawer-header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            padding: '3px 8px', 
            borderRadius: '12px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            backgroundColor: isNuevo ? '#ECFDF5' : '#EFF6FF',
            color: isNuevo ? '#047857' : '#1D4ED8',
            border: `1px solid ${isNuevo ? '#A7F3D0' : '#BFDBFE'}`
          }}>
            {isNuevo ? <PlusCircle size={12} /> : <RefreshCw size={12} />}
            {isNuevo ? 'Nuevo Registro' : 'Actualización'}
          </span>
        </div>
      </div>

      <div className="audit-tabs">
        <button className={`audit-tab ${activeTab === 'ficha' ? 'active' : ''}`} onClick={() => setActiveTab('ficha')}>
          Ficha Técnica
        </button>
        {!isInstrumento && (
          <button className={`audit-tab ${activeTab === 'sql' ? 'active' : ''}`} onClick={() => setActiveTab('sql')}>
            Atributos SQL
          </button>
        )}
        <button className={`audit-tab ${activeTab === 'pdf' ? 'active' : ''}`} onClick={() => setActiveTab('pdf')}>
          {isInstrumento ? 'Documento PDF' : 'Expediente'}
        </button>
      </div>

      <div className="audit-content">
        {activeTab === 'ficha' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ padding: '10px 12px', background: 'var(--c-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--c-guinda)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                {isInstrumento ? 'Título del Instrumento' : 'Nombre de la Capa'}
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>
                {ficha.titulo}
              </strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Fuente Oficial</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.fuente}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Unidad Responsable</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.responsable}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Escala Territorial</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.escala}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Periodicidad</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.periodicidad}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Monitor</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.monitor}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Instrumento Origen</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.instrumentoOrigen}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Fecha / Año</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.fecha}</strong>
              </div>

              <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Horizonte</span>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.horizonte}</strong>
              </div>
            </div>

            <div style={{ padding: '8px 10px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', display: 'block' }}>Eje de Evaluación</span>
              <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{ficha.ejeEvaluacion}</strong>
            </div>

            <div style={{ marginTop: '2px', textAlign: 'right' }}>
              <em style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={11} />
                Enviado a revisión: {ficha.fechaEnvioRevision}
              </em>
            </div>

          </div>
        )}

        {activeTab === 'sql' && !isInstrumento && (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '12px' }}>Primeros registros tabulares de la capa:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>id_tramo</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>tipo</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>longitud_km</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>TR-001</td>
                  <td style={{ padding: '8px' }}>Ciclovía Segregada</td>
                  <td style={{ padding: '8px' }}>4.82</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>TR-002</td>
                  <td style={{ padding: '8px' }}>Carril Compartido</td>
                  <td style={{ padding: '8px' }}>2.15</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>TR-003</td>
                  <td style={{ padding: '8px' }}>Ciclocarril Preferente</td>
                  <td style={{ padding: '8px' }}>3.40</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pdf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Contenedor de Previsualización */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#F9FAFB' }}>
              <div style={{ padding: '8px 12px', background: 'var(--c-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--c-guinda-dk)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} /> Instrumento normativo Anexo
                </span>
              </div>
              
              {/* Recuadro de vista previa que al dar clic abre el PDF en otra pestaña */}
              <div 
                onClick={() => {
                  const blob = new Blob([
                    `<!DOCTYPE html><html><head><title>${ficha.archivoPdf}</title><style>body{font-family:system-ui,-apple-system,sans-serif;padding:40px;background:#f5f4f2;margin:0;} .doc{background:#fff;max-width:760px;margin:0 auto;padding:48px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border-radius:8px;} h2{color:#9F2241;margin-top:0;} h3{color:#2D2D2D;} hr{border:none;border-top:1px solid #E5E7EB;margin:24px 0;}</style></head><body><div class="doc"><div style="border-bottom:2px solid #9F2241;padding-bottom:8px;margin-bottom:20px;"><strong style="color:#9F2241;font-size:12px;text-transform:uppercase;">Gobierno del Estado de Campeche</strong><div style="color:#53565A;font-size:11px;">Secretaría de Desarrollo Urbano, Movilidad y Obras Públicas</div></div><h2>${ficha.titulo}</h2><p style="color:#53565A;font-size:14px;">Expediente técnico oficial remitido para revisión y dictamen institucional.</p><hr/><table style="width:100%;font-size:13px;border-collapse:collapse;"><tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#53565A;">Archivo:</td><td><strong>${ficha.archivoPdf}</strong></td></tr><tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#53565A;">Fuente Oficial:</td><td><strong>${ficha.fuente}</strong></td></tr><tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#53565A;">Unidad Responsable:</td><td><strong>${ficha.responsable}</strong></td></tr><tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;color:#53565A;">Instrumento Origen:</td><td><strong>${ficha.instrumentoOrigen}</strong></td></tr><tr><td style="padding:8px 0;color:#53565A;">Fecha / Año:</td><td><strong>${ficha.fecha}</strong></td></tr></table></div></body></html>`
                  ], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.open(url, '_blank');
                }}
                style={{ 
                  padding: '16px 14px', 
                  background: 'rgb(255, 255, 255)', 
                  minHeight: '210px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  boxShadow: 'rgba(0, 0, 0, 0.03) 0px 0px 10px inset',
                  cursor: 'pointer'
                }}
                title="Haga clic para abrir el documento en una nueva pestaña"
              >
                <div>
                  {/* Encabezado membretado */}
                  <div style={{ borderBottom: '2px solid var(--c-guinda)', paddingBottom: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--c-guinda-dk)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
                      Gobierno del Estado de Campeche
                    </span>
                    <span style={{ fontSize: '8.5px', color: 'var(--text-secondary)' }}>
                      Secretaría de Desarrollo Urbano, Movilidad y Obras Públicas
                    </span>
                  </div>

                  {/* Título del documento */}
                  <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: '1.35' }}>
                    {ficha.titulo}
                  </h4>

                  {/* Elemento gráfico central estilo capturista */}
                  <div style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FileText size={38} color="var(--c-guinda)" style={{ opacity: 0.65, margin: '0 auto 8px', display: 'block' }} />
                    <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'block' }}>
                      {ficha.archivoPdf || 'Instrumento_Normativo.pdf'}
                    </span>
                    <p style={{ fontSize: '11px', margin: '4px 0 0', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <ExternalLink size={11} /> Clic para abrir
                    </p>
                  </div>
                </div>

                {/* Pie de página de la vista previa */}
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: '500' }}>{ficha.archivoPdf}</span>
                    <span>Página 1 de {ficha.paginasPdf}</span>
                  </div>
                  <button 
                    className="btn-base btn-secondary" 
                    style={{ width: 'auto', height: '26px', padding: '0 16px', fontSize: '11px', gap: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Descargando documento: ${ficha.archivoPdf}`);
                    }}
                  >
                    <Download size={11} /> Descargar
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="audit-footer">
        <textarea 
          placeholder="Retroalimentación (Necesaria en caso de rechazar)..." 
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '12px', resize: 'vertical', minHeight: '80px', height: '80px', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onDictamen('rechazar', comentario)}
            style={{ flex: 1, padding: '9px 12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px' }}
          >
            <XCircle size={15} /> Rechazar
          </button>
          <button 
            onClick={() => onDictamen('aprobar', '')}
            style={{ flex: 1, padding: '9px 12px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12.5px' }}
          >
            <CheckCircle size={15} /> Aprobar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PanelDictamen;