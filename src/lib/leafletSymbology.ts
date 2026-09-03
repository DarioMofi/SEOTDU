/**
 * Adaptador de `qgisSymbology` a Leaflet.
 *
 * Leaflet solo admite un relleno y un trazo por geometría vectorial, así que la
 * pila de QGIS se aplana para líneas y polígonos. En cambio los puntos sí
 * conservan la pila completa: se componen como un SVG dentro de un `divIcon`.
 */
import L from 'leaflet'
import type { MarkerShape, ResolvedSymbol, Rgba, Stroke, SymbolLayer } from './qgisSymbology'

// ── Patrones SVG reutilizables ────────────────────────────────────────────────
// Leaflet acepta `url(#id)` como fillColor si el patrón existe en el documento.

const injectedPatterns = new Set<string>()

function patternDefs(): SVGDefsElement {
  let svg = document.getElementById('qgis-svg-defs') as SVGSVGElement | null
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.id = 'qgis-svg-defs'
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden')
    svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'))
    document.body.insertBefore(svg, document.body.firstChild)
  }
  return svg.querySelector('defs')!
}

function slug(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

/** Trama de líneas paralelas equivalente a `QgsLinePatternFillSymbolLayer`. */
function hatchPattern(color: Rgba, angle: number, distance: number, width: number): string {
  const step = Math.max(distance, 2)
  const id = `hatch_${slug(color.css)}_${Math.round(angle)}_${Math.round(step * 10)}`
  if (injectedPatterns.has(id)) return `url(#${id})`

  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern')
  pattern.setAttribute('id', id)
  pattern.setAttribute('patternUnits', 'userSpaceOnUse')
  pattern.setAttribute('width', String(step))
  pattern.setAttribute('height', String(step))
  pattern.setAttribute('patternTransform', `rotate(${-angle})`)

  // Una línea vertical repetida y luego rotada cubre el tile sin costuras.
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', String(step / 2))
  line.setAttribute('y1', '0')
  line.setAttribute('x2', String(step / 2))
  line.setAttribute('y2', String(step))
  line.setAttribute('stroke', color.css)
  line.setAttribute('stroke-width', String(width))
  pattern.appendChild(line)

  patternDefs().appendChild(pattern)
  injectedPatterns.add(id)
  return `url(#${id})`
}

/** Mosaico de imagen equivalente a `QgsRasterFillSymbolLayer`. */
function imagePattern(image: string, width: number): string {
  const size = Math.max(width, 4)
  const id = `raster_${slug(image.slice(-24))}_${Math.round(size)}`
  if (injectedPatterns.has(id)) return `url(#${id})`

  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern')
  pattern.setAttribute('id', id)
  pattern.setAttribute('patternUnits', 'userSpaceOnUse')
  pattern.setAttribute('width', String(size))
  pattern.setAttribute('height', String(size))

  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  img.setAttribute('href', image)
  img.setAttribute('width', String(size))
  img.setAttribute('height', String(size))
  pattern.appendChild(img)

  patternDefs().appendChild(pattern)
  injectedPatterns.add(id)
  return `url(#${id})`
}

// ── Líneas y polígonos ────────────────────────────────────────────────────────

const HIDDEN: L.PathOptions = { stroke: false, fill: false, interactive: false }

/**
 * Aplana la pila a las opciones de trazo/relleno de Leaflet. La capa de relleno
 * que gana es la superior de la pila (la que QGIS dibuja encima).
 */
export function toPathOptions(symbol: ResolvedSymbol | null, userOpacity: number): L.PathOptions {
  if (!symbol) return HIDDEN

  const alpha = symbol.opacity * userOpacity

  // `L.geoJSON` aplica la opción `style` a *todas* las capas que tengan
  // `setStyle`, incluidos los circleMarker que devuelve `pointToLayer`. Si aquí
  // no se resolviera el símbolo de punto, Leaflet pisaría el marcador con
  // «sin relleno ni trazo» y el punto desaparecería. Los divIcon no sufren esto
  // porque L.Marker no tiene setStyle.
  const circle = asSimpleCircle(symbol)
  if (circle) return circleOptions(circle, alpha)
  let fillColor: string | null = null
  let fillAlpha = 0
  let stroke: Stroke | null = null

  for (const layer of symbol.layers) {
    switch (layer.kind) {
      case 'fill':
        if (layer.color) {
          fillColor = layer.color.css
          fillAlpha = layer.color.alpha
        }
        if (layer.outline) stroke = layer.outline
        break
      case 'patternFill':
        fillColor = hatchPattern(layer.color, layer.angle, layer.distance, layer.width)
        fillAlpha = layer.color.alpha
        break
      case 'rasterFill':
        fillColor = imagePattern(layer.image, layer.width)
        fillAlpha = layer.alpha
        break
      case 'line':
        stroke = layer.stroke
        break
    }
  }

  return {
    fill: fillColor !== null,
    fillColor: fillColor ?? 'transparent',
    fillOpacity: fillAlpha * alpha,
    stroke: stroke !== null,
    color: stroke?.color.css ?? 'transparent',
    weight: stroke?.width ?? 0,
    opacity: (stroke?.color.alpha ?? 0) * alpha,
    dashArray: stroke?.dashArray ?? undefined,
    lineCap: 'butt',
    lineJoin: 'round',
  }
}

// ── Puntos ────────────────────────────────────────────────────────────────────

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!
  )
}

function paint(color: Rgba | null, outline: Stroke | null): string {
  const fill = color ? `fill="${color.css}" fill-opacity="${color.alpha}"` : 'fill="none"'
  if (!outline) return `${fill} stroke="none"`
  return `${fill} stroke="${outline.color.css}" stroke-opacity="${outline.color.alpha}" stroke-width="${outline.width}"`
}

/** Vértices de un polígono regular con el primer vértice arriba. */
function polygonPoints(radius: number, sides: number, rotation = 0): string {
  const points: string[] = []
  for (let i = 0; i < sides; i++) {
    const theta = (i / sides) * 2 * Math.PI - Math.PI / 2 + (rotation * Math.PI) / 180
    points.push(`${(radius * Math.cos(theta)).toFixed(2)},${(radius * Math.sin(theta)).toFixed(2)}`)
  }
  return points.join(' ')
}

function starPoints(radius: number): string {
  const points: string[] = []
  // Proporción del pentagrama: el radio interior es 1/φ² del exterior.
  const inner = radius * 0.382
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : inner
    const theta = (i / 10) * 2 * Math.PI - Math.PI / 2
    points.push(`${(r * Math.cos(theta)).toFixed(2)},${(r * Math.sin(theta)).toFixed(2)}`)
  }
  return points.join(' ')
}

function shapeMarkup(shape: MarkerShape, size: number, style: string): string {
  const r = size / 2
  switch (shape) {
    case 'circle':
      return `<circle r="${r}" ${style}/>`
    case 'square':
      return `<rect x="${-r}" y="${-r}" width="${size}" height="${size}" ${style}/>`
    case 'diamond':
      return `<polygon points="${polygonPoints(r, 4)}" ${style}/>`
    case 'triangle':
      return `<polygon points="${polygonPoints(r, 3)}" ${style}/>`
    case 'pentagon':
      return `<polygon points="${polygonPoints(r, 5)}" ${style}/>`
    case 'hexagon':
      return `<polygon points="${polygonPoints(r, 6)}" ${style}/>`
    case 'octagon':
      return `<polygon points="${polygonPoints(r, 8)}" ${style}/>`
    case 'star':
      return `<polygon points="${starPoints(r)}" ${style}/>`
  }
}

/**
 * Equivalentes de la librería SVG que trae QGIS. El volcado solo guarda la ruta
 * absoluta del equipo del autor (`C:/PROGRA~1/QGIS…/svg/transport/…`), así que
 * se reconstruyen aquí indexadas por nombre de archivo.
 *
 * Cada entrada dibuja en una caja de 24×24 centrada en el origen y recibe el
 * color de QGIS, igual que hace el parámetro `param(fill)` de sus SVG.
 */
const QGIS_SVG_LIBRARY: Record<string, (fill: string, stroke: string, width: number) => string> = {
  'background_square_rounded.svg': (fill, stroke, width) =>
    `<rect x="1" y="1" width="22" height="22" rx="5" ry="5" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`,

  'transport_airport.svg': (fill, stroke, width) =>
    `<path fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" d="M12 2a1.2 1.2 0 0 0-1.2 1.2v6.8L3.2 13.5a.6.6 0 0 0 .3 1.1h7.3v4.8l-2 1.3a.6.6 0 0 0 .34 1.1h5.72a.6.6 0 0 0 .34-1.1l-2-1.3v-4.8h7.3a.6.6 0 0 0 .3-1.1l-7.6-3.5V3.2A1.2 1.2 0 0 0 12 2z"/>`,

  'transport_train_station2.svg': (fill, stroke, width) =>
    `<g fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round">` +
    `<rect x="5" y="3" width="14" height="15" rx="3.5" ry="3.5"/>` +
    `<rect x="7.5" y="6" width="9" height="5" rx="1.2" fill="${stroke}" stroke="none"/>` +
    `<circle cx="8.5" cy="14.5" r="1.2" fill="${stroke}" stroke="none"/>` +
    `<circle cx="15.5" cy="14.5" r="1.2" fill="${stroke}" stroke="none"/>` +
    `<path fill="none" stroke="${fill}" stroke-width="2" stroke-linecap="round" d="M7 18.5 L4.5 22 M17 18.5 L19.5 22"/>` +
    `</g>`,

  // Estación del Tren Maya. Es el trazo real del proyecto QGIS: el volcado lo
  // trae en base64 dentro del texto de una alerta en vez de en `props.name`,
  // así que se extrajo de ahí. Su lienzo original va de -14.839 a 0 en Y; el
  // transform lo lleva al cuadro de 24x24 que usan las demás entradas.
  'estacion_tren_maya.svg': (fill, stroke, width) =>
    `<g transform="scale(1.6188) translate(-0.019,14.839)" fill="${fill}" ` +
    `stroke="${stroke}" stroke-width="${width / 1.6188}" fill-rule="nonzero">` +
    `<path d="M14.839,-1.843 C14.8137,-1.58967 14.7662,-1.35533 14.6965,-1.14 C14.6268,-0.924667 14.5033,-0.722 14.326,-0.532 C13.984,-0.177333 13.5597,0 13.053,0 L1.862,0 C1.60867,0 1.37117,-0.0506667 1.1495,-0.152 C0.927833,-0.253333 0.734667,-0.386333 0.57,-0.551 C0.405333,-0.715667 0.272333,-0.908833 0.171,-1.1305 C0.0696667,-1.35217 0.019,-1.58967 0.019,-1.843 L0.019,-12.996 C0.019,-13.5407 0.202667,-13.9777 0.57,-14.307 C0.924667,-14.6617 1.35533,-14.839 1.862,-14.839 L13.053,-14.839 C13.5597,-14.839 13.9903,-14.6617 14.345,-14.307 C14.535,-14.1297 14.6648,-13.9333 14.7345,-13.718 C14.8042,-13.5027 14.839,-13.262 14.839,-12.996 L14.839,-1.843 M7.429,-13.186 C7.429,-13.3127 7.3815,-13.4172 7.2865,-13.4995 C7.1915,-13.5818 7.087,-13.623 6.973,-13.623 C6.859,-13.623 6.76083,-13.5818 6.6785,-13.4995 C6.59617,-13.4172 6.555,-13.3127 6.555,-13.186 C6.555,-13.0593 6.59617,-12.9548 6.6785,-12.8725 C6.76083,-12.7902 6.859,-12.749 6.973,-12.749 C7.087,-12.749 7.1915,-12.7902 7.2865,-12.8725 C7.3815,-12.9548 7.429,-13.0593 7.429,-13.186 M8.607,-13.186 C8.607,-13.3127 8.56583,-13.4172 8.4835,-13.4995 C8.40117,-13.5818 8.303,-13.623 8.189,-13.623 C8.04967,-13.623 7.942,-13.5818 7.866,-13.4995 C7.79,-13.4172 7.752,-13.3127 7.752,-13.186 C7.752,-13.0593 7.79,-12.9548 7.866,-12.8725 C7.942,-12.7902 8.04967,-12.749 8.189,-12.749 C8.303,-12.749 8.40117,-12.7902 8.4835,-12.8725 C8.56583,-12.9548 8.607,-13.0593 8.607,-13.186 M8.626,-11.552 C8.626,-11.4253 8.56267,-11.362 8.436,-11.362 L6.745,-11.362 C6.64367,-11.362 6.593,-11.4253 6.593,-11.552 L6.593,-12.122 C6.593,-12.236 6.64367,-12.293 6.745,-12.293 L8.436,-12.293 C8.56267,-12.293 8.626,-12.236 8.626,-12.122 L8.626,-11.552 M10.222,-9.253 C10.222,-9.05033 10.1555,-8.88567 10.0225,-8.759 C9.8895,-8.63233 9.72167,-8.569 9.519,-8.569 L5.681,-8.569 C5.47833,-8.569 5.31367,-8.63233 5.187,-8.759 C5.06033,-8.88567 4.997,-9.05033 4.997,-9.253 L4.997,-10.374 C4.997,-10.5767 5.06033,-10.7413 5.187,-10.868 C5.31367,-10.9947 5.47833,-11.058 5.681,-11.058 L9.519,-11.058 C9.72167,-11.058 9.8895,-10.9947 10.0225,-10.868 C10.1555,-10.7413 10.222,-10.5767 10.222,-10.374 L10.222,-9.253 M10.241,-5.7 C10.241,-5.244 10.013,-5.016 9.557,-5.016 C9.37967,-5.016 9.22767,-5.07617 9.101,-5.1965 C8.97433,-5.31683 8.911,-5.48467 8.911,-5.7 C8.911,-5.87733 8.97433,-6.0325 9.101,-6.1655 C9.22767,-6.2985 9.37967,-6.365 9.557,-6.365 C9.77233,-6.365 9.94017,-6.2985 10.0605,-6.1655 C10.1808,-6.0325 10.241,-5.87733 10.241,-5.7 M6.289,-5.7 C6.289,-5.48467 6.22567,-5.31683 6.099,-5.1965 C5.97233,-5.07617 5.82033,-5.016 5.643,-5.016 C5.44033,-5.016 5.27567,-5.07617 5.149,-5.1965 C5.02233,-5.31683 4.959,-5.48467 4.959,-5.7 C4.959,-5.87733 5.02233,-6.0325 5.149,-6.1655 C5.27567,-6.2985 5.44033,-6.365 5.643,-6.365 C5.82033,-6.365 5.97233,-6.2985 6.099,-6.1655 C6.22567,-6.0325 6.289,-5.87733 6.289,-5.7 M9.861,-4.313 C10.2157,-4.37633 10.5102,-4.541 10.7445,-4.807 C10.9788,-5.073 11.096,-5.38967 11.096,-5.757 L11.096,-11.096 C11.096,-11.5013 10.9535,-11.8433 10.6685,-12.122 C10.3835,-12.4007 10.0383,-12.54 9.633,-12.54 L5.586,-12.54 C5.168,-12.54 4.81967,-12.4007 4.541,-12.122 C4.26233,-11.8433 4.123,-11.5013 4.123,-11.096 L4.123,-5.757 C4.123,-5.38967 4.24333,-5.06983 4.484,-4.7975 C4.72467,-4.52517 5.00967,-4.36367 5.339,-4.313 L3.496,-1.577 L4.541,-1.577 L5.795,-3.439 L9.405,-3.439 L10.659,-1.577 L11.704,-1.577 L9.861,-4.313"/></g>`,

  'amenity=ferry_terminal.svg': (fill, stroke, width) =>
    `<g fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round">` +
    `<path d="M12 2a1 1 0 0 1 1 1v1.5h1.5a1 1 0 0 1 1 1V7h1.5a1 1 0 0 1 1 1v1.8l-1.2 5.2a2 2 0 0 1-1.9 1.5H8.1a2 2 0 0 1-1.9-1.5L5 9.8V8a1 1 0 0 1 1-1H7.5V5.5a1 1 0 0 1 1-1H10V3a1 1 0 0 1 1-1z"/>` +
    `<path fill="none" stroke="${fill}" stroke-width="1.8" stroke-linecap="round" d="M3 18c1.5 0 2.5-.8 4-.8s2.5.8 4 .8 2.5-.8 4-.8 2.5.8 4 .8"/>` +
    `<path fill="none" stroke="${fill}" stroke-width="1.8" stroke-linecap="round" d="M3 21c1.5 0 2.5-.8 4-.8s2.5.8 4 .8 2.5-.8 4-.8 2.5.8 4 .8"/>` +
    `</g>`,
}

/**
 * Equivalentes de los glifos de las fuentes de símbolos de ESRI, indexados por
 * `fuente|carácter`.
 *
 * Esas fuentes son propietarias y no están en el navegador, así que el
 * pictograma se reconstruye a mano —igual que `QGIS_SVG_LIBRARY`— tomando como
 * referencia la leyenda del proyecto QGIS. Son reconstrucciones, no la fuente
 * original: si el equipo de cartografía cambia los marcadores de fuente por
 * marcadores SVG, esta tabla sobra.
 *
 * QGIS suele apilar dos glifos: uno claro que hace de fondo y otro de color
 * encima. Por eso cada carácter se dibuja por separado y el orden de la pila
 * los compone.
 *
 * Cada entrada dibuja en una caja de 24×24 centrada en el origen.
 */
const QGIS_GLYPH_LIBRARY: Record<string, (fill: string) => string> = {
  // Planta de tratamiento de aguas residuales: triángulo.
  'ESRI Enviro Hazard Analysis|`': (fill) =>
    `<polygon points="0,-9.5 9,6.5 -9,6.5" fill="${fill}"/>`,
  'ESRI Enviro Hazard Analysis|_': (fill) =>
    `<polygon points="0,-9.5 9,6.5 -9,6.5" fill="none" stroke="${fill}" stroke-width="2.4" stroke-linejoin="round"/>`,

  // Transporte de carga: disco con «T».
  'ESRI Hazardous Materials|Ñ': (fill) => `<circle r="9.5" fill="${fill}"/>`,
  'ESRI Hazardous Materials|Ö': (fill) =>
    `<g fill="none" stroke="${fill}" stroke-width="2.2"><circle r="8.6"/></g>` +
    `<text y="0.5" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="700" fill="${fill}">T</text>`,

  // Manejo integral de residuos sólidos: disco con «R».
  'ESRI Hazardous Materials|Ã': (fill) =>
    `<circle r="9" fill="#ffffff" stroke="${fill}" stroke-width="2.2"/>` +
    `<text y="0.5" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="700" fill="${fill}">R</text>`,

  // Planta de biocombustible: disco con «B».
  'ESRI Enviro Hazard Incident|"': (fill) =>
    `<circle r="9.5" fill="${fill}" stroke="#8a7a2a" stroke-width="1"/>`,
  'ESRI Enviro Hazard Incident|#': (fill) =>
    `<text y="0.5" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="13" font-weight="700" fill="${fill}">B</text>`,

  // Anillo. Lo comparten el corredor de conectividad (rosa) y los núcleos
  // lecheros (verde); en ambas leyendas de QGIS se ve igual, lo que confirma
  // que el glifo es el mismo y solo cambia el color.
  'ESRI Surveyor|/': (fill) =>
    `<circle r="8" fill="none" stroke="${fill}" stroke-width="3"/>`,

  // Infraestructura de producción de arroz: anillo con cruz inscrita.
  'ESRI Surveyor|>': (fill) =>
    `<g fill="none" stroke="${fill}" stroke-width="2.2">` +
    `<circle r="8"/><path d="M-8,0 H8 M0,-8 V8"/></g>`,

  // Parque industrial textil: la lanzadera se insinúa con un rombo alargado.
  'ESRI IGL Font23|X': (fill) =>
    `<polygon points="0,-8 4.5,0 0,8 -4.5,0" fill="${fill}"/>`,
}

function markerLayerMarkup(layer: SymbolLayer): string {
  switch (layer.kind) {
    case 'shapeMarker':
      return shapeMarkup(layer.shape, layer.size, paint(layer.color, layer.outline))

    case 'svgMarker': {
      const draw = QGIS_SVG_LIBRARY[layer.svg]
      const fill = layer.color?.css ?? '#3b82f6'
      if (!draw) {
        // SVG de QGIS que no tenemos: un disco del color declarado deja el punto
        // visible y con el color correcto en vez de desaparecer.
        return shapeMarkup('circle', layer.size, paint(layer.color, layer.outline))
      }
      const scale = layer.size / 24
      const stroke = layer.outline?.color.css ?? '#ffffff'
      const width = (layer.outline?.width ?? 0.5) / scale
      return `<g transform="scale(${scale}) translate(-12,-12)">${draw(fill, stroke, width)}</g>`
    }

    case 'glyphMarker': {
      const fill = layer.color?.css ?? '#3b82f6'

      // Pictograma reconstruido a mano cuando lo tenemos catalogado.
      const draw = layer.char ? QGIS_GLYPH_LIBRARY[`${layer.font}|${layer.char}`] : undefined
      if (draw) {
        const scale = layer.size / 24
        return `<g transform="scale(${scale})">${draw(fill)}</g>`
      }

      // Glifo sin catalogar: un disco del color correcto deja el punto legible.
      // Se declara la familia por si el usuario tiene instalada la fuente ESRI,
      // en cuyo caso el carácter se dibuja tal cual encima.
      const disc = `<circle r="${layer.size / 2}" fill="${fill}" fill-opacity="${layer.color?.alpha ?? 1}" stroke="#ffffff" stroke-width="1"/>`
      if (!layer.char) return disc
      const glyph =
        `<text x="0" y="0" text-anchor="middle" dominant-baseline="central"` +
        ` font-family="${escapeXml(layer.font)}" font-size="${layer.size * 0.7}"` +
        ` fill="#ffffff">${escapeXml(layer.char)}</text>`
      return disc + glyph
    }

    case 'rasterMarker':
      return (
        `<image href="${layer.image}" x="${-layer.size / 2}" y="${-layer.size / 2}"` +
        ` width="${layer.size}" height="${layer.size}" opacity="${layer.alpha}"/>`
      )

    default:
      return ''
  }
}

function markerExtent(layer: SymbolLayer): number {
  switch (layer.kind) {
    case 'shapeMarker':
    case 'svgMarker':
    case 'glyphMarker':
    case 'rasterMarker': {
      const outlineWidth = 'outline' in layer ? (layer.outline?.width ?? 0) : 0
      const reach = layer.size / 2 + outlineWidth
      return Math.max(reach + Math.abs(layer.offset.x), reach + Math.abs(layer.offset.y))
    }
    default:
      return 0
  }
}

/** Opciones de Leaflet para un marcador circular simple. */
function circleOptions(
  circle: Extract<SymbolLayer, { kind: 'shapeMarker' }>,
  alpha: number
): L.CircleMarkerOptions {
  return {
    radius: circle.size / 2,
    fill: circle.color !== null,
    fillColor: circle.color?.css ?? 'transparent',
    fillOpacity: (circle.color?.alpha ?? 0) * alpha,
    stroke: circle.outline !== null,
    color: circle.outline?.color.css ?? 'transparent',
    weight: circle.outline?.width ?? 0,
    opacity: (circle.outline?.color.alpha ?? 0) * alpha,
  }
}

/** Un solo círculo sin rotación ni desplazamiento se dibuja como vector nativo. */
function asSimpleCircle(symbol: ResolvedSymbol): Extract<SymbolLayer, { kind: 'shapeMarker' }> | null {
  if (symbol.layers.length !== 1) return null
  const [layer] = symbol.layers
  if (layer.kind !== 'shapeMarker' || layer.shape !== 'circle') return null
  if (layer.angle !== 0 || layer.offset.x !== 0 || layer.offset.y !== 0) return null
  return layer
}

/**
 * Compone la pila de un punto como SVG dentro de una caja cuadrada, devuelta
 * junto al contenido para que quien llama la centre o la escale.
 */
function composeMarkerSvg(symbol: ResolvedSymbol): { body: string; box: number } {
  const extent = Math.max(...symbol.layers.map(markerExtent), 4)
  const box = Math.ceil(extent * 2)
  const center = box / 2

  const body = symbol.layers
    .map((layer) => {
      const markup = markerLayerMarkup(layer)
      if (!markup) return ''
      const offset = 'offset' in layer ? layer.offset : { x: 0, y: 0 }
      const angle = 'angle' in layer ? layer.angle : 0
      // QGIS mide el ángulo en sentido antihorario; SVG, horario.
      const rotate = angle ? ` rotate(${-angle})` : ''
      return `<g transform="translate(${center + offset.x},${center + offset.y})${rotate}">${markup}</g>`
    })
    .join('')

  return { body, box }
}

/**
 * Construye la representación de un punto. Devuelve `null` cuando QGIS no lo
 * dibujaría, para que quien llama pueda omitir el elemento por completo.
 */
export function toPointLayer(
  symbol: ResolvedSymbol | null,
  latlng: L.LatLng,
  userOpacity: number
): L.Layer | null {
  if (!symbol) return null
  const alpha = symbol.opacity * userOpacity

  const circle = asSimpleCircle(symbol)
  if (circle) return L.circleMarker(latlng, circleOptions(circle, alpha))

  const { body, box } = composeMarkerSvg(symbol)
  const center = box / 2

  // Un símbolo sin capas de marcador no dibuja nada como punto. Pasa cuando una
  // capa de líneas o polígonos trae un `GeometryCollection` con puntos dentro:
  // Leaflet los manda a `pointToLayer` con el símbolo de la capa. Devolver
  // `null` deja que quien llama los omita en vez de crear un icono vacío.
  if (!body) return null

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}"` +
    ` viewBox="0 0 ${box} ${box}">${body}</svg>`

  // La opacidad va en el marcador, no en el SVG, para que `setOpacity` la pueda
  // actualizar después sin recomponer el icono ni multiplicarse consigo misma.
  return L.marker(latlng, {
    opacity: alpha,
    icon: L.divIcon({
      html: svg,
      className: 'qgis-marker',
      iconSize: [box, box],
      iconAnchor: [center, center],
      popupAnchor: [0, -center],
    }),
  })
}

// ── Muestras de leyenda ───────────────────────────────────────────────────────

/**
 * Dibuja la muestra de un símbolo para la leyenda, como cadena SVG.
 *
 * Reutiliza a propósito las mismas rutinas que pintan el mapa —`toPathOptions`
 * para líneas y polígonos, la pila de marcadores para puntos— porque una leyenda
 * que se calcula aparte es una leyenda que tarde o temprano miente.
 *
 * Devuelve `null` cuando no hay nada que dibujar.
 */
export function toSwatchSvg(
  symbol: ResolvedSymbol | null,
  width = 26,
  height = 16
): string | null {
  if (!symbol) return null

  const wrap = (content: string) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"` +
    ` viewBox="0 0 ${width} ${height}" aria-hidden="true">${content}</svg>`

  if (symbol.geometry === 'point') {
    const { body, box } = composeMarkerSvg(symbol)
    if (!body) return null
    // El marcador se compone a su tamaño real y solo se reduce si no cabe: un
    // punto de 6 px debe verse más chico que uno de 14 px, igual que en el mapa.
    const scale = Math.min(1, (Math.min(width, height) - 2) / box)
    return wrap(
      `<g opacity="${symbol.opacity}" transform="translate(${width / 2},${height / 2})` +
        ` scale(${scale}) translate(${-box / 2},${-box / 2})">${body}</g>`
    )
  }

  const opts = toPathOptions(symbol, 1)
  if (!opts.fill && !opts.stroke) return null
  const dash = opts.dashArray ? ` stroke-dasharray="${opts.dashArray}"` : ''

  if (symbol.geometry === 'line') {
    // Los anchos de carretera desbordarían la muestra; se topan a su alto.
    const weight = Math.min(opts.weight ?? 1, height - 4)
    return wrap(
      `<line x1="1" y1="${height / 2}" x2="${width - 1}" y2="${height / 2}"` +
        ` stroke="${opts.color}" stroke-opacity="${opts.opacity}" stroke-width="${weight}"${dash}/>`
    )
  }

  // Polígono y geometría desconocida: un rectángulo muestra relleno y contorno.
  const weight = Math.min(opts.weight ?? 1, 3)
  return wrap(
    `<rect x="${weight / 2}" y="${weight / 2}" width="${width - weight}" height="${height - weight}" rx="2"` +
      ` fill="${opts.fill ? opts.fillColor : 'none'}" fill-opacity="${opts.fillOpacity}"` +
      ` stroke="${opts.stroke ? opts.color : 'none'}" stroke-opacity="${opts.opacity}"` +
      ` stroke-width="${weight}"${dash}/>`
  )
}
