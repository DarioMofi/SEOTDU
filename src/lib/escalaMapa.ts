// Cálculos de la escala gráfica del geovisor. Puros: reciben números y
// devuelven números, sin depender de Leaflet, para reutilizarlos si el visor
// cambia de librería (MapLibre, ArcGIS).

/** Metros por pulgada a 96 ppp, la convención CSS (1 px = 0.2645833 mm) */
const METROS_POR_PIXEL_PANTALLA = 0.0254 / 96

/** Denominador de la escala numérica 1:N redondeado a cifras legibles */
export function denominadorEscala(metrosPorPixel: number): number {
  const n = metrosPorPixel / METROS_POR_PIXEL_PANTALLA
  const orden = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1)
  return Math.round(n / orden) * orden
}

/** Longitud «redonda» (1, 2 o 5 × 10^k m) que cabe en `maxPx` píxeles */
export function barraEscala(metrosPorPixel: number, maxPx = 120) {
  const maxM = metrosPorPixel * maxPx
  const potencia = 10 ** Math.floor(Math.log10(maxM))
  const paso = [5, 2, 1].map((f) => f * potencia).find((m) => m <= maxM) ?? potencia
  return {
    metros: paso,
    px: paso / metrosPorPixel,
    texto: paso >= 1000 ? `${(paso / 1000).toLocaleString('es-MX')} km` : `${paso} m`,
  }
}

/** Zona UTM (huso y banda de latitud) del punto. Campeche cae en 15Q y 16Q. */
export function zonaUTM(lat: number, lng: number): string {
  const huso = Math.floor((lng + 180) / 6) + 1
  const bandas = 'CDEFGHJKLMNPQRSTUVWX'
  const banda = bandas[Math.min(bandas.length - 1, Math.max(0, Math.floor((lat + 80) / 8)))]
  return `${huso}${banda}`
}
