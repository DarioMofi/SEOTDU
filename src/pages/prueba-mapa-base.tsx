import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createSymbolResolver, usesPatternFill } from '../lib/qgisSymbology'
import { toPathOptions, toPointLayer } from '../lib/leafletSymbology'

/**
 * Banco de pruebas de la entrega nueva de cartografía.
 *
 * Dibuja Mapa Base leyendo `catalogo.json` + `JSON_SIMBOLOGIA/`, sin pasar por
 * `appConfig` ni por `available.json`. Es una vista desechable para comparar
 * contra el visor actual: no comparte estado con él y no lo afecta.
 *
 * Carga por peso ascendente y mide cada capa, porque Mapa Base son ~207 MB y
 * conviene ver dónde se rompe antes de decidir qué se enciende por defecto.
 */

const ESRI_CLARO =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'

/* Por debajo de esto se carga solo. El corte deja fuera las cuatro pesadas
   (cesc, cuerpos_agua, scince_manzana, red_regional_imt = 177 MB) para poder
   encenderlas una a una y ver cuanto cuesta cada una. */
const LIMITE_AUTOMATICO_MB = 20

const norm = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

interface CapaPrueba {
  id: string
  ruta: string
  mb: number | null
  estilo: any | null
  estado: 'pendiente' | 'cargando' | 'lista' | 'error'
  features?: number
  dibujados?: number
  ms?: number
  error?: string
}

export default function PruebaMapaBase() {
  const contenedor = useRef<HTMLDivElement>(null)
  const mapa = useRef<L.Map | null>(null)
  const dibujadas = useRef<Record<string, L.GeoJSON>>({})
  const [capas, setCapas] = useState<CapaPrueba[]>([])
  const [aviso, setAviso] = useState('Leyendo catálogo…')

  // Mapa base
  useEffect(() => {
    if (!contenedor.current || mapa.current) return
    const m = L.map(contenedor.current, { preferCanvas: true }).setView([19.0, -90.5], 7)
    L.tileLayer(ESRI_CLARO, { maxZoom: 19, maxNativeZoom: 16 }).addTo(m)
    mapa.current = m
    return () => {
      m.remove()
      mapa.current = null
    }
  }, [])

  // Catálogo + simbología + peso de cada archivo
  useEffect(() => {
    let vivo = true
    ;(async () => {
      const [catalogo, simbologia] = await Promise.all([
        fetch('/layers/catalogo.json').then((r) => r.json()),
        fetch('/estilos/JSON_SIMBOLOGIA/00_Mapa_Base.json').then((r) => r.json()),
      ])
      const estilos: Record<string, any> = {}
      for (const c of simbologia.capas) {
        estilos[norm(c.nombre_tabla ?? c.nombre)] = c.simbologia
      }

      const mapaBase = catalogo.mapas.find((m: any) => m.id === 'mapa_base')
      const lista: CapaPrueba[] = mapaBase.secciones.flatMap((s: any) =>
        s.capas.map((c: any) => ({
          id: c.id,
          ruta: `${catalogo.raiz}/${c.ruta}`,
          mb: null,
          estilo: estilos[norm(c.id)] ?? null,
          estado: 'pendiente' as const,
        })),
      )

      // El peso sale de una petición HEAD: evita descargar para poder ordenar.
      await Promise.all(
        lista.map(async (c) => {
          try {
            const r = await fetch(c.ruta, { method: 'HEAD' })
            const largo = r.headers.get('content-length')
            c.mb = largo ? Number(largo) / 1048576 : null
          } catch {
            c.mb = null
          }
        }),
      )
      lista.sort((a, b) => (a.mb ?? 0) - (b.mb ?? 0))
      if (!vivo) return
      setCapas(lista)
      setAviso(`${lista.length} capas en el catálogo`)
    })()
    return () => {
      vivo = false
    }
  }, [])

  const dibujar = async (capa: CapaPrueba) => {
    const m = mapa.current
    if (!m || dibujadas.current[capa.id]) return
    setCapas((prev) => prev.map((c) => (c.id === capa.id ? { ...c, estado: 'cargando' } : c)))
    const t0 = performance.now()
    try {
      const datos = await fetch(capa.ruta).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      const simboloDe = createSymbolResolver(capa.estilo)
      const opciones: L.GeoJSONOptions & { renderer?: L.Renderer } = {
        renderer: usesPatternFill(capa.estilo) ? L.svg() : undefined,
        filter: (f) => simboloDe(f?.properties) !== null,
        style: (f) => toPathOptions(simboloDe(f?.properties), 1),
        pointToLayer: (f, latlng) =>
          toPointLayer(simboloDe(f?.properties), latlng, 1) ??
          L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 }),
      }
      const capaLeaflet = L.geoJSON(datos, opciones).addTo(m)
      dibujadas.current[capa.id] = capaLeaflet
      // Leidos != dibujados: el `filter` descarta lo que QGIS no pintaria, y si
      // el estilo clasifica por un campo que el dato no tiene, se cae todo.
      const dibujados = capaLeaflet.getLayers().length
      setCapas((prev) =>
        prev.map((c) =>
          c.id === capa.id
            ? {
                ...c,
                estado: 'lista',
                features: datos.features?.length ?? 0,
                dibujados,
                ms: Math.round(performance.now() - t0),
              }
            : c,
        ),
      )
    } catch (e) {
      setCapas((prev) =>
        prev.map((c) =>
          c.id === capa.id ? { ...c, estado: 'error', error: String(e) } : c,
        ),
      )
    }
  }

  // Las ligeras se encienden solas, en orden, una tras otra.
  useEffect(() => {
    if (!capas.length) return
    ;(async () => {
      for (const c of capas) {
        if (c.estado === 'pendiente' && (c.mb ?? 999) < LIMITE_AUTOMATICO_MB) {
          await dibujar(c)
        }
      }
    })()
    // Se corre solo cuando cambia la cantidad de capas conocidas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capas.length])

  const listas = capas.filter((c) => c.estado === 'lista')
  const totalDibujados = listas.reduce((s, c) => s + (c.dibujados ?? 0), 0)
  const pesadas = capas.filter((c) => c.estado === 'pendiente')

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: 400, overflow: 'auto', padding: 16, background: '#f7f7f8', fontSize: 13 }}>
        <h1 style={{ fontSize: 16, margin: '0 0 4px' }}>Prueba · Mapa Base nuevo</h1>
        <p style={{ color: '#666', margin: '0 0 12px' }}>
          {aviso} · {listas.length} dibujadas · {totalDibujados.toLocaleString('es-MX')} dibujados
        </p>

        {pesadas.length > 0 && (
          <button
            onClick={() => pesadas.forEach(dibujar)}
            style={{ width: '100%', padding: '8px', marginBottom: 12, cursor: 'pointer' }}
          >
            Cargar las {pesadas.length} pesadas (
            {pesadas.reduce((s, c) => s + (c.mb ?? 0), 0).toFixed(0)} MB)
          </button>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {capas.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #e3e3e5' }}>
                <td style={{ padding: '5px 4px', wordBreak: 'break-all' }}>
                  <div style={{ color: c.estilo ? '#111' : '#b00' }}>{c.id}</div>
                  <div style={{ color: '#888', fontSize: 11 }}>
                    {c.mb != null ? `${c.mb.toFixed(1)} MB` : '—'}
                    {!c.estilo && ' · SIN ESTILO'}
                    {c.estado === 'lista' && (
                      <>
                        {' · '}
                        <span style={{ color: c.dibujados === 0 ? '#b00' : undefined }}>
                          {c.dibujados?.toLocaleString('es-MX')}/
                          {c.features?.toLocaleString('es-MX')} dibujados
                        </span>
                        {` · ${c.ms} ms`}
                      </>
                    )}
                    {c.estado === 'error' && ` · ${c.error}`}
                  </div>
                </td>
                <td style={{ padding: '5px 4px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {c.estado === 'pendiente' && (
                    <button onClick={() => dibujar(c)} style={{ cursor: 'pointer' }}>
                      cargar
                    </button>
                  )}
                  {c.estado === 'cargando' && <span style={{ color: '#888' }}>…</span>}
                  {c.estado === 'lista' && <span style={{ color: '#0a0' }}>✓</span>}
                  {c.estado === 'error' && <span style={{ color: '#b00' }}>✕</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
      <div ref={contenedor} style={{ flex: 1 }} />
    </div>
  )
}
