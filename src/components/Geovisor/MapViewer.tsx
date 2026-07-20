import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CAMPECHE_GEOJSON, MunicipioProperties } from '../../data/campecheData'
import LimEstBase from '../../data/Lim_Est_Base.json'
import LimMunBase from '../../data/Lim_Mun_Base.json'

interface Props {
  activeLayers: string[]
  selectedFeature: MunicipioProperties | null
  onSelectFeature: (feature: MunicipioProperties | null) => void
  layerOpacity: Record<string, number>
  layerOrder: string[]
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

// Coordenadas de los puertos principales
const PUERTOS: { nombre: string; coords: [number, number]; desc: string }[] = [
  { nombre: 'Puerto Isla del Carmen', coords: [18.65, -91.84], desc: 'Puerto pesquero e industrial petrolero principal.' },
  { nombre: 'Puerto de Seybaplaya', coords: [19.64, -90.69], desc: 'Puerto comercial y de carga en crecimiento.' }
]

// Mapeo dinámico de nombres de capas según su ID
const NOMBRES_CAPAS: Record<string, string> = {
  anp: 'Áreas Naturales Protegidas (ANP)',
  manglares: 'Manglares y Zonas Costeras',
  poblacion: 'Densidad de Población por Municipio',
  zonificacion: 'Zonificación Primaria y Uso de Suelo',
  'linea-trans': 'Líneas de Transmisión Eléctrica',
  'via-ferrea': 'Vías Férreas y Tren Maya',
  educacion: 'Equipamientos Educativos'
}

// Datos y colores de densidad demográfica por municipio (utilizando geometrías de Lim_Mun_Base.json)
const COLORES_POBLACION: Record<string, { color: string; pob: string; densidad: string; clasificacion: string }> = {
  'Campeche':     { color: '#991b1b', pob: '294,077 hab.', densidad: '90.6 hab/km²', clasificacion: 'Muy Alta' },
  'Carmen':       { color: '#b91c1c', pob: '248,845 hab.', densidad: '16.0 hab/km²', clasificacion: 'Alta' },
  'Champotón':    { color: '#ea580c', pob: '78,170 hab.',  densidad: '12.8 hab/km²', clasificacion: 'Media' },
  'Escárcega':    { color: '#ea580c', pob: '59,974 hab.',  densidad: '12.5 hab/km²', clasificacion: 'Media' },
  'Calkiní':      { color: '#ea580c', pob: '56,150 hab.',  densidad: '26.8 hab/km²', clasificacion: 'Media' },
  'Candelaria':   { color: '#f97316', pob: '43,870 hab.',  densidad: '7.9 hab/km²',  clasificacion: 'Media-Baja' },
  'Hopelchén':    { color: '#f97316', pob: '40,140 hab.',  densidad: '3.5 hab/km²',  clasificacion: 'Media-Baja' },
  'Hecelchakán': { color: '#fdba74', pob: '31,996 hab.',  densidad: '29.2 hab/km²', clasificacion: 'Baja' },
  'Calakmul':     { color: '#ffedd5', pob: '31,750 hab.',  densidad: '2.3 hab/km²',  clasificacion: 'Muy Baja' },
  'Tenabo':       { color: '#ffedd5', pob: '11,452 hab.',  densidad: '10.8 hab/km²', clasificacion: 'Muy Baja' },
  'Palizada':     { color: '#ffedd5', pob: '8,683 hab.',   densidad: '4.1 hab/km²',  clasificacion: 'Muy Baja' },
  'Seybaplaya':   { color: '#fdba74', pob: '15,294 hab.',  densidad: '52.9 hab/km²', clasificacion: 'Baja' },
  'Dzitbalché':   { color: '#fdba74', pob: '16,384 hab.',  densidad: '44.6 hab/km²', clasificacion: 'Baja' }
}

// Función de color según el uso de suelo primario (Uso_prim.geojson)
const getUsoPrimColor = (desc?: string): string => {
  if (!desc) return '#2563eb'
  const d = desc.toUpperCase()
  if (d.includes('URBANO')) return '#dc2626'
  if (d.includes('MANGLAR')) return '#0ea5e9'
  if (d.includes('AGUA')) return '#0284c7'
  if (d.includes('AGRICULTURA') || d.includes('RIEGO') || d.includes('TEMPORAL') || d.includes('HUMEDAD')) return '#d97706'
  if (d.includes('PASTIZAL')) return '#eab308'
  if (d.includes('SELVA') || d.includes('BOSQUE') || d.includes('VEGETACIÓN')) return '#15803d'
  if (d.includes('ACUÍCOLA')) return '#0891b2'
  if (d.includes('DESPROVISTA') || d.includes('SIN VEGETACIÓN')) return '#9ca3af'
  if (d.includes('SABANA') || d.includes('TULAR') || d.includes('POPAL')) return '#84cc16'
  return '#2563eb'
}

// Mapeo de layer ID → archivo GeoJSON y estilo visual
const LAYER_CONFIG: Record<string, { file: string; fillColor: string; strokeColor: string; fillOpacityBase: number; colorField?: string; weight?: number; dashArray?: string; isPoint?: boolean }> = {
  anp:            { file: '/anp.geojson',             fillColor: '#10b981', strokeColor: '#047857', fillOpacityBase: 0.55 },
  manglares:      { file: '/cuerpos_agua.geojson',     fillColor: '#0ea5e9', strokeColor: '#0284c7', fillOpacityBase: 0.60 },
  zonificacion:   { file: '/Uso_prim.geojson',         fillColor: '#2563eb', strokeColor: '#1e3a8a', fillOpacityBase: 0.55 },
  'linea-trans':  { file: '/Linea_trans.geojson',      fillColor: '#eab308', strokeColor: '#d97706', fillOpacityBase: 0.9, weight: 2.5 },
  'via-ferrea':   { file: '/Via_Ferrea.geojson',       fillColor: '#059669', strokeColor: '#047857', fillOpacityBase: 0.9, weight: 3, dashArray: '6, 4' },
  educacion:      { file: '/educacion.json',           fillColor: '#8b5cf6', strokeColor: '#ffffff', fillOpacityBase: 0.85, isPoint: true },
}

const normalizeStr = (str: string) =>
  (str || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

// Buscar correspondencia de municipio para una capa dada
const matchMunicipality = (properties: any): MunicipioProperties => {
  const nomGeo = properties.NOMGEO || properties.nombre || properties.municipio || properties.zona || ''
  const normTarget = normalizeStr(nomGeo)
  const fullText = normalizeStr(`${properties.nombre || ''} ${properties.NOMGEO || ''} ${properties.municipio || ''} ${properties.municipios || ''} ${properties.estados || ''} ${properties.NOM_AP || ''} ${properties.zona || ''}`)

  const found = CAMPECHE_GEOJSON.features.find(f => {
    const fNom = normalizeStr(f.properties.nombre)
    const fId = normalizeStr(f.properties.id)
    return (
      normTarget === fNom ||
      normTarget === fId ||
      fNom.includes(normTarget) ||
      normTarget.includes(fNom) ||
      fullText.includes(fNom) ||
      fullText.includes(fId)
    )
  })

  if (found) return found.properties

  const displayName = nomGeo || 'Municipio de Campeche'
  return {
    id: normTarget.replace(/\s+/g, '-'),
    nombre: displayName,
    cabecera: properties.cabecera || displayName,
    superficie: properties.superficie || 'Superficie Municipal',
    poblacion: properties.poblacion ? `${properties.poblacion.toLocaleString()} hab.` : (properties.pob || 'N/A'),
    usoSuelo: properties.usoSuelo || 'Uso de suelo PEOTDU',
    colorUso: properties.colorUso || '#ca8a04',
    zonificacion: properties.zonificacion || 'Zonificación Municipal',
    colorZonif: properties.colorZonif || '#2563eb',
    anp: properties.anp || 'Zona de Ordenamiento',
    colorAnp: '#16a34a',
    detalles: `Ficha territorial correspondiente al municipio de ${displayName}.`,
    escalaReferencia: 'Municipal',
    instrumentoNormativo: `PDU ${displayName} 2023-2053`,
    responsable: `H. Ayuntamiento de ${displayName}`,
    fechaActualizacion: '2024-01-15',
    vigencia: '2023-2053'
  }
};

// Generar popup HTML según el tipo de capa
const buildPopup = (layerId: string, props: any): string => {
  const wrap = (title: string, color: string, body: string) => `
    <div style="font-family: var(--font-body); padding: 4px; max-width: 220px;">
      <h5 style="margin: 0 0 4px 0; color: ${color}; font-weight: 700; font-size: 11px;">${title}</h5>
      <p style="margin: 0; font-size: 10px; color: var(--c-text-lt); line-height: 1.4;">${body}</p>
    </div>`

  switch (layerId) {
    case 'anp': {
      const n = props.nombre || props.NOM_AP || 'Sin nombre'
      const cat = props.cat_decret || props.CAT_MANEJO || 'N/A'
      return wrap('Área Natural Protegida', '#047857',
        `<strong>Nombre:</strong> ${n}<br/><strong>Categoría:</strong> ${cat}<br/><strong>Estados:</strong> ${props.estados || 'Campeche'}`)
    }
    case 'manglares': {
      const n = props.nombre || props.NOM_GEO || 'Sin nombre'
      return wrap('Cuerpo de Agua / Zona Costera', '#0284c7',
        `<strong>Nombre:</strong> ${n}<br/><strong>Tipo:</strong> ${props.tipo || props.TIPO || 'Cuerpo de agua'}`)
    }
    case 'poblacion':
      return wrap('Demografía', '#991b1b',
        `<strong>Zona:</strong> ${props.zona}<br/><strong>Clasificación:</strong> ${props.clasificacion}<br/><strong>Población:</strong> ${props.poblacion?.toLocaleString() || 'N/A'} hab.<br/><strong>Densidad:</strong> ${props.densidad}<br/><strong>Marginación:</strong> ${props.indice_marginacion}`)
    case 'zonificacion':
      return wrap('Zonificación Primaria y Uso de Suelo', '#1e3a8a',
        `<strong>Uso de Suelo Primario:</strong> ${props.DESCRIPCIO || props.nombre || 'Zonificación territorial'}<br/><strong>Región:</strong> ${props.municipio || props.estados || 'Campeche'}`)
    case 'linea-trans':
      return wrap('Línea de Transmisión Eléctrica', '#d97706',
        `<strong>Condición:</strong> ${props.condicion || 'En operación'}<br/><strong>Tipo:</strong> ${props.tipo || 'Línea de postería/torres'}<br/><strong>Carta INEGI:</strong> ${props.carta || 'N/A'}`)
    case 'via-ferrea':
      return wrap('Vía Férrea / Tren Maya', '#047857',
        `<strong>Vía:</strong> ${props.VIA || 'Tren Maya'}<br/><strong>Entidad:</strong> ${props.ENTIDAD || 'Tren Maya S.A. de C.V.'}<br/><strong>Servicio:</strong> ${props.SERVICIO || 'Pasajeros/Carga'}<br/><strong>Condición:</strong> ${props.CNDICON || 'Operación'}`)
    case 'educacion': {
      const tipoMap: Record<string, string> = {
        superior: 'Educación Superior',
        media_superior: 'Educación Media Superior',
        secundaria: 'Educación Secundaria',
        primaria: 'Educación Primaria',
        preescolar: 'Educación Preescolar'
      }
      const labelTipo = tipoMap[props.tipo_edu] || props.tipo_edu || 'Equipamiento Educativo'
      return wrap('Equipamiento Educativo', '#6d28d9',
        `<strong>Tipo de plantel:</strong> ${labelTipo}<br/><strong>Categoría:</strong> Infraestructura social y educativa`)
    }
    default:
      return ''
  }
}

export default function MapViewer({ activeLayers, selectedFeature, onSelectFeature, layerOpacity, layerOrder }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const markerLayerGroup = useRef<L.LayerGroup | null>(null)
  const limiteEstatalLayer = useRef<L.GeoJSON | null>(null)
  const limiteMunicipalLayer = useRef<L.GeoJSON | null>(null)

  // Refs para capas vectoriales dinámicas
  const vectorLayersRef = useRef<Record<string, L.GeoJSON | null>>({})

  // Cache de datos GeoJSON cargados
  const [geoData, setGeoData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Set<string>>(new Set())

  // Estado local para el mapa base seleccionado
  const [mapaBase, setMapaBase] = useState<'claro' | 'satelite'>('claro')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const baseLayerRef = useRef<L.TileLayer | null>(null)

  // Loader genérico: carga GeoJSON bajo demanda y lo cachea
  const loadGeoJSON = useCallback((layerId: string) => {
    const cfg = LAYER_CONFIG[layerId]
    if (!cfg || geoData[layerId] || loading.has(layerId)) return

    setLoading(prev => new Set(prev).add(layerId))
    fetch(cfg.file)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setGeoData(prev => ({ ...prev, [layerId]: data }))
        setLoading(prev => { const n = new Set(prev); n.delete(layerId); return n })
      })
      .catch(err => {
        console.error(`Error al cargar ${layerId}:`, err)
        setLoading(prev => { const n = new Set(prev); n.delete(layerId); return n })
      })
  }, [geoData, loading])

  // Cargar datos bajo demanda cuando se activan capas
  useEffect(() => {
    activeLayers.forEach(id => {
      if (LAYER_CONFIG[id] && !geoData[id]) loadGeoJSON(id)
    })
  }, [activeLayers, geoData, loadGeoJSON])

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
      zoomControl: false,
      attributionControl: false
    })

    // Crear grupo para marcadores dinámicos
    markerLayerGroup.current = L.layerGroup().addTo(map)

    mapInstance.current = map

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // Observar redimensionamientos del contenedor para invalidar el tamaño en Leaflet
  useEffect(() => {
    const map = mapInstance.current
    const container = mapRef.current
    if (!map || !container) return

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        map.invalidateSize()
      })
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.unobserve(container)
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
      newBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
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

    // Limpiar capas vectoriales previas
    Object.values(vectorLayersRef.current).forEach(layer => {
      if (layer && map.hasLayer(layer)) map.removeLayer(layer)
    })
    vectorLayersRef.current = {}

    if (limiteEstatalLayer.current) map.removeLayer(limiteEstatalLayer.current)
    if (limiteMunicipalLayer.current) map.removeLayer(limiteMunicipalLayer.current)

    // Limpiar marcadores dinámicos anteriores
    if (markerLayerGroup.current) {
      markerLayerGroup.current.clearLayers()
    }

    // Renderizar capas vectoriales GeoJSON dinámicas
    const vectorLayerIds = ['anp', 'manglares', 'zonificacion', 'linea-trans', 'via-ferrea', 'educacion']
    vectorLayerIds.forEach(layerId => {
      if (!activeLayers.includes(layerId)) return
      const data = geoData[layerId]
      if (!data) return

      const cfg = LAYER_CONFIG[layerId]
      if (!cfg) return

      const opacity = layerOpacity[layerId] !== undefined ? layerOpacity[layerId] : 1

      vectorLayersRef.current[layerId] = L.geoJSON(data, {
        pointToLayer: cfg.isPoint
          ? (feature, latlng) => {
              const coloresEdu: Record<string, string> = {
                superior: '#8b5cf6',
                media_superior: '#3b82f6',
                secundaria: '#10b981',
                primaria: '#f59e0b',
                preescolar: '#f43f5e'
              }
              const pColor = feature?.properties?.tipo_edu ? (coloresEdu[feature.properties.tipo_edu] || cfg.fillColor) : cfg.fillColor
              return L.circleMarker(latlng, {
                radius: 4.5,
                fillColor: pColor,
                color: '#ffffff',
                weight: 1,
                fillOpacity: cfg.fillOpacityBase * opacity,
                opacity: opacity
              })
            }
          : undefined,
        style: (feature) => {
          let fColor = cfg.fillColor
          if (feature?.properties?.tipo_edu) {
            const coloresEdu: Record<string, string> = {
              superior: '#8b5cf6',
              media_superior: '#3b82f6',
              secundaria: '#10b981',
              primaria: '#f59e0b',
              preescolar: '#f43f5e'
            }
            fColor = coloresEdu[feature.properties.tipo_edu] || cfg.fillColor
          } else if (layerId === 'zonificacion' && feature?.properties?.DESCRIPCIO) {
            fColor = getUsoPrimColor(feature.properties.DESCRIPCIO)
          } else if (cfg.colorField && feature?.properties?.[cfg.colorField]) {
            fColor = feature.properties[cfg.colorField]
          }
          return {
            fillColor: fColor,
            fillOpacity: cfg.fillOpacityBase * opacity,
            color: cfg.strokeColor,
            weight: cfg.weight || 1.5,
            dashArray: cfg.dashArray,
            opacity: opacity
          }
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              const matchedProp = matchMunicipality(feature.properties)
              onSelectFeature({
                ...matchedProp,
                nombre: NOMBRES_CAPAS[layerId] || layerId
              })
            }
          })
          const popupHtml = buildPopup(layerId, feature.properties)
          if (popupHtml) layer.bindPopup(popupHtml)
        }
      }).addTo(map)
    })

    // Renderizar capa de Densidad de Población coloreando directamente Lim_Mun_Base.json
    if (activeLayers.includes('poblacion')) {
      const opacity = layerOpacity['poblacion'] !== undefined ? layerOpacity['poblacion'] : 1
      vectorLayersRef.current['poblacion'] = L.geoJSON(LimMunBase as any, {
        style: (feature) => {
          const nom = feature?.properties?.NOMGEO || ''
          const item = COLORES_POBLACION[nom]
          const fillColor = item ? item.color : '#d1d5db'
          return {
            fillColor,
            fillOpacity: 0.65 * opacity,
            color: mapaBase === 'satelite' ? '#cbd5e1' : '#334155',
            weight: 1.5,
            opacity: opacity
          }
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            click: (e) => {
              L.DomEvent.stopPropagation(e)
              const matchedProp = matchMunicipality(feature.properties)
              onSelectFeature({
                ...matchedProp,
                nombre: NOMBRES_CAPAS['poblacion'] || 'Densidad de Población por Municipio'
              })
            }
          })
          const nom = feature?.properties?.NOMGEO || ''
          const item = COLORES_POBLACION[nom]
          if (item) {
            layer.bindPopup(`
              <div style="font-family: var(--font-body); padding: 4px; max-width: 220px;">
                <h5 style="margin: 0 0 4px 0; color: #991b1b; font-weight: 700; font-size: 11px;">Bienestar Social y Demografía</h5>
                <p style="margin: 0; font-size: 10px; color: var(--c-text-lt); line-height: 1.4;">
                  <strong>Municipio:</strong> ${nom}<br/>
                  <strong>Clasificación:</strong> ${item.clasificacion}<br/>
                  <strong>Población total:</strong> ${item.pob}<br/>
                  <strong>Densidad:</strong> ${item.densidad}
                </p>
              </div>
            `)
          }
        }
      }).addTo(map)
    }

    // Renderizar puertos si corresponde
    if (activeLayers.includes('puertos') && markerLayerGroup.current) {
      PUERTOS.forEach((p) => {
        const marker = L.circleMarker(p.coords, {
          radius: 9,
          fillColor: 'var(--c-guinda)',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.95
        })
        
        marker.bindPopup(`
          <div style="font-family: var(--font-body); padding: 2px;">
            <h5 style="margin: 0 0 4px 0; color: var(--c-guinda-dk); font-weight: 700;">${p.nombre}</h5>
            <p style="margin: 0; font-size: 11px; color: var(--c-text-lt); line-height: 1.4;">${p.desc}</p>
          </div>
        `)
        
        markerLayerGroup.current?.addLayer(marker)
      })
    }

    // Renderizar límite municipal (solo líneas discontinuas, sin relleno)
    limiteMunicipalLayer.current = L.geoJSON(LimMunBase as any, {
      style: () => ({
        fill: false,
        weight: 1.2,
        color: mapaBase === 'satelite' ? '#cbd5e1' : '#475569',
        dashArray: '4, 4',
        interactive: false
      })
    }).addTo(map)

    // Renderizar límite estatal (solo líneas continuas más gruesas, sin relleno)
    limiteEstatalLayer.current = L.geoJSON(LimEstBase as any, {
      style: () => ({
        fill: false,
        weight: 2.2,
        color: mapaBase === 'satelite' ? '#ffffff' : '#0f172a',
        interactive: false
      })
    }).addTo(map)

    // Ajustar orden de apilamiento visual (Z-Index) de capas vectoriales según layerOrder
    const reversedOrder = [...layerOrder].reverse()
    reversedOrder.forEach((id) => {
      const layer = vectorLayersRef.current[id]
      if (layer && map.hasLayer(layer)) {
        layer.bringToFront()
      }
    })

    // Traer los límites al frente de las capas con relleno
    if (limiteMunicipalLayer.current && map.hasLayer(limiteMunicipalLayer.current)) {
      limiteMunicipalLayer.current.bringToFront()
    }
    if (limiteEstatalLayer.current && map.hasLayer(limiteEstatalLayer.current)) {
      limiteEstatalLayer.current.bringToFront()
    }

  }, [activeLayers, selectedFeature, onSelectFeature, mapaBase, layerOpacity, layerOrder, geoData])

  // Centrar mapa al seleccionar un municipio
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !selectedFeature) return

    const coords = CENTROIDES[selectedFeature.id]
    if (coords) {
      map.setView(coords, 9, { animate: true, duration: 0.8 })
    }
  }, [selectedFeature])

  const isLoading = loading.size > 0

  return (
    <div className="relative w-full h-full">
      <div
        ref={mapRef}
        className="geovisor-map-container"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[2000] flex items-center justify-center flex-col gap-3 transition-all duration-300">
          <div className="w-9 h-9 border-[3.5px] border-[var(--c-guinda)] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[11px] font-semibold text-gray-700 bg-white/95 px-4 py-2 rounded-full shadow-md border border-gray-100 uppercase tracking-wider">
            Cargando capa cartográfica...
          </span>
        </div>
      )}
      
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
