import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Underfooter from '../components/Underfooter'
import MapViewer from '../components/Geovisor/MapViewer'
import SidebarControl from '../components/Geovisor/SidebarControl'
import ModuleLayerSelector from '../components/Geovisor/ModuleLayerSelector'
import MapLegend from '../components/Geovisor/MapLegend'
import { MunicipioProperties } from '../data/campecheData'

const CAPAS_POR_DEFECTO: Record<string, string[]> = {
  ambiental: ['anp', 'manglares'],
  social: ['poblacion'],
  infraestructura: ['linea-trans', 'via-ferrea', 'educacion'],
  aptitud: ['zonificacion']
}

export default function Geovisor() {
  const [searchParams] = useSearchParams()
  const moduloInicial = searchParams.get('modulo') || 'ambiental'

  // Hacer scroll hacia arriba al cargar la página
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const [activeLayers, setActiveLayers] = useState<string[]>(() => {
    return CAPAS_POR_DEFECTO[moduloInicial] || CAPAS_POR_DEFECTO.ambiental
  })
  const [selectedFeature, setSelectedFeature] = useState<MunicipioProperties | null>(null)
  const [activeTab, setActiveTab] = useState<'capas' | 'info'>('capas')
  const [layerOpacity, setLayerOpacity] = useState<Record<string, number>>({})
  const [layerOrder, setLayerOrder] = useState<string[]>(() => {
    return CAPAS_POR_DEFECTO[moduloInicial] || CAPAS_POR_DEFECTO.ambiental
  })

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayerOpacity((prev) => ({ ...prev, [layerId]: opacity }))
  }

  return (
    <div className="page-shell">
      <Header />
      <Navbar />

      <main id="main-content" className="geovisor-layout">
        <SidebarControl
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          selectedFeature={selectedFeature}
          onSelectFeature={setSelectedFeature}
        >
          <ModuleLayerSelector
            activeLayers={activeLayers}
            onChangeLayers={setActiveLayers}
            initialModule={moduloInicial}
            layerOpacity={layerOpacity}
            onChangeOpacity={handleOpacityChange}
            layerOrder={layerOrder}
            onChangeOrder={setLayerOrder}
          />
        </SidebarControl>

        <div className="flex-1 relative h-full">
          <MapViewer
            activeLayers={activeLayers}
            selectedFeature={selectedFeature}
            layerOpacity={layerOpacity}
            layerOrder={layerOrder}
            onSelectFeature={(feat) => {
              setSelectedFeature(feat)
              if (feat) {
                setActiveTab('info')
              } else {
                setActiveTab('capas')
              }
            }}
          />
          <MapLegend activeLayers={activeLayers} />
        </div>
      </main>

      <Footer />
      <Underfooter />
    </div>
  )
}


