import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/plataforma/header'
import Navbar from '../components/plataforma/navbar'
import Footer from '../components/plataforma/footer'
import Underfooter from '../components/plataforma/underfooter'
import MapViewer from '../components/geovisor/map-viewer'
import SidebarControl from '../components/geovisor/sidebar-control'
import ModuleLayerSelector from '../components/geovisor/module-layer-selector'
import MapLegend from '../components/geovisor/map-legend'
import GeovisorGuideOverlay from '../components/geovisor/geovisor-guide-overlay'
import { MunicipioProperties } from '../data/campecheData'
import { appConfig } from '../config/appConfig'

export default function Geovisor() {
  const [searchParams] = useSearchParams()
  const moduloInicial = searchParams.get('modulo') || appConfig.DEFAULT_MODULE

  const [showGuide, setShowGuide] = useState(() => {
    try {
      return !localStorage.getItem('peotdu_geovisor_guide_dismissed')
    } catch {
      return true
    }
  })

  const handleCloseGuide = () => {
    setShowGuide(false)
    try {
      localStorage.setItem('peotdu_geovisor_guide_dismissed', 'true')
    } catch {
      // Ignorar restricciones de almacenamiento local
    }
  }

  const handleOpenGuide = () => {
    setShowGuide(true)
  }

  // Hacer scroll hacia arriba al cargar la página
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Las capas activas las fija el módulo seleccionado, que se resuelve hasta
  // que ModuleLayerSelector termina de leer los estilos.
  const [activeLayers, setActiveLayers] = useState<string[]>([])
  const [activeModuleTitle, setActiveModuleTitle] = useState<string>('')
  const [selectedFeature, setSelectedFeature] = useState<MunicipioProperties | null>(null)
  const [selectedLayerInfo, setSelectedLayerInfo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'capas' | 'info'>('capas')
  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>({})
  const [layerStyles, setLayerStyles] = useState<Record<string, any>>({})
  const [layerLabels, setLayerLabels] = useState<Record<string, string>>({})
  const [layerOrder, setLayerOrder] = useState<string[]>([])

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacity((prev) => ({ ...prev, [layerId]: opacity }))
  }

  // La leyenda enumera lo que el mapa está dibujando, en su mismo orden de
  // apilado: la capa de encima aparece primero.
  const legendLayers = layerOrder
    .filter((id) => activeLayers.includes(id))
    .filter((id) => !appConfig.LEGEND_HIDDEN_LAYERS.includes(id))
    .map((id) => ({ id, label: layerLabels[id] ?? id }))

  return (
    <div className="page-shell">
      <Header />
      <Navbar />

      <main id="main-content" className="geovisor-layout">
        <SidebarControl
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          selectedFeature={selectedFeature}
          onSelectFeature={(feat) => {
            setSelectedFeature(feat)
            if (feat) setSelectedLayerInfo(null)
          }}
          selectedLayerInfo={selectedLayerInfo}
          onSelectLayerInfo={(info) => {
            setSelectedLayerInfo(info)
            if (info) setSelectedFeature(null)
          }}
          activeLayers={activeLayers}
          activeModuleTitle={activeModuleTitle}
        >
          <ModuleLayerSelector
            activeLayers={activeLayers}
            onChangeLayers={setActiveLayers}
            initialModule={moduloInicial}
            layerOpacity={layerOpacity}
            onChangeOpacity={handleOpacityChange}
            layerOrder={layerOrder}
            onChangeOrder={setLayerOrder}
            onStylesLoaded={(styles, labels) => {
              setLayerStyles(styles)
              setLayerLabels(labels)
            }}
            onInfoClick={(info) => {
              setSelectedLayerInfo(info)
              setSelectedFeature(null)
              setActiveTab('info')
            }}
            onActiveModuleChange={setActiveModuleTitle}
          />
        </SidebarControl>

        <div className="flex-1 relative h-full">
          <MapViewer
            activeLayers={activeLayers}
            selectedFeature={selectedFeature}
            layerOpacity={layerOpacity}
            layerStyles={layerStyles}
            layerOrder={layerOrder}
            onLayerClick={(layerId, propiedades) => {
              setSelectedLayerInfo({
                key: layerId,
                label: layerLabels[layerId] ?? layerId,
                ids: [layerId],
                esGrupo: false,
                propiedades
              })
              setSelectedFeature(null)
              setActiveTab('info')
            }}
            onSelectFeature={(feat) => {
              setSelectedFeature(feat)
              if (feat) {
                setSelectedLayerInfo(null)
                setActiveTab('info')
              } else {
                setActiveTab('capas')
              }
            }}
            onOpenGuide={handleOpenGuide}
          />
          <MapLegend layers={legendLayers} styles={layerStyles} />
        </div>

        <GeovisorGuideOverlay isOpen={showGuide} onClose={handleCloseGuide} />
      </main>

      <Footer />
      <Underfooter />
    </div>
  )
}



