interface LegendItem {
  color: string
  label: string
}

interface Props {
  activeLayers: string[]
}

const LEGEND_SECTIONS: Record<string, { title: string; items: LegendItem[] }> = {
  'zonificacion': {
    title: 'Zonificación Primaria y Uso de Suelo',
    items: [
      { color: '#dc2626', label: 'Urbano Construido' },
      { color: '#d97706', label: 'Uso Agrícola' },
      { color: '#15803d', label: 'Selvas y Cobertura Forestal' },
      { color: '#eab308', label: 'Pastizales' },
      { color: '#0ea5e9', label: 'Manglares y Humedales' },
      { color: '#0284c7', label: 'Cuerpos de Agua' }
    ]
  },
  'anp': {
    title: 'Áreas Naturales Protegidas',
    items: [
      { color: '#14532d', label: 'Reserva de la Biósfera' },
      { color: '#16a34a', label: 'Área de Protección de Flora/Fauna' }
    ]
  },
  'poblacion': {
    title: 'Densidad de Población',
    items: [
      { color: '#991b1b', label: 'Muy Alta (>250k hab.)' },
      { color: '#b91c1c', label: 'Alta (150k - 250k)' },
      { color: '#ea580c', label: 'Media (70k - 150k)' },
      { color: '#f97316', label: 'Media-Baja (40k - 70k)' },
      { color: '#fdba74', label: 'Baja (<40k)' },
      { color: '#ffedd5', label: 'Muy Baja (<35k)' }
    ]
  },
  'manglares': {
    title: 'Ecosistemas Costeros',
    items: [
      { color: '#0ea5e9', label: 'Zonas de Manglar y Humedales' }
    ]
  },
  'linea-trans': {
    title: 'Infraestructura Eléctrica',
    items: [
      { color: '#eab308', label: 'Línea de Transmisión Eléctrica' }
    ]
  },
  'via-ferrea': {
    title: 'Infraestructura Ferroviaria',
    items: [
      { color: '#059669', label: 'Vía Férrea / Tren Maya' }
    ]
  },
  'educacion': {
    title: 'Equipamientos Educativos',
    items: [
      { color: '#8b5cf6', label: 'Educación Superior' },
      { color: '#3b82f6', label: 'Educación Media Superior' },
      { color: '#10b981', label: 'Educación Secundaria' },
      { color: '#f59e0b', label: 'Educación Primaria' },
      { color: '#f43f5e', label: 'Educación Preescolar' }
    ]
  }
}

export default function MapLegend({ activeLayers }: Props) {
  // Filtrar capas activas que posean una leyenda definida
  const sectionsToRender = Object.keys(LEGEND_SECTIONS).filter((id) =>
    activeLayers.includes(id)
  )

  if (sectionsToRender.length === 0) return null

  return (
    <div className="map-legend max-h-[300px] overflow-y-auto">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1.5">
        Simbología
      </h4>
      <div className="flex flex-col gap-4">
        {sectionsToRender.map((id) => {
          const section = LEGEND_SECTIONS[id]
          return (
            <div key={id} className="flex flex-col gap-1.5">
              <h5 className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                {section.title}
              </h5>
              <div className="flex flex-col gap-1.5">
                {section.items.map((item, idx) => (
                  <div key={idx} className="map-legend__item">
                    <span
                      className="map-legend__color"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="text-[11px] text-gray-600 leading-tight">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
