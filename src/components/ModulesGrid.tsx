const MODULES = [
  {
    id: 'mod-1',
    icon: '🌿',
    title: 'Monitoreo Ambiental y Territorial',
    description: 'Indicadores y métricas del entorno natural del estado.',
  },
  {
    id: 'mod-2',
    icon: '👥',
    title: 'Bienestar Social y Demografía',
    description: 'Datos de población y desarrollo social municipal.',
  },
  {
    id: 'mod-3',
    icon: '🔗',
    title: 'Infraestructura y Conectividad',
    description: 'Red vial, servicios y equipamiento urbano-regional.',
  },
  {
    id: 'mod-4',
    icon: '📊',
    title: 'Aptitud Territorial y Desarrollo Económico',
    description: 'Zonas de potencial productivo y vocación del suelo.',
  },
  {
    id: 'mod-5',
    icon: '📋',
    title: 'Normatividad y Modelo de Ordenamiento',
    description: 'Marco legal y programas de regulación territorial.',
  },
]

export default function ModulesGrid() {
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
