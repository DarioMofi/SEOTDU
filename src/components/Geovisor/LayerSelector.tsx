interface LayerOption {
  id: string
  label: string
  desc: string
  color: string
}

interface Props {
  activeLayer: string
  onChangeLayer: (layer: string) => void
}

const LAYERS: LayerOption[] = [
  {
    id: 'ninguna',
    label: 'Límites Políticos Municipales',
    desc: 'Visualización básica de la división territorial de Campeche sin capas temáticas.',
    color: 'bg-gray-400'
  },
  {
    id: 'uso-suelo',
    label: 'Vocación y Uso de Suelo',
    desc: 'Clasificación del territorio en zonas urbanas, forestales, agrícolas e industriales.',
    color: 'bg-emerald-600'
  },
  {
    id: 'zonificacion',
    label: 'Zonificación Territorial',
    desc: 'Subdivisiones normativas que regulan el desarrollo económico, urbano y pesquero.',
    color: 'bg-indigo-600'
  },
  {
    id: 'anp',
    label: 'Áreas Naturales Protegidas (ANP)',
    desc: 'Ecosistemas críticos terrestres y marinos con restricciones específicas de conservación.',
    color: 'bg-green-800'
  }
]

export default function LayerSelector({ activeLayer, onChangeLayer }: Props) {
  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
        Capas Temáticas
      </h3>
      <div className="flex flex-col gap-2">
        {LAYERS.map((layer) => {
          const isActive = activeLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => onChangeLayer(layer.id)}
              className={`text-left p-3.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-[var(--c-guinda)] bg-[rgba(159,34,65,0.04)] shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }`}
              aria-pressed={isActive}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-3.5 h-3.5 rounded-full mt-1 flex-shrink-0 ${layer.color} ${
                    isActive ? 'ring-2 ring-offset-1 ring-[var(--c-guinda)]' : ''
                  }`}
                  aria-hidden="true"
                />
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      isActive ? 'text-[var(--c-guinda)]' : 'text-gray-800'
                    }`}
                  >
                    {layer.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
