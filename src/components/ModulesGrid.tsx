import { useNavigate } from 'react-router-dom'

const MODULES = [
  {
    id: 'mod-1',
    icon: (
      <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M216-176q-45-45-70.5-104T120-402q0-63 24-124.5T222-642q35-35 86.5-60t122-39.5Q501-756 591.5-759t202.5 7q8 106 5 195t-16.5 160.5q-13.5 71.5-38 125T684-182q-53 53-112.5 77.5T450-80q-65 0-127-25.5T216-176Zm112-16q29 17 59.5 24.5T450-160q46 0 91-18.5t86-59.5q18-18 36.5-50.5t32-85Q709-426 716-500.5t2-177.5q-49-2-110.5-1.5T485-670q-61 9-116 29t-90 55q-45 45-62 89t-17 85q0 59 22.5 103.5T262-246q42-80 111-153.5T534-520q-72 63-125.5 142.5T328-192Zm0 0Zm0 0Z" />
      </svg>
    ),
    title: 'Ambiental',
    description: 'Indicadores y métricas del entorno natural del estado.',
  },
  {
    id: 'mod-2',
    icon: (
      <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" />
      </svg>
    ),
    title: 'Social',
    description: 'Datos de población y desarrollo social municipal.',
  },
  {
    id: 'mod-3',
    icon: (
      <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M247-167q-47-47-47-113v-327q-35-13-57.5-43.5T120-720q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 69.5T280-607v327q0 33 23.5 56.5T360-200q33 0 56.5-23.5T440-280v-400q0-66 47-113t113-47q66 0 113 47t47 113v327q35 13 57.5 43.5T840-240q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-327q0-33-23.5-56.5T600-760q-33 0-56.5 23.5T520-680v400q0 66-47 113t-113 47q-66 0-113-47Zm-7-513q17 0 28.5-11.5T280-720q0-17-11.5-28.5T240-760q-17 0-28.5 11.5T200-720q0 17 11.5 28.5T240-680Zm480 480q17 0 28.5-11.5T760-240q0-17-11.5-28.5T720-280q-17 0-28.5 11.5T680-240q0 17 11.5 28.5T720-200ZM240-720Zm480 480Z" />
      </svg>
    ),
    title: 'Infraestructura',
    description: 'Red vial, servicios y equipamiento urbano-regional.',
  },
  {
    id: 'mod-4',
    icon: (
      <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
      </svg>
    ),
    title: 'Económico',
    description: 'Zonas de potencial productivo y vocación del suelo.',
  },
  {
    id: 'mod-5',
    icon: (
      <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
        <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560h600v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-600H320v480h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h360v80H360Zm0 120v-80h360v80H360ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm0 0h-40 400-360Z" />
      </svg>
    ),
    title: 'Modelo de Ordenamiento Territorial',
    description: 'Marco legal y programas de regulación territorial.',
  },
]

import { appConfig } from '../config/appConfig'

export default function ModulesGrid() {
  const navigate = useNavigate()

  return (
    <section className="modules" aria-labelledby="modules-heading">
      <div className="modules__inner">
        <h2 className="modules__title" id="modules-heading">Monitores</h2>
        <div className="modules__grid" role="list">
          {MODULES.map((mod) => {
            // Buscar la configuración de este módulo en appConfig.ts usando el targetId
            let targetId = ''
            if (mod.id === 'mod-1') targetId = 'ambiental'
            else if (mod.id === 'mod-2') targetId = 'social'
            else if (mod.id === 'mod-3') targetId = 'infraestructura'
            else if (mod.id === 'mod-4') targetId = 'aptitud'
            else if (mod.id === 'mod-5') targetId = 'normatividad'

            const configColor = appConfig.MODULES_CONFIG.find(c => c.id === targetId) as any
            const themeColor = configColor?.themeColor || 'var(--c-verde-dk)'
            const themeBg = configColor?.themeBg || '#f1efd5'

            return (
              <article
                key={mod.id}
                className="module-card"
                role="listitem"
                tabIndex={0}
                aria-label={mod.title}
                style={{
                  '--theme-color': themeColor,
                  '--theme-bg': themeBg
                } as React.CSSProperties}
                onClick={() => {
                  if (targetId) navigate(`/geovisor?modulo=${targetId}`)
                }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click() }}
            >
              <div className="module-card__icon" aria-hidden="true">{mod.icon}</div>
              <h3 className="module-card__title">{mod.title}</h3>
              <span className="module-card__link" aria-label={`Explorar ${mod.title}`}>
                Explorar &gt;&gt;
              </span>
            </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
