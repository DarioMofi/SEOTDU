import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MapPin } from 'lucide-react';
import { getProyectosSeguimiento, type ProyectoSeguimiento } from '../../lib/datosPrograma';
import { nombreCapaLegible } from '../../lib/textoLegible';
import DiagramaParadigma from '../common/diagrama-paradigma';
import LarguilloSubsistemas from './larguillo-subsistemas';
import { assetUrl } from '../../lib/assetUrl';
import { SUBSISTEMAS, ORDEN_MONITORES, type SubsistemaId } from '../../data/paradigmaPeotdu';

interface Option {
  id: string;
  label: string;
  /** Nombre corto del proyecto */
  titulo: string;
  text: string;
  /** Procedencia del proyecto dentro del PEOTDU */
  origen: string;
  /** Página del PDF oficial donde inicia ese apartado */
  pagina: number;
  /** Registro de Proyecto-seguimiento cuando la opción es un proyecto real */
  proyecto?: ProyectoSeguimiento;
}

// Los proyectos reales vienen de Proyecto-seguimiento (Matriz de Programación
// de Inversiones, cap. VIII del PEOTDU). Mientras cargan, o para el MOT, que no
// tiene proyectos en esa tabla, se muestran las opciones descriptivas de abajo.
function opcionDeProyecto(p: ProyectoSeguimiento, i: number): Option {
  return {
    id: p.id,
    label: `Proyecto ${i + 1}`,
    titulo: p.nombre,
    text: [p.linea, p.ubicacion && `Ubicación: ${p.ubicacion}`].filter(Boolean).join(' · '),
    origen: 'PEOTDU, cap. VIII · Matriz de programación de inversiones',
    pagina: 608,
    proyecto: p,
  };
}

interface MonitorItem {
  id: number;
  title: string;
  themeColor: string;
  targetModulo: string;
  descripcion: string;
  icon: React.ReactNode;
  options: Option[];
}

const items: MonitorItem[] = [
  { 
    id: 5, 
    title: "MOT", 
    themeColor: "#1C334E",
    targetModulo: "normatividad",
    descripcion: "Integra la propuesta de organización del uso del territorio: políticas, zonificación y criterios de regulación.",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z" />
      </svg>
    ),
    options: [
      { id: '5-1', label: 'Proyecto 1', titulo: 'Zonificación primaria y secundaria', text: 'Modelo de Ordenamiento Territorial: zonificación primaria, secundaria y criterios de uso del suelo.',
        origen: 'PEOTDU, cap. VII · Modelo de Ordenamiento Territorial y Urbano', pagina: 499 },
      { id: '5-2', label: 'Proyecto 2', titulo: 'Asentamientos y límites urbanos', text: 'Regulación de asentamientos humanos y delimitación de límites urbanos consolidados.',
        origen: 'PEOTDU, cap. VII · Modelo de Ordenamiento Territorial y Urbano', pagina: 499 },
      { id: '5-3', label: 'Proyecto 3', titulo: 'Compatibilidad de usos del suelo', text: 'Matriz de compatibilidad y condicionantes de aprovechamiento del suelo estatal.',
        origen: 'PEOTDU, cap. VII · Modelo de Ordenamiento Territorial y Urbano', pagina: 499 },
      { id: '5-4', label: 'Proyecto 4', titulo: 'Lineamientos metropolitanos', text: 'Instrumentos normativos y lineamientos de ordenamiento territorial metropolitano.',
        origen: 'PEOTDU, cap. VII · Modelo de Ordenamiento Territorial y Urbano', pagina: 499 },
    ]
  },
  { 
    id: 1, 
    title: "Ambiental", 
    themeColor: "#77923B",
    targetModulo: "ambiental",
    descripcion: "Agrupa el diagnóstico físico-natural: ecosistemas, agua, áreas protegidas y riesgos climáticos.",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M216-176q-45-45-70.5-104T120-402q0-63 24-124.5T222-642q35-35 86.5-60t122-39.5Q501-756 591.5-759t202.5 7q8 106 5 195t-16.5 160.5q-13.5 71.5-38 125T684-182q-53 53-112.5 77.5T450-80q-65 0-127-25.5T216-176Zm112-16q29 17 59.5 24.5T450-160q46 0 91-18.5t86-59.5q18-18 36.5-50.5t32-85Q709-426 716-500.5t2-177.5q-49-2-110.5-1.5T485-670q-61 9-116 29t-90 55q-45 45-62 89t-17 85q0 59 22.5 103.5T262-246q42-80 111-153.5T534-520q-72 63-125.5 142.5T328-192Zm0 0Zm0 0Z" />
      </svg>
    ),
    options: [
      { id: '1-1', label: 'Proyecto 1', titulo: 'Áreas naturales protegidas y cuencas', text: 'El componente Ambiental analiza las áreas naturales protegidas, cuencas hidrológicas y la preservación ecológica del territorio estatal.',
        origen: 'PEOTDU, cap. V · 5.1 Subsistema físico natural', pagina: 105 },
      { id: '1-2', label: 'Proyecto 2', titulo: 'Cobertura vegetal y deforestación', text: 'Monitoreo de cobertura vegetal, deforestación y zonas de amortiguamiento ambiental en el estado.',
        origen: 'PEOTDU, cap. V · 5.1 Subsistema físico natural', pagina: 105 },
      { id: '1-3', label: 'Proyecto 3', titulo: 'Cambio climático y costas', text: 'Estrategias de mitigación ante el cambio climático y gestión sustentable de recursos costeros.',
        origen: 'PEOTDU, cap. V · 5.1 Subsistema físico natural', pagina: 105 },
      { id: '1-4', label: 'Proyecto 4', titulo: 'Calidad y reservas de agua', text: 'Diagnóstico de calidad del agua y reservas hídricas en la península.',
        origen: 'PEOTDU, cap. V · 5.1 Subsistema físico natural', pagina: 105 },
    ]
  },
  { 
    id: 2, 
    title: "Social", 
    themeColor: "#006FC0",
    targetModulo: "social",
    descripcion: "Agrupa el diagnóstico sociodemográfico y patrimonial: población, bienestar, servicios y patrimonio.",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" />
      </svg>
    ),
    options: [
      { id: '2-1', label: 'Proyecto 1', titulo: 'Bienestar y rezago social', text: 'Indicadores de bienestar, cohesión comunitaria y rezago social en los municipios de Campeche.',
        origen: 'PEOTDU, cap. V · 5.2 Subsistema sociodemográfico', pagina: 179 },
      { id: '2-2', label: 'Proyecto 2', titulo: 'Servicios y equipamiento', text: 'Acceso a servicios básicos, equipamiento educativo y centros de salud comunitaria.',
        origen: 'PEOTDU, cap. V · 5.2 Subsistema sociodemográfico', pagina: 179 },
      { id: '2-3', label: 'Proyecto 3', titulo: 'Dinámica demográfica', text: 'Dinámica demográfica, crecimiento poblacional y patrones de migración interna.',
        origen: 'PEOTDU, cap. V · 5.2 Subsistema sociodemográfico', pagina: 179 },
      { id: '2-4', label: 'Proyecto 4', titulo: 'Patrimonio cultural y biocultural', text: 'Patrimonio cultural y biocultural: zonas arqueológicas, centros históricos, pueblos y comunidades indígenas.',
        origen: 'PEOTDU, cap. V · 5.4 Subsistema patrimonio cultural y biocultural', pagina: 278 },
    ]
  },
  { 
    id: 3, 
    title: "Infraestructura", 
    themeColor: "#C00000",
    targetModulo: "infraestructura",
    descripcion: "Agrupa el diagnóstico urbano-rural y de movilidad: conectividad, energía, servicios y proyectos estratégicos.",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M247-167q-47-47-47-113v-327q-35-13-57.5-43.5T120-720q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 69.5T280-607v327q0 33 23.5 56.5T360-200q33 0 56.5-23.5T440-280v-400q0-66 47-113t113-47q66 0 113 47t47 113v327q35 13 57.5 43.5T840-240q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-327q0-33-23.5-56.5T600-760q-33 0-56.5 23.5T520-680v400q0 66-47 113t-113 47q-66 0-113-47Zm-7-513q17 0 28.5-11.5T280-720q0-17-11.5-28.5T240-760q-17 0-28.5 11.5T200-720q0 17 11.5 28.5T240-680Zm480 480q17 0 28.5-11.5T760-240q0-17-11.5-28.5T720-280q-17 0-28.5 11.5T680-240q0 17 11.5 28.5T720-200ZM240-720Zm480 480Z" />
      </svg>
    ),
    options: [
      { id: '3-1', label: 'Proyecto 1', titulo: 'Red vial y transporte', text: 'Red vial primaria, conectividad carretera interestatal y transporte multimodal de carga y pasaje.',
        origen: 'PEOTDU, cap. V · 5.5 Subsistema urbano-rural y 5.6 Movilidad', pagina: 293 },
      { id: '3-2', label: 'Proyecto 2', titulo: 'Energía y telecomunicaciones', text: 'Redes de distribución eléctrica, conectividad digital y telecomunicaciones rurales.',
        origen: 'PEOTDU, cap. V · 5.5 Subsistema urbano-rural y 5.6 Movilidad', pagina: 293 },
      { id: '3-3', label: 'Proyecto 3', titulo: 'Puertos, aeropuertos y movilidad', text: 'Infraestructura portuaria, aeroportuaria y proyectos estratégicos de movilidad.',
        origen: 'PEOTDU, cap. V · 5.5 Subsistema urbano-rural y 5.6 Movilidad', pagina: 293 },
      { id: '3-4', label: 'Proyecto 4', titulo: 'Drenaje y saneamiento', text: 'Modernización del sistema de drenaje pluvial, saneamiento y plantas de tratamiento.',
        origen: 'PEOTDU, cap. V · 5.5 Subsistema urbano-rural y 5.6 Movilidad', pagina: 293 },
    ]
  },
  { 
    id: 4, 
    title: "Económico", 
    themeColor: "#FFC000",
    targetModulo: "aptitud",
    descripcion: "Agrupa el diagnóstico económico y la aptitud territorial: vocaciones productivas, empleo e inversión.",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
      </svg>
    ),
    options: [
      { id: '4-1', label: 'Proyecto 1', titulo: 'Polos productivos', text: 'Polos de desarrollo productivo, agricultura tecnificada, pesca sustentable y turismo.',
        origen: 'PEOTDU, cap. V · 5.3 Subsistema económico y 5.8 Aptitud territorial', pagina: 238 },
      { id: '4-2', label: 'Proyecto 2', titulo: 'Zonas industriales y empleo', text: 'Zonas industriales, parques logísticos y generación de empleo formal por sector.',
        origen: 'PEOTDU, cap. V · 5.3 Subsistema económico y 5.8 Aptitud territorial', pagina: 238 },
      { id: '4-3', label: 'Proyecto 3', titulo: 'Encadenamientos productivos', text: 'Encadenamientos productivos y competitividad regional en el sureste.',
        origen: 'PEOTDU, cap. V · 5.3 Subsistema económico y 5.8 Aptitud territorial', pagina: 238 },
      { id: '4-4', label: 'Proyecto 4', titulo: 'Inversión y clústeres', text: 'Incentivos a la inversión económica, atracción de empresas y desarrollo de clústeres locales.',
        origen: 'PEOTDU, cap. V · 5.3 Subsistema económico y 5.8 Aptitud territorial', pagina: 238 },
    ]
  },
];

export default function Larguillo() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [proyectos, setProyectos] = useState<ProyectoSeguimiento[]>([]);

  useEffect(() => {
    let vivo = true;
    getProyectosSeguimiento().then((p) => { if (vivo) setProyectos(p); });
    return () => { vivo = false; };
  }, []);

  // Mismo orden que el larguillo de subsistemas y las cajas del geovisor.
  const monitores: MonitorItem[] = items
    .map((item) => {
      const propios = proyectos.filter((p) => p.monitor === item.title);
      return propios.length > 0 ? { ...item, options: propios.map(opcionDeProyecto) } : item;
    })
    .sort((a, b) => ORDEN_MONITORES.indexOf(a.targetModulo) - ORDEN_MONITORES.indexOf(b.targetModulo));

  // Cerrar/colapsar cuando se hace clic fuera del larguillo
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveId(null);
        setActiveOptionId(null);
      }
    }

    if (activeId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeId]);

  const activeItem = activeId ? monitores.find(i => i.id === activeId) : null;

  // El panel conserva el último monitor abierto mientras se anima su cierre
  const lastItemRef = useRef<MonitorItem | null>(null);
  if (activeItem) lastItemRef.current = activeItem;
  const panelItem = activeItem ?? lastItemRef.current;

  // Subsistema del diagrama -> monitor de la fachada
  const [subsistemaVisto, setSubsistemaVisto] = useState<SubsistemaId | null>(null);
  const abrirSubsistema = (id: SubsistemaId) => {
    const sub = SUBSISTEMAS.find((s) => s.id === id);
    const item = monitores.find((m) => m.targetModulo === sub?.modulo);
    if (!item) return;
    setSubsistemaVisto(id);
    setActiveId(item.id);
    setActiveOptionId(item.options[0]?.id || null);
    setTimeout(() => document.getElementById('monitor-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  const toggleMonitor = (item: MonitorItem) => {
    if (activeId === item.id) {
      setActiveId(null);
      setActiveOptionId(null);
    } else {
      setActiveId(item.id);
      setActiveOptionId(item.options[0]?.id || null);
    }
  };

  return (
    <div ref={containerRef} className="w-[98%] max-w-[1920px] mx-auto pb-4 pt-1 font-[family-name:var(--font-body)]">
      <h2 className="modules__title !m-0 !mb-2.5 px-2 md:px-0 text-base md:text-lg" id="monitores-titulo">Monitores</h2>

      {/* Onboarding: el paradigma del PEOTDU como mapa de lectura de los
          monitores. Clic en un subsistema abre el monitor que lo agrupa. */}
      <section className="monitores-paradigma" aria-label="Paradigma teórico-metodológico del PEOTDU">
        <p className="monitores-paradigma__intro">
          El PEOTDU analiza el territorio como un sistema de siete subsistemas que se relacionan entre sí,
          dentro de su entorno y su cuenca, y con los derechos humanos como eje transversal. Pasa el cursor
          sobre el diagrama para conocer cada parte y haz clic en un subsistema para abrir su monitor.
        </p>
        <DiagramaParadigma
          modo="onboarding"
          seleccionado={subsistemaVisto}
          onSeleccionar={abrirSubsistema}
        />
      </section>

      {/* Introducción: qué son los monitores y cómo se vinculan con el PEOTDU */}
      <section className="monitores-intro" aria-labelledby="monitores-titulo">
        <p className="monitores-intro__lead">
          El sistema integra información e infraestructura geoespacial compuesta por una base de datos
          territoriales centralizada, servicios interoperables de publicación cartográfica, un geovisor web
          interactivo, herramientas de consulta temática, mecanismos de descarga de información en formatos
          abiertos, un{' '}
          <abbr title="Cuadro de mando: interfaz visual que centraliza, analiza y muestra en tiempo real los indicadores clave (KPIs) y métricas fundamentales de un proceso.">
            cuadro de mando (dashboard)
          </abbr>{' '}
          analítico complementario y un sistema integral de transferencia tecnológica orientado a asegurar la
          sostenibilidad operativa de la plataforma.
        </p>
        <div className="monitores-intro__grid">
          <article>
            <h3>¿Qué son?</h3>
            <p>Tableros temáticos que agrupan el contenido del diagnóstico ciudadano y del diagnóstico del sistema territorial del PEOTDU para una lectura más intuitiva y relacional.</p>
          </article>
          <article>
            <h3>Origen</h3>
            <p>Nacen de la estructura del propio programa: cada monitor reúne los subsistemas de los capítulos IV y V que comparten tema.</p>
          </article>
          <article>
            <h3>Justificación</h3>
            <p>El diagnóstico abarca más de 350 páginas y decenas de capas. Agruparlo por tema permite consultarlo sin leer el documento completo y relacionar datos de distintas fuentes.</p>
          </article>
          <article>
            <h3>Función y vínculo con el PEOTDU</h3>
            <p>Cada monitor se interpreta con un diagrama conceptual de identidad que explica su composición y su relación con los objetivos del programa, y abre en el geovisor las capas que le corresponden.</p>
          </article>
        </div>
        <p className="monitores-intro__lista">
          Monitores, en orden: <strong>Ambiental</strong> · <strong>Social</strong> · <strong>Infraestructura Estratégica</strong> ·{' '}
          <strong>Económico</strong> · <strong>Gobernanza</strong> (Modelo de Ordenamiento Territorial).
          Elige uno para desplegar sus proyectos.
        </p>
      </section>

      {/* Insumos: los siete subsistemas agrupados en monitores (Desempeño) */}
      <LarguilloSubsistemas />

      {/* Salidas: los monitores con sus proyectos (Estrategia) */}
      <header className="larguillo-cab larguillo-cab--salidas">
        <span className="larguillo-cab__kicker">Salidas · Estrategia territorial</span>
        <h3>Monitores y proyectos</h3>
        <p>Cada fachada es un monitor. Ábrela para ver sus proyectos o usa su nombre para ir al geovisor.</p>
      </header>

      <div className="w-full grid grid-cols-5 gap-0 items-end relative">
        {monitores.map((item, idx) => {
          // Cada monitor conserva su fachada de Larguillo.png (el recorte va
          // por su posición en `items`, no por el orden en que se muestra).
          const recorte = items.findIndex((x) => x.id === item.id);
          const isActive = activeId === item.id;
          const isHovered = hoveredId === item.id;
          const isHighlighted = isActive || isHovered;
          const isFirst = idx === 0;
          const isLast = idx === monitores.length - 1;

          return (
            <div
              key={item.id}
              className="flex flex-col justify-end relative z-10 group/col"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Extensión vertical de la fachada: atajos a cada proyecto */}
              <div
                className={`w-full overflow-hidden transition-all duration-500 ease-out flex flex-col justify-end ${
                  isActive
                    ? 'max-h-[110px] md:max-h-[125px] opacity-100 mb-0 scale-y-100 origin-bottom'
                    : 'max-h-0 opacity-0 mb-0 scale-y-0 origin-bottom pointer-events-none'
                }`}
              >
                <div
                  className="w-full h-[110px] md:h-[125px] overflow-hidden border-t border-x border-gray-200 shadow-md relative flex flex-col"
                  style={{ background: `linear-gradient(to top, ${item.themeColor}20, ${item.themeColor}E6)` }}
                >
                  {/* Caben cuatro filas; si hay más proyectos, la última remite al panel */}
                  {(item.options.length > 4 ? item.options.slice(0, 3) : item.options).map((opt) => {
                    const isOptActive = activeOptionId === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setActiveOptionId(isOptActive ? null : opt.id)}
                        tabIndex={isActive ? 0 : -1}
                        className={`w-full flex-1 flex items-center justify-center border-b border-white/30 last:border-b-0 cursor-pointer transition-all duration-200 relative group/row ${
                          isOptActive ? 'bg-black/20' : 'hover:bg-white/20'
                        }`}
                      >
                        <span className={`${
                          isOptActive
                            ? 'opacity-100 text-[10px] md:text-xs font-bold scale-105'
                            : 'opacity-80 group-hover/row:opacity-100 text-[9px] md:text-[11px] font-semibold'
                        } font-[family-name:var(--font-body)] text-white tracking-wide transition-all duration-200 drop-shadow-sm truncate px-1`}>
                          {opt.titulo}
                        </span>
                      </button>
                    );
                  })}
                  {item.options.length > 4 && (
                    <button
                      type="button"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => document.getElementById('monitor-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })}
                      className="w-full flex-1 flex items-center justify-center text-white text-[9px] md:text-[11px] font-bold hover:bg-white/20"
                    >
                      + {item.options.length - 3} proyectos más
                    </button>
                  )}
                </div>
              </div>

              {/* Recuadro de la fachada contigua */}
              <button
                onClick={() => toggleMonitor(item)}
                aria-expanded={isActive}
                aria-controls="monitor-panel"
                aria-label={`${isActive ? 'Ocultar' : 'Mostrar'} proyectos del ${item.title === 'MOT' ? 'Monitor de Gobernanza (MOT)' : `Monitor ${item.title}`}`}
                className={`group relative aspect-[31/16] w-full transition-[filter] duration-300 cursor-pointer bg-transparent hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isFirst ? 'rounded-bl-lg' : ''
                } ${isLast ? 'rounded-br-lg' : ''}`}
                style={{
                  backgroundImage: `url('${assetUrl('/Larguillo.png')}')`,
                  backgroundSize: "500% 100%",
                  backgroundPosition: `${recorte * 25}% bottom`,
                  backgroundRepeat: "no-repeat"
                }}
              >
                {/* Pista visible de que la fachada despliega contenido */}
                <span
                  className={`monitor-facade-hint ${isActive ? 'is-active' : ''}`}
                  style={{ background: item.themeColor }}
                  aria-hidden="true"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  {isActive ? 'Ocultar' : 'Ver proyectos'}
                </span>
              </button>

              {/* Etiqueta del monitor con icono y redirección al geovisor al hacer click */}
              <div
                onClick={() => navigate(`/geovisor?modulo=${item.targetModulo}`)}
                className="h-[44px] md:h-[52px] mt-2 md:mt-3 px-1 w-full flex items-start justify-center text-center cursor-pointer group/title transition-transform duration-200 hover:scale-[1.02]"
                title={`Ir a Geovisor (${item.title})`}
              >
                <div
                  className="flex items-center justify-center gap-1.5 md:gap-2 transition-colors duration-200"
                  style={{ color: isHighlighted ? item.themeColor : '#111827' }}
                >
                  <span className="text-[10px] sm:text-[11px] md:text-[13px] font-semibold leading-tight drop-shadow-sm font-[family-name:var(--font-body)]">
                    {item.title === "MOT" ? "Monitor de Gobernanza (MOT)" : `Monitor ${item.title}`}
                  </span>
                  <span className="flex-shrink-0 transition-transform duration-200 group-hover/title:scale-115">
                    {item.icon}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel de proyectos: se despliega con animación bajo la fachada elegida.
          Las filas de la fachada y este acordeón comparten activeOptionId. */}
      <div
        id="monitor-panel"
        className={`monitor-panel ${activeItem ? 'is-open' : ''}`}
        style={{ '--theme': panelItem?.themeColor ?? '#9F2241' } as React.CSSProperties}
        aria-hidden={!activeItem}
      >
        <div className="monitor-panel__clip">
          {panelItem && (
            <div className="monitor-panel__inner">
              <header className="monitor-panel__header">
                <span className="monitor-panel__icon">{panelItem.icon}</span>
                <div>
                  <h3>{panelItem.title === 'MOT' ? 'Monitor de Gobernanza (MOT)' : `Monitor ${panelItem.title}`}</h3>
                  <p>{panelItem.descripcion}</p>
                </div>
                <button
                  type="button"
                  className="monitor-panel__geo"
                  onClick={() => navigate(`/geovisor?modulo=${panelItem.targetModulo}`)}
                  tabIndex={activeItem ? 0 : -1}
                >
                  Abrir en el geovisor &rarr;
                </button>
              </header>
              <ul className="monitor-acordeon">
                {panelItem.options.map((opt, i) => {
                  const open = activeOptionId === opt.id;
                  return (
                    <li key={opt.id} className={`monitor-acordeon__item ${open ? 'is-open' : ''}`}>
                      <button
                        type="button"
                        className="monitor-acordeon__head"
                        aria-expanded={open}
                        aria-controls={`proy-${opt.id}`}
                        tabIndex={activeItem ? 0 : -1}
                        onClick={() => setActiveOptionId(open ? null : opt.id)}
                      >
                        <span className="monitor-acordeon__num">{String(i + 1).padStart(2, '0')}</span>
                        <span className="monitor-acordeon__titulo">{opt.titulo}</span>
                        <ChevronDown className="monitor-acordeon__chev w-4 h-4" aria-hidden="true" />
                      </button>
                      <div id={`proy-${opt.id}`} className="monitor-acordeon__body" role="region">
                        <div className="monitor-acordeon__clip">
                          <p>{opt.text}</p>
                          {opt.proyecto && (
                            <>
                              <dl className="monitor-proyecto">
                                {([
                                  ['Monto de inversión', opt.proyecto.monto],
                                  ['Inversión', [opt.proyecto.publico && 'Pública', opt.proyecto.privado && 'Privada'].filter(Boolean).join(' y ') || null],
                                  ['Plazo', opt.proyecto.plazo],
                                  ['Prioridad', opt.proyecto.prioridad],
                                  ['Responsable', opt.proyecto.responsable],
                                  ['Coordinación', opt.proyecto.coordinacion],
                                  ['Población beneficiada', opt.proyecto.poblacion],
                                  ['Financiamiento', opt.proyecto.financiamiento],
                                ] as const).filter(([, v]) => v).map(([k, v]) => (
                                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                                ))}
                              </dl>
                              {opt.proyecto.capas.length > 0 && opt.proyecto.modulo && (
                                <div className="monitor-proyecto__capas">
                                  {opt.proyecto.capas.map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      tabIndex={open ? 0 : -1}
                                      onClick={() => navigate(`/geovisor?modulo=${opt.proyecto!.modulo}&capa=${encodeURIComponent(c)}`)}
                                    >
                                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                      Ver en el geovisor: {nombreCapaLegible(c)}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                          <p className="monitor-acordeon__origen">
                            <strong>Origen:</strong>{' '}
                            <a href={`/Instrumentos/PEOTDU-CAM-2023.pdf#page=${opt.pagina}`} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
                              {opt.origen}
                            </a>
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
