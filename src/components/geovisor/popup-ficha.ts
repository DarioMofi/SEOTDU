import { esManzana, nombreElemento, poblacionElemento, separarFicha, type FilaFicha } from '../../lib/textoLegible'

/* Ventana emergente (popup) de un elemento del mapa: encabezado con nombre y
   población y, debajo, solo la información específica (el resto de atributos
   con su nombre completo). Se pidió así: la pestaña de información básica
   repetía lo que ya dice el encabezado. Se arma como DOM y no como JSX porque
   Leaflet la monta fuera de React. */

function escapar(t: string) {
  return t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function tabla(filas: FilaFicha[]) {
  if (filas.length === 0) return '<p class="ficha-popup__vacio">Sin atributos adicionales.</p>'
  return `<dl class="ficha-popup__tabla">${filas
    .map((f) => `<dt>${escapar(f.etiqueta)}</dt><dd>${escapar(f.valor)}</dd>`)
    .join('')}</dl>`
}

let contador = 0

export function crearPopupFicha(
  nombreCapa: string,
  props: Record<string, unknown>,
  onVerFicha?: () => void,
): HTMLElement {
  const id = `ficha-${++contador}`
  // Solo la información específica: nombre y población ya van en el encabezado
  const { especifica } = separarFicha(props)
  const nombre = nombreElemento(props)
  const poblacion = poblacionElemento(props)
  const titulo = esManzana(props)
    ? `Manzana${nombre ? ` de ${nombre}` : ''}`
    : nombre ?? nombreCapa

  const el = document.createElement('div')
  el.className = 'ficha-popup'
  el.innerHTML = `
    <header class="ficha-popup__header">
      <span class="ficha-popup__capa">${escapar(nombreCapa)}</span>
      <strong class="ficha-popup__titulo">${escapar(titulo)}</strong>
      ${poblacion !== null ? `<span class="ficha-popup__pob">${poblacion.toLocaleString('es-MX')} habitantes</span>` : ''}
    </header>
    <h4 class="ficha-popup__seccion" id="${id}-e">Información específica</h4>
    <div class="ficha-popup__panel" aria-labelledby="${id}-e">${tabla(especifica)}</div>
    ${onVerFicha ? '<button type="button" class="ficha-popup__mas">Ver ficha técnica de la capa →</button>' : ''}
  `

  el.querySelector('.ficha-popup__mas')?.addEventListener('click', () => onVerFicha?.())
  return el
}

/** Contenido breve del tooltip al pasar el cursor sobre una manzana */
export function contenidoTooltipManzana(props: Record<string, unknown>): string {
  const nombre = nombreElemento(props)
  const pob = poblacionElemento(props)
  const muj = typeof props.pob42 === 'number' && props.pob42 >= 0 ? props.pob42 : null
  const hom = typeof props.pob84 === 'number' && props.pob84 >= 0 ? props.pob84 : null
  const viv = typeof props.viv1 === 'number' && props.viv1 >= 0 ? props.viv1 : null
  return `
    <strong>Manzana${nombre ? ` · ${escapar(nombre)}` : ''}</strong>
    <span>Población total: <b>${pob !== null ? pob.toLocaleString('es-MX') : 'Dato reservado'}</b></span>
    ${muj !== null && hom !== null ? `<span>Mujeres ${muj.toLocaleString('es-MX')} · Hombres ${hom.toLocaleString('es-MX')}</span>` : ''}
    ${viv !== null ? `<span>Viviendas habitadas: ${viv.toLocaleString('es-MX')}</span>` : ''}
    <em>Clic para ver la ficha completa</em>
  `
}
