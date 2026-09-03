import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MunicipioProperties } from '../../data/campecheData'
import LimEstBase from '../../data/Lim_Est_Base.json'
import LimMunBase from '../../data/Lim_Mun_Base.json'
import { createSymbolResolver, resolveSymbol, usesPatternFill } from '../../lib/qgisSymbology'
import { toPathOptions, toPointLayer } from '../../lib/leafletSymbology'
import { getCapaGeoJSON } from '../../lib/cartografia'
import { appConfig } from '../../config/appConfig'

// Mapa base claro: Esri Light Gray Canvas. Se usa Esri y no CARTO porque los
// teselados de CARTO ahora exigen API key y devuelven las imágenes marcadas
// con «API KEY REQUIRED» encima del mapa.
//
// Va sin la capa de etiquetas (`World_Light_Gray_Reference`) a propósito: sus
// topónimos son exónimos en inglés («Havana», no «La Habana»), así que se
// prefiere el mapa base limpio y que las etiquetas las pongan las capas.
const ESRI_CLARO =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATRIBUCION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'

interface Props {
  activeLayers: string[]
  selectedFeature: MunicipioProperties | null
  onSelectFeature: (feature: MunicipioProperties | null) => void
  layerOpacity: Record<string, number>
  layerStyles?: Record<string, any>
  layerOrder: string[]
}

/**
 * Simbología de un elemento. `null` significa que QGIS no lo dibujaría.
 *
 * Para recorrer una capa entera usar `createSymbolResolver`, que cachea: esto
 * resuelve desde cero en cada llamada.
 */
function styleFor(layerId: string, feature: any, layerStyles?: Record<string, any>) {
  return resolveSymbol(layerStyles?.[layerId], feature?.properties ?? {})
}

/** Tabla de atributos del popup. Se arma al abrirlo, no al cargar la capa. */
function tablaDePropiedades(properties: Record<string, unknown>): string {
  let html = '<div class="max-h-60 overflow-y-auto"><table class="text-xs text-left w-full border-collapse">'
  Object.entries(properties).forEach(([key, value]) => {
    // Ignorar campos internos como fid, OBJECTID
    if (key !== 'fid' && !key.startsWith('OBJECTID')) {
      html += `<tr class="border-b border-gray-100"><td class="font-bold py-1.5 pr-3 text-gray-600">${key}</td><td class="py-1.5 text-gray-800">${value ?? '-'}</td></tr>`
    }
  })
  return html + '</table></div>'
}

const CENTROIDES: Record<string, [number, number]> = {
  carmen: [18.5, -91.8],
  campeche: [19.8, -90.5],
  calakmul: [18.5, -89.5],
  candelaria: [18.3, -90.8],
  hopelchen: [19.7, -89.6],
  champoton: [19.2, -90.4],
  calkini: [20.35, -90.05],
  escarcega: [18.6, -90.7],
  hecelchakan: [20.15, -90.13],
  palizada: [18.25, -91.98],
  tenabo: [20.04, -90.23],
  seybaplaya: [19.64, -90.69],
  dzitbalche: [20.32, -90.05]
}

// Límites geográficos para restringir desplazamiento en el estado de Campeche
const CAMPECHE_BOUNDS: L.LatLngBoundsExpression = [
  [16.5, -94.5], // Suroeste (más amplio al sur y oeste)
  [21.8, -87.0]  // Noreste (más amplio al norte y este)
]





export default function MapViewer({ activeLayers, selectedFeature, layerOpacity, layerStyles, layerOrder }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const limiteEstatalLayer = useRef<L.GeoJSON | null>(null)
  const limiteMunicipalLayer = useRef<L.GeoJSON | null>(null)
  const maskLayerRef = useRef<L.Polygon | null>(null)

  // Refs para capas vectoriales dinámicas
  const vectorLayersRef = useRef<Record<string, L.GeoJSON | null>>({})

  // Estado local para el mapa base seleccionado
  const [mapaBase, setMapaBase] = useState<'claro' | 'satelite'>('claro')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const baseLayerRef = useRef<L.TileLayer | null>(null)

  // Inicializar mapa base (sin zoomControl nativo)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const container = mapRef.current
    
    // Evitar bug de StrictMode de React 19
    const isAlreadyInitialized = (container as any)._leaflet_id
    if (isAlreadyInitialized) {
      (container as any)._leaflet_id = null
    }

    const map = L.map(container, {
      center: [19.3, -90.5],
      zoom: 8,
      minZoom: 7,
      maxBounds: CAMPECHE_BOUNDS,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      attributionControl: false,
      // Renderizado en canvas en vez de SVG. Con la cartografía completa el
      // mapa montaba ~78 000 nodos en el DOM y tardaba ~12 s en pintar, cuando
      // la descarga solo aportaba ~1.3 s de eso. Los `divIcon` de los puntos
      // compuestos siguen siendo DOM: canvas solo afecta a líneas y polígonos.
      preferCanvas: true
    })

    // Crear Paneles (Panes) personalizados para el control del Z-Index
    // Los marcadores por defecto están en markerPane (zIndex 600)
    map.createPane('maskPane')
    map.getPane('maskPane')!.style.zIndex = '650' // Por encima de markerPane
    
    map.createPane('bordersPane')
    map.getPane('bordersPane')!.style.zIndex = '660' // Por encima de maskPane

    mapInstance.current = map

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
      // Las capas cacheadas pertenecían al mapa recién destruido; conservarlas
      // haría que el siguiente montaje las diera por dibujadas y el mapa
      // quedara vacío.
      vectorLayersRef.current = {}
      limiteEstatalLayer.current = null
      limiteMunicipalLayer.current = null
      maskLayerRef.current = null
      baseLayerRef.current = null
    }
  }, [])

  // Observar redimensionamientos del contenedor para invalidar el tamaño en Leaflet
  useEffect(() => {
    const map = mapInstance.current
    const container = mapRef.current
    if (!map || !container) return

    let pendiente = 0
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(pendiente)
      pendiente = requestAnimationFrame(() => {
        // El cuadro pendiente puede llegar después de que StrictMode desmontó y
        // destruyó este mapa; invalidarlo entonces revienta dentro de Leaflet,
        // que ya no tiene paneles.
        if (mapInstance.current !== map) return
        map.invalidateSize()
      })
    })

    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(pendiente)
      resizeObserver.disconnect()
    }
  }, [])

  // Efecto dinámico para cambiar el mapa base (Claro vs Satelital)
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Quitar capa base previa si existe
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current)
    }

    let newBaseLayer: L.TileLayer
    if (mapaBase === 'claro') {
      // `maxNativeZoom` porque el teselado de Esri solo llega a z16: sin esto,
      // a partir de ahí el mapa se queda en blanco en lugar de reescalar.
      newBaseLayer = L.tileLayer(ESRI_CLARO, {
        maxZoom: 19,
        maxNativeZoom: 16,
        attribution: ESRI_ATRIBUCION
      })
    } else {
      newBaseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    }

    newBaseLayer.addTo(map)
    baseLayerRef.current = newBaseLayer
  }, [mapaBase])

  // Actualizar estilos y geometrías según capas activas
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Eliminar capas que ya no están activas
    Object.keys(vectorLayersRef.current).forEach(layerId => {
      if (!activeLayers.includes(layerId)) {
        const layer = vectorLayersRef.current[layerId]
        if (layer && map.hasLayer(layer)) {
          map.removeLayer(layer)
        }
        delete vectorLayersRef.current[layerId]
      }
    })

    // Añadir/Actualizar capas activas
    activeLayers.forEach(layerId => {
      const opacity = layerOpacity[layerId] ?? 1
      
      if (!vectorLayersRef.current[layerId]) {
        // Los marcadores de punto se componen una sola vez, al construir la
        // capa, así que no se dibuja nada hasta conocer su simbología: de otro
        // modo quedarían congelados con el estilo provisional. El efecto se
        // vuelve a ejecutar cuando `layerStyles` llega.
        if (!layerStyles?.[layerId]) return

        // Marcar como cargando (con placeholder) para evitar múltiples fetch
        vectorLayersRef.current[layerId] = L.geoJSON(undefined)
        
        // Cargar nueva capa
        getCapaGeoJSON(layerId)
          .then(data => {
            // El fetch puede resolver después de que el mapa fue destruido:
            // StrictMode monta el componente dos veces y añadir capas al mapa
            // desechado revienta dentro de Leaflet.
            if (mapInstance.current !== map) return
            // Verificar si sigue activa antes de añadirla
            if (!activeLayers.includes(layerId)) return
            
            // Un resolvedor por capa: cachea el símbolo por valor del campo
            // de clasificación. Leaflet consulta la simbología tres veces por
            // elemento y aquí eso son cientos de miles de llamadas.
            const simbologia = layerStyles[layerId]
            const simboloDe = createSymbolResolver(simbologia)

            // `renderer` no está en los tipos de `GeoJSONOptions`, pero Leaflet
            // pasa las opciones completas a cada geometría que crea, así que sí
            // se respeta. Se declara aquí para no perder el resto del tipado.
            const opciones: L.GeoJSONOptions & { renderer?: L.Renderer } = {
              // El mapa va en canvas por rendimiento, pero las tramas y los
              // rellenos de imagen son un `<pattern>` de SVG: el canvas los
              // recibe como texto, no los entiende y pinta negro. Esas capas
              // son pocas, así que se quedan en SVG. `undefined` deja que use
              // el renderizador del mapa.
              renderer: usesPatternFill(simbologia) ? L.svg() : undefined,
              // QGIS omite las clases apagadas y los valores fuera de rango;
              // descartarlos aquí evita crear geometrías invisibles.
              filter: (feature) => simboloDe(feature?.properties) !== null,
              style: (feature) => toPathOptions(simboloDe(feature?.properties), opacity),
              pointToLayer: (feature, latlng) => {
                const symbol = simboloDe(feature?.properties)
                return (
                  toPointLayer(symbol, latlng, opacity) ??
                  L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 })
                )
              },
              onEachFeature: (feature, layer) => {
                if (!feature.properties) return

                // Rótulo permanente sobre el elemento. `direction: 'center'` lo
                // pone encima del polígono y no a un lado, que es lo que se
                // espera de un nombre de municipio.
                const campoRotulo = appConfig.LAYER_LABELS[layerId]
                const texto = campoRotulo ? feature.properties[campoRotulo] : null
                if (texto) {
                  layer.bindTooltip(String(texto), {
                    permanent: true,
                    direction: 'center',
                    className: 'rotulo-capa',
                    // Sin esto Leaflet intercepta el clic y el popup no abre.
                    interactive: false
                  })
                }
                // El contenido se arma al abrir, no al cargar: construirlo aquí
                // significaba una tabla HTML y un popup por elemento, y hay
                // capas de decenas de miles. Leaflet acepta una función y la
                // evalúa en el primer clic.
                layer.bindPopup(() => tablaDePropiedades(feature.properties), { maxWidth: 300 })
              }
            }

            const geoJsonLayer = L.geoJSON(data, opciones).addTo(map)
            
            // Reemplazar placeholder
            const oldPlaceholder = vectorLayersRef.current[layerId]
            if (oldPlaceholder && map.hasLayer(oldPlaceholder)) map.removeLayer(oldPlaceholder)
            
            vectorLayersRef.current[layerId] = geoJsonLayer
            
            // Re-aplicar Z-Index
            const reversedOrder = [...layerOrder].reverse()
            reversedOrder.forEach((id) => {
              const l = vectorLayersRef.current[id]
              if (l && map.hasLayer(l)) l.bringToFront()
            })
            // Traer los límites al frente
            if (limiteMunicipalLayer.current) limiteMunicipalLayer.current.bringToFront()
            if (limiteEstatalLayer.current) limiteEstatalLayer.current.bringToFront()
          })
          .catch(err => {
            console.error(err)
            delete vectorLayersRef.current[layerId]
          })
      } else {
        // Capa ya cargada: refrescar la opacidad sin volver a descargar el
        // GeoJSON. Los marcadores compuestos no son Path, así que no tienen
        // setStyle y hay que ajustarlos con setOpacity.
        vectorLayersRef.current[layerId]?.eachLayer((child) => {
          const symbol = styleFor(layerId, (child as any).feature, layerStyles)
          if ('setStyle' in child) {
            (child as L.Path).setStyle(toPathOptions(symbol, opacity))
          } else if ('setOpacity' in child) {
            (child as L.Marker).setOpacity((symbol?.opacity ?? 1) * opacity)
          }
        })
      }
    })

    // Renderizar límite municipal si no existe
    if (!limiteMunicipalLayer.current) {
      limiteMunicipalLayer.current = L.geoJSON(LimMunBase as any, {
        pane: 'bordersPane',
        style: () => ({
          fill: false,
          weight: 1.2,
          color: mapaBase === 'satelite' ? '#cbd5e1' : '#475569',
          dashArray: '4, 4',
          interactive: false
        })
      }).addTo(map)
    } else {
      limiteMunicipalLayer.current.setStyle({
        color: mapaBase === 'satelite' ? '#cbd5e1' : '#475569'
      })
    }

    // Renderizar límite estatal
    if (!limiteEstatalLayer.current) {
      limiteEstatalLayer.current = L.geoJSON(LimEstBase as any, {
        pane: 'bordersPane',
        style: () => ({
          fill: false,
          weight: 2.2,
          color: mapaBase === 'satelite' ? '#ffffff' : '#0f172a',
          interactive: false
        })
      }).addTo(map)
    } else {
      limiteEstatalLayer.current.setStyle({
        color: mapaBase === 'satelite' ? '#ffffff' : '#0f172a'
      })
    }

    // Renderizar máscara invertida si hay un municipio seleccionado
    if (maskLayerRef.current) {
      map.removeLayer(maskLayerRef.current)
      maskLayerRef.current = null
    }

    if (selectedFeature) {
      const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      
      const munFeature = (LimMunBase as any).features.find(
        (f: any) => normalize(f.properties.NOMGEO) === normalize(selectedFeature.nombre)
      )

      if (munFeature && munFeature.geometry) {
        // Anillo exterior que cubre todo
        const outerRing: [number, number][] = [
          [90, -180], [90, 180], [-90, 180], [-90, -180]
        ]
        const holes: [number, number][][] = []
        
        if (munFeature.geometry.type === 'Polygon') {
          munFeature.geometry.coordinates.forEach((ring: any[]) => {
            holes.push(ring.map((c: any[]) => [c[1], c[0]]))
          })
        } else if (munFeature.geometry.type === 'MultiPolygon') {
          munFeature.geometry.coordinates.forEach((poly: any[]) => {
            poly.forEach((ring: any[]) => {
              holes.push(ring.map((c: any[]) => [c[1], c[0]]))
            })
          })
        }

        maskLayerRef.current = L.polygon([outerRing, ...holes], {
          stroke: false,
          fillColor: mapaBase === 'satelite' ? '#000000' : '#f8fafc',
          fillOpacity: mapaBase === 'satelite' ? 0.65 : 0.85,
          interactive: true, // Bloquea los clics a las capas que están por debajo
          pane: 'maskPane' // Panel con zIndex superior
        }).addTo(map)
      }
    }

    // Ajustar orden de apilamiento visual (Z-Index)
    const reversedOrder = [...layerOrder].reverse()
    reversedOrder.forEach((id) => {
      const layer = vectorLayersRef.current[id]
      if (layer && map.hasLayer(layer)) {
        layer.bringToFront()
      }
    })

    // (Opcional) Traer al frente dentro de sus respectivos Panes, 
    // aunque el CSS zIndex de los Panes ya garantiza el orden global absoluto.
    if (maskLayerRef.current && map.hasLayer(maskLayerRef.current)) maskLayerRef.current.bringToFront()
    if (limiteMunicipalLayer.current && map.hasLayer(limiteMunicipalLayer.current)) limiteMunicipalLayer.current.bringToFront()
    if (limiteEstatalLayer.current && map.hasLayer(limiteEstatalLayer.current)) limiteEstatalLayer.current.bringToFront()

  }, [activeLayers, selectedFeature, mapaBase, layerOpacity, layerOrder, layerStyles])  // Centrar mapa al seleccionar un municipio
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !selectedFeature) return

    const coords = CENTROIDES[selectedFeature.id]
    if (coords) {
      map.setView(coords, 9, { animate: true, duration: 0.8 })
    }
  }, [selectedFeature])

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="geovisor-map-container"
      />

      {/* Controles del Mapa (Esquina Superior Derecha) */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-center gap-3">
        {/* Selector de Mapa Base */}
        <div className="relative">
          <button
            onClick={() => setSelectorOpen(!selectorOpen)}
            className="w-8 h-8 rounded-md bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all cursor-pointer border border-gray-100"
            aria-label="Cambiar mapa base"
            aria-haspopup="true"
            aria-expanded={selectorOpen}
            title="Mapa base"
          >
            {/* Icono de capas */}
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </button>

          {selectorOpen && (
            <div className="absolute right-full mr-2 top-0 bg-white border border-gray-100 rounded-lg shadow-xl p-2 flex flex-col gap-1 w-40 animate-in fade-in slide-in-from-right-2 duration-200">
              <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-1.5 pb-1 border-b border-gray-50">
                Capa Base
              </h5>
              <button
                onClick={() => {
                  setMapaBase('claro')
                  setSelectorOpen(false)
                }}
                className={`px-2.5 py-1.5 rounded text-[11px] font-semibold w-full text-left transition-colors cursor-pointer border ${
                  mapaBase === 'claro'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
              >
                Mapa Claro
              </button>
              <button
                onClick={() => {
                  setMapaBase('satelite')
                  setSelectorOpen(false)
                }}
                className={`px-2.5 py-1.5 rounded text-[11px] font-semibold w-full text-left transition-colors cursor-pointer border ${
                  mapaBase === 'satelite'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
              >
                Vista Satelital
              </button>
            </div>
          )}
        </div>

        {/* Botones de Zoom Personalizados: más pequeños y con espacio */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => mapInstance.current?.zoomIn()}
            className="w-7 h-7 rounded-md bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all cursor-pointer border border-gray-100"
            aria-label="Acercar"
            title="Zoom in"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => mapInstance.current?.zoomOut()}
            className="w-7 h-7 rounded-md bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all cursor-pointer border border-gray-100"
            aria-label="Alejar"
            title="Zoom out"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              try {
                const mockContent = new Uint8Array([0x47, 0x50, 0x4b, 0x47]);
                const blob = new Blob([mockContent], { type: 'application/geopackage+sqlite3' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const layersString = activeLayers.length > 0 ? activeLayers.join('_') : 'sin_capas';
                a.download = `capas_${layersString}.gpkg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (error) {
                console.error("Error al descargar el archivo GPKG:", error);
              }
            }}
            className="w-7 h-7 rounded-md bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-all cursor-pointer border border-gray-100"
            aria-label="Descargar capas activas (.gpkg)"
            title="Descargar capas activas"
          >
            <svg width="15" height="15" viewBox="0 0 512 512" fill="currentColor" className="text-gray-700">
              <path d="M256 0C114.6 0 0 114.6 0 256c0 141.4 114.6 256 256 256s256-114.6 256-256C512 114.6 397.4 0 256 0zM256 362.7c-7.5 0-14.7-3-20-8.3L129.3 247.7c-11-11-11-29 0-40s29-11 40 0l58.7 58.7V117.3c0-15.6 12.7-28.3 28.3-28.3s28.3 12.7 28.3 28.3v149.1l58.7-58.7c11-11 29-11 40 0s11 29 0 40L276 354.3C270.7 359.7 263.5 362.7 256 362.7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
