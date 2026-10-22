import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronUp, ChevronDown, MousePointerClick } from 'lucide-react'
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
import PanelCapa from '../components/geovisor/panel-capa'
import DiagramaParadigma from '../components/common/diagrama-paradigma'
import { SUBSISTEMAS, moduloDeSubsistema, type SubsistemaId, type Vista } from '../data/paradigmaPeotdu'
import { getCompletitudCapas, tieneContenido, type CompletitudCapa, type VistaCapa } from '../lib/datosPrograma'
import { norm } from '../lib/cartografia'

export default function Geovisor() {
  const [searchParams] = useSearchParams()
  const moduloInicial = searchParams.get('modulo') || appConfig.DEFAULT_MODULE
  const navigate = useNavigate()

  // ─── Diagrama radial: filtro maestro de monitores ───────────────────────
  // El subsistema elegido activa su monitor; la vista alterna entre Desempeño
  // (diagnóstico 2024) y Estrategia territorial (estrategias y proyectos).
  const subsistemaDe = (modulo: string) => SUBSISTEMAS.find((s) => s.modulo === modulo)?.id ?? null
  // URL: ?modulo=…&vista=desempeno|estrategia&subsistema=…&capa=… o &capas=a,b,c
  const subsistemaPedido = SUBSISTEMAS.find((s) => s.id === searchParams.get('subsistema'))?.id
  const vistaPedida = searchParams.get('vista')
  const [subsistema, setSubsistema] = useState<SubsistemaId | null>(subsistemaPedido ?? subsistemaDe(moduloInicial))
  const [vista, setVistaEstado] = useState<Vista>(
    vistaPedida === 'desempeno' || vistaPedida === 'estrategia' ? vistaPedida : searchParams.get('capa') ? 'estrategia' : 'desempeno'
  )
  const [moduloSolicitado, setModuloSolicitado] = useState<{ id: string; n: number } | null>(null)
  const [diagramaAbierto, setDiagramaAbierto] = useState(true)
  const elegirSubsistema = (id: SubsistemaId) => {
    const sub = SUBSISTEMAS.find((s) => s.id === id)
    if (!sub) return
    setSubsistema(id)
    setModuloSolicitado((prev) => ({ id: moduloDeSubsistema(sub, vista), n: (prev?.n ?? 0) + 1 }))
  }
  // Al cambiar de vista, un subsistema cuyos insumos viven en otro monitor
  // (Institucionalidad: Social en Desempeño, MOT en Estrategia) cambia de módulo.
  const setVista = (v: Vista) => {
    setVistaEstado(v)
    const sub = SUBSISTEMAS.find((s) => s.id === subsistema)
    if (sub && moduloDeSubsistema(sub, v) !== moduloDeSubsistema(sub, vista)) {
      setModuloSolicitado((prev) => ({ id: moduloDeSubsistema(sub, v), n: (prev?.n ?? 0) + 1 }))
    }
  }

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

  // ─── Panel de estrategia e indicadores ─────────────────────────────────
  // Se abre solo cuando el usuario consulta un elemento en el mapa (clic) de
  // una capa con fila en Estrategia-indicadores o proyecto en seguimiento.
  // Encender una capa, o llegar desde un proyecto, no lo abre: así se pidió.
  const [capaEstrategia, setCapaEstrategia] = useState<string | null>(null)
  // Pestañas del panel con contenido por capa: decide si el panel se abre y
  // alimenta la marca N·A·E de la lista de capas.
  const [completitud, setCompletitud] = useState<Map<string, CompletitudCapa>>(new Map())
  // Rama de cada capa (Desempeño / Estrategia), leída del árbol de capas
  const [vistasCapas, setVistasCapas] = useState<Map<string, VistaCapa>>(new Map())
  const hayPanel = (id: string) => tieneContenido(completitud.get(norm(id)), vistasCapas.get(norm(id)))
  const capaPedida = searchParams.get('capas')?.split(',').filter(Boolean) ?? searchParams.get('capa')

  useEffect(() => {
    getCompletitudCapas().then(setCompletitud)
  }, [])

  useEffect(() => {
    // Si se apaga la capa consultada, el panel se cierra con ella
    if (capaEstrategia && !activeLayers.includes(capaEstrategia)) setCapaEstrategia(null)
  }, [activeLayers]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <section className={`geovisor-paradigma ${diagramaAbierto ? '' : 'is-plegado'}`} aria-label="Filtro por subsistema y vista">
            <button type="button" className="geovisor-paradigma__toggle" onClick={() => setDiagramaAbierto((v) => !v)} aria-expanded={diagramaAbierto}>
              <span className="geovisor-paradigma__titulo">
                Paradigma del PEOTDU
                <span className="geovisor-paradigma__interactivo"><MousePointerClick className="w-3 h-3" aria-hidden="true" /> Interactivo</span>
              </span>
              {diagramaAbierto ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
            </button>
            {diagramaAbierto && (
              <DiagramaParadigma
                modo="control"
                seleccionado={subsistema}
                onSeleccionar={elegirSubsistema}
                vista={vista}
                onVista={setVista}
              />
            )}
          </section>
          <ModuleLayerSelector
            moduloSolicitado={moduloSolicitado}
            onVistaDetectada={setVistaEstado}
            vista={vista}
            onModuloActivo={(id) => {
              // Si el monitor cambió desde la lista, el diagrama lo sigue
              const actual = SUBSISTEMAS.find((s) => s.id === subsistema)
              if (!actual || moduloDeSubsistema(actual, vista) !== id) setSubsistema(subsistemaDe(id))
            }}
            activeLayers={activeLayers}
            onChangeLayers={setActiveLayers}
            initialModule={moduloInicial}
            initialLayer={capaPedida}
            // Sin vista ni capa en la URL se entra en Desempeño: no se detecta
            // la vista por las capas por omisión (casi todas son de estrategia).
            vistaInicial={vistaPedida === 'desempeno' || vistaPedida === 'estrategia' ? vistaPedida : capaPedida ? undefined : 'desempeno'}
            layerOpacity={layerOpacity}
            onChangeOpacity={handleOpacityChange}
            layerOrder={layerOrder}
            onChangeOrder={setLayerOrder}
            onStylesLoaded={(styles, labels) => {
              setLayerStyles(styles)
              setLayerLabels(labels)
            }}
            onInfoClick={(info) => {
              // El botón de información es una selección explícita de la capa:
              // abre también su panel de narrativa / analítica.
              const id = info.ids?.[0]
              if (id && hayPanel(id)) setCapaEstrategia(id)
              setSelectedLayerInfo(info)
              setSelectedFeature(null)
              setActiveTab('info')
            }}
            onActiveModuleChange={setActiveModuleTitle}
            completitud={completitud}
            onVistasCapas={setVistasCapas}
          />
        </SidebarControl>

        <div className={`flex-1 relative h-full ${capaEstrategia ? 'con-panel-capa' : ''}`}>
          {/* Salida clara a la vista general */}
          <button type="button" className="geovisor-volver" onClick={() => navigate('/#monitores')}>
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver a los Monitores
          </button>
          <MapViewer
            activeLayers={activeLayers}
            selectedFeature={selectedFeature}
            layerOpacity={layerOpacity}
            layerStyles={layerStyles}
            layerOrder={layerOrder}
            layerLabels={layerLabels}
            leyenda={<MapLegend layers={legendLayers} styles={layerStyles} />}
            onElementSelect={(layerId) => {
              if (hayPanel(layerId)) setCapaEstrategia(layerId)
            }}
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
          <PanelCapa
            layerId={capaEstrategia}
            layerLabel={capaEstrategia ? layerLabels[capaEstrategia] : undefined}
            vista={capaEstrategia ? vistasCapas.get(norm(capaEstrategia)) : undefined}
            onClose={() => setCapaEstrategia(null)}
          />
        </div>

        <GeovisorGuideOverlay isOpen={showGuide} onClose={handleCloseGuide} />
      </main>

      <Footer />
      <Underfooter />
    </div>
  )
}



