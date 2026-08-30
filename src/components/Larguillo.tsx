import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Option {
  id: string;
  label: string;
  text: string;
}

interface MonitorItem {
  id: number;
  title: string;
  themeColor: string;
  targetModulo: string;
  icon: React.ReactNode;
  options: Option[];
}

const items: MonitorItem[] = [
  { 
    id: 5, 
    title: "MOT", 
    themeColor: "#1C334E",
    targetModulo: "normatividad",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z" />
      </svg>
    ),
    options: [
      { id: '5-1', label: 'Proyecto 1', text: 'Modelo de Ordenamiento Territorial: zonificación primaria, secundaria y criterios de uso del suelo.' },
      { id: '5-2', label: 'Proyecto 2', text: 'Regulación de asentamientos humanos y delimitación de límites urbanos consolidados.' },
      { id: '5-3', label: 'Proyecto 3', text: 'Matriz de compatibilidad y condicionantes de aprovechamiento del suelo estatal.' },
      { id: '5-4', label: 'Proyecto 4', text: 'Instrumentos normativos y lineamientos de ordenamiento territorial metropolitano.' },
    ]
  },
  { 
    id: 1, 
    title: "Ambiental", 
    themeColor: "#77923B",
    targetModulo: "ambiental",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M216-176q-45-45-70.5-104T120-402q0-63 24-124.5T222-642q35-35 86.5-60t122-39.5Q501-756 591.5-759t202.5 7q8 106 5 195t-16.5 160.5q-13.5 71.5-38 125T684-182q-53 53-112.5 77.5T450-80q-65 0-127-25.5T216-176Zm112-16q29 17 59.5 24.5T450-160q46 0 91-18.5t86-59.5q18-18 36.5-50.5t32-85Q709-426 716-500.5t2-177.5q-49-2-110.5-1.5T485-670q-61 9-116 29t-90 55q-45 45-62 89t-17 85q0 59 22.5 103.5T262-246q42-80 111-153.5T534-520q-72 63-125.5 142.5T328-192Zm0 0Zm0 0Z" />
      </svg>
    ),
    options: [
      { id: '1-1', label: 'Proyecto 1', text: 'El componente Ambiental analiza las áreas naturales protegidas, cuencas hidrológicas y la preservación ecológica del territorio estatal.' },
      { id: '1-2', label: 'Proyecto 2', text: 'Monitoreo de cobertura vegetal, deforestación y zonas de amortiguamiento ambiental en el estado.' },
      { id: '1-3', label: 'Proyecto 3', text: 'Estrategias de mitigación ante el cambio climático y gestión sustentable de recursos costeros.' },
      { id: '1-4', label: 'Proyecto 4', text: 'Diagnóstico de calidad del agua y reservas hídricas en la península.' },
    ]
  },
  { 
    id: 2, 
    title: "Social", 
    themeColor: "#006FC0",
    targetModulo: "social",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" />
      </svg>
    ),
    options: [
      { id: '2-1', label: 'Proyecto 1', text: 'Indicadores de bienestar, cohesión comunitaria y rezago social en los municipios de Campeche.' },
      { id: '2-2', label: 'Proyecto 2', text: 'Acceso a servicios básicos, equipamiento educativo y centros de salud comunitaria.' },
      { id: '2-3', label: 'Proyecto 3', text: 'Dinámica demográfica, crecimiento poblacional y patrones de migración interna.' },
      { id: '2-4', label: 'Proyecto 4', text: 'El PEOTDU es el instrumento rector del ordenamiento territorial y del desarrollo urbano del estado al constituirse como un instrumento de gobernanza con directrices vinculantes para el conjunto de autoridades encargadas de la planeación del territorio.' },
    ]
  },
  { 
    id: 3, 
    title: "Infraestructura", 
    themeColor: "#C00000",
    targetModulo: "infraestructura",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M247-167q-47-47-47-113v-327q-35-13-57.5-43.5T120-720q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 69.5T280-607v327q0 33 23.5 56.5T360-200q33 0 56.5-23.5T440-280v-400q0-66 47-113t113-47q66 0 113 47t47 113v327q35 13 57.5 43.5T840-240q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-327q0-33-23.5-56.5T600-760q-33 0-56.5 23.5T520-680v400q0 66-47 113t-113 47q-66 0-113-47Zm-7-513q17 0 28.5-11.5T280-720q0-17-11.5-28.5T240-760q-17 0-28.5 11.5T200-720q0 17 11.5 28.5T240-680Zm480 480q17 0 28.5-11.5T760-240q0-17-11.5-28.5T720-280q-17 0-28.5 11.5T680-240q0 17 11.5 28.5T720-200ZM240-720Zm480 480Z" />
      </svg>
    ),
    options: [
      { id: '3-1', label: 'Proyecto 1', text: 'Red vial primaria, conectividad carretera interestatal y transporte multimodal de carga y pasaje.' },
      { id: '3-2', label: 'Proyecto 2', text: 'Redes de distribución eléctrica, conectividad digital y telecomunicaciones rurales.' },
      { id: '3-3', label: 'Proyecto 3', text: 'Infraestructura portuaria, aeroportuaria y proyectos estratégicos de movilidad.' },
      { id: '3-4', label: 'Proyecto 4', text: 'Modernización del sistema de drenaje pluvial, saneamiento y plantas de tratamiento.' },
    ]
  },
  { 
    id: 4, 
    title: "Económico", 
    themeColor: "#FFC000",
    targetModulo: "aptitud",
    icon: (
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
      </svg>
    ),
    options: [
      { id: '4-1', label: 'Proyecto 1', text: 'Polos de desarrollo productivo, agricultura tecnificada, pesca sustentable y turismo.' },
      { id: '4-2', label: 'Proyecto 2', text: 'Zonas industriales, parques logísticos y generación de empleo formal por sector.' },
      { id: '4-3', label: 'Proyecto 3', text: 'Encadenamientos productivos y competitividad regional en el sureste.' },
      { id: '4-4', label: 'Proyecto 4', text: 'Incentivos a la inversión económica, atracción de empresas y desarrollo de clústeres locales.' },
    ]
  },
];

export default function Larguillo() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;
  const activeOption = activeItem?.options.find(o => o.id === activeOptionId);
  const activeIdx = activeItem ? items.findIndex(i => i.id === activeId) : -1;

  return (
    <div ref={containerRef} className="w-[98%] max-w-[1920px] mx-auto pb-4 pt-1 font-[family-name:var(--font-body)]">
      <h2 className="modules__title !m-0 !mb-2.5 px-2 md:px-0 text-base md:text-lg">Monitores</h2>
      <div className="w-full grid grid-cols-5 gap-0 items-end relative">
        
        {/* Espacio de texto explicativo flotante */}
        {activeItem && activeOption && (
          <div 
            className="absolute top-0 h-[110px] md:h-[125px] flex p-0 z-10 animate-in fade-in zoom-in-95 duration-500"
            style={{
              ...(activeIdx < 3 
                ? { left: `${(activeIdx + 1) * 20}%`, width: `${(4 - activeIdx) * 20}%` }
                : { right: `${(5 - activeIdx) * 20}%`, width: `${activeIdx * 20}%` }
              )
            }}
          >
            <div 
              className={`w-full h-full flex flex-col justify-center px-3.5 md:px-6 py-2 md:py-3 backdrop-blur-[2px] rounded-none shadow-sm ${
                activeIdx < 3 ? 'text-left' : 'text-right'
              }`}
              style={{ backgroundColor: `${activeItem.themeColor}1A`, border: `1px solid ${activeItem.themeColor}33` }}
            >
              <h4 className="font-bold mb-1 text-xs md:text-sm uppercase tracking-wider" style={{ color: activeItem.themeColor }}>
                {activeOption.label}
              </h4>
              <p className="text-gray-800 text-[12px] md:text-[14px] leading-relaxed drop-shadow-sm line-clamp-4">
                {activeOption.text}
              </p>
            </div>
          </div>
        )}

        {/* La imagen panorámica continua se aplica directamente a cada botón */}
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          const isHovered = hoveredId === item.id;
          const isHighlighted = isActive || isHovered;
          const isFirst = idx === 0;
          const isLast = idx === items.length - 1;
          
          return (
            <div 
              key={item.id} 
              className="flex flex-col justify-end relative z-10 group/col"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Extensión vertical de la fachada */}
              <div
                className={`w-full overflow-hidden transition-all duration-500 ease-out flex flex-col justify-end ${
                  isActive 
                    ? 'max-h-[110px] md:max-h-[125px] opacity-100 mb-0 scale-y-100 origin-bottom' 
                    : 'max-h-0 opacity-0 mb-0 scale-y-0 origin-bottom pointer-events-none'
                }`}
              >
                <div 
                  className="w-full h-[110px] md:h-[125px] overflow-hidden border-t border-x border-gray-200 shadow-md relative flex flex-col"
                  style={{
                    background: `linear-gradient(to top, ${item.themeColor}20, ${item.themeColor}E6)`
                  }}
                >
                  {/* Apartados simulados */}
                  {item.options.map((opt) => {
                    const isOptActive = activeOptionId === opt.id;
                    
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setActiveOptionId(isOptActive ? null : opt.id)}
                        className={`w-full flex-1 flex items-center justify-center border-b border-white/30 last:border-b-0 cursor-pointer transition-all duration-200 relative group/row ${
                          isOptActive ? 'bg-black/20' : 'hover:bg-white/20'
                        }`}
                      >
                        <span className={`${
                          isOptActive 
                            ? 'opacity-100 text-[10px] md:text-xs font-bold scale-105' 
                            : 'opacity-80 group-hover/row:opacity-100 text-[9px] md:text-[11px] group-hover/row:text-[10px] md:group-hover/row:text-xs font-semibold'
                        } font-[family-name:var(--font-body)] text-white tracking-wide transition-all duration-200 transform group-hover/row:scale-105 drop-shadow-sm`}>
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recuadro de la fachada contigua */}
              <button
                onClick={() => {
                  if (isActive) {
                    setActiveId(null);
                    setActiveOptionId(null);
                  } else {
                    setActiveId(item.id);
                    setActiveOptionId(item.options[0]?.id || null);
                  }
                }}
                className={`group relative aspect-[31/16] w-full transition-[filter] duration-300 cursor-pointer bg-transparent hover:brightness-110 focus:outline-none ${
                  isFirst ? 'rounded-bl-lg' : ''
                } ${isLast ? 'rounded-br-lg' : ''}`}
                style={{
                  backgroundImage: "url('/Larguillo.png')",
                  backgroundSize: "500% 100%",
                  backgroundPosition: `${idx * 25}% bottom`,
                  backgroundRepeat: "no-repeat"
                }}
              >
                {/* Espacio transparente para no tapar la imagen */}
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
                    {item.title === "MOT" ? "Modelo de Ordenamiento Territorial" : `Monitor ${item.title}`}
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
    </div>
  );
}
