import { useNavigate } from 'react-router-dom'

const MODULES = [
  {
    id: 'mod-1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
    title: 'Monitoreo Ambiental y Territorial',
    description: 'Indicadores y métricas del entorno natural del estado.',
  },
  {
    id: 'mod-2',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    title: 'Bienestar Social y Demografía',
    description: 'Datos de población y desarrollo social municipal.',
  },
  {
    id: 'mod-3',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
    ),
    title: 'Infraestructura y Conectividad',
    description: 'Red vial, servicios y equipamiento urbano-regional.',
  },
  {
    id: 'mod-4',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
    title: 'Aptitud Territorial y Desarrollo Económico',
    description: 'Zonas de potencial productivo y vocación del suelo.',
  },
  {
    id: 'mod-5',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      </svg>
    ),
    title: 'Normatividad y Modelo de Ordenamiento',
    description: 'Marco legal y programas de regulación territorial.',
  },
]

export default function ModulesGrid() {
  const navigate = useNavigate()

  return (
    <section className="modules" aria-labelledby="modules-heading">
      <div className="modules__inner">
        <h2 className="modules__title" id="modules-heading">Módulos Temáticos</h2>
        <div className="modules__grid" role="list">
          {MODULES.map((mod) => (
            <article
              key={mod.id}
              className="module-card"
              role="listitem"
              tabIndex={0}
              aria-label={mod.title}
              onClick={() => {
                let targetId = ''
                if (mod.id === 'mod-1') targetId = 'ambiental'
                else if (mod.id === 'mod-2') targetId = 'social'
                else if (mod.id === 'mod-3') targetId = 'infraestructura'
                else if (mod.id === 'mod-4') targetId = 'aptitud'
                else if (mod.id === 'mod-5') targetId = 'normatividad'

                if (targetId) {
                  navigate(`/geovisor?modulo=${targetId}`)
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.click() }}
            >
              <div className="module-card__icon" aria-hidden="true">{mod.icon}</div>
              <h3 className="module-card__title">{mod.title}</h3>
              <span className="module-card__link" aria-label={`Explorar ${mod.title}`}>
                Explorar &gt;&gt;
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
