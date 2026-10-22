import type { ReactNode } from 'react'
import { Building2, Fish, Wheat, Beef, TreePalm, Construction } from 'lucide-react'
import ImageSlot from '../common/image-slot'

/* Mosaico de actividades productivas. Fotografías pendientes: cada espacio
   espera su archivo en public/img/actividades/<id>.jpg (ver ImageSlot). */

const ACTIVIDADES: { id: string; label: string; alt: string; icono: ReactNode }[] = [
  { id: 'ciudad', label: 'Ciudad', alt: 'Vida urbana en una ciudad de Campeche', icono: <Building2 /> },
  { id: 'pesca', label: 'Pesca', alt: 'Pescadores en la costa de Campeche', icono: <Fish /> },
  { id: 'agricultura', label: 'Agrícola', alt: 'Personas trabajando en campos de cultivo', icono: <Wheat /> },
  { id: 'ganaderia', label: 'Ganadera', alt: 'Productores ganaderos en un rancho campechano', icono: <Beef /> },
  { id: 'turismo', label: 'Turismo', alt: 'Visitantes en un sitio turístico de Campeche', icono: <TreePalm /> },
  { id: 'infraestructura', label: 'Infraestructura', alt: 'Trabajadores en una obra de infraestructura', icono: <Construction /> },
]

export default function MosaicoActividades() {
  return (
    <div className="mosaico-actividades" role="list" aria-label="Actividades productivas del territorio">
      {ACTIVIDADES.map((a) => (
        <div key={a.id} role="listitem" className="mosaico-actividades__item">
          <ImageSlot
            src={`/img/actividades/${a.id}.jpg`}
            alt={a.alt}
            fallback={<div className="mosaico-actividades__fallback" aria-hidden="true">{a.icono}</div>}
            caption={a.label}
          />
        </div>
      ))}
    </div>
  )
}
