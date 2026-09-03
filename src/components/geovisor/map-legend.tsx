import { resolveLegend, type LegendEntry } from '../../lib/qgisSymbology'
import { toSwatchSvg } from '../../lib/leafletSymbology'

interface LegendLayer {
  id: string
  label: string
}

interface Props {
  /** Capas dibujadas, en el mismo orden en que el mapa las apila. */
  layers: LegendLayer[]
  /** Volcado de simbología de QGIS, indexado por id de capa. */
  styles: Record<string, any>
}

function Swatch({ entry }: { entry: LegendEntry }) {
  const svg = toSwatchSvg(entry.symbol)
  if (!svg) return <span className="map-legend__swatch" aria-hidden="true" />

  // El SVG sale del volcado de estilos pasando por nuestro propio traductor, el
  // mismo camino que ya usan los `divIcon` del mapa: no hay marcado ajeno.
  return (
    <span
      className="map-legend__swatch"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

/**
 * Leyenda del mapa.
 *
 * Se construye a partir de la misma simbología que pinta las capas, así que no
 * hay una tabla de colores que mantener en paralelo: si una capa cambia de
 * estilo en QGIS, la leyenda cambia con ella.
 */
export default function MapLegend({ layers, styles }: Props) {
  const sections = layers
    .map((layer) => ({ ...layer, entries: resolveLegend(styles[layer.id]) }))
    .filter((section) => section.entries.length > 0)

  if (sections.length === 0) return null

  return (
    <div className="map-legend max-h-[300px] overflow-y-auto custom-scrollbar">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1.5">
        Simbología
      </h4>
      <div className="flex flex-col gap-3">
        {sections.map((section) => {
          // Símbolo único: no hay clases que enumerar, así que la capa ocupa una
          // sola fila y su nombre hace de etiqueta.
          if (section.entries.length === 1 && section.entries[0].label === null) {
            return (
              <div key={section.id} className="map-legend__item">
                <Swatch entry={section.entries[0]} />
                <span className="text-[11px] text-gray-600 leading-tight">{section.label}</span>
              </div>
            )
          }

          return (
            <div key={section.id} className="flex flex-col gap-1.5">
              <h5 className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">
                {section.label}
              </h5>
              <div className="flex flex-col gap-1.5">
                {section.entries.map((entry, idx) => (
                  <div key={idx} className="map-legend__item">
                    <Swatch entry={entry} />
                    <span className="text-[11px] text-gray-600 leading-tight">{entry.label}</span>
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
