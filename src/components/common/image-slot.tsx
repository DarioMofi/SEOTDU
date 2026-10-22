import { useState, type ReactNode } from 'react'

/**
 * Contenedor de imagen con respaldo.
 *
 * PROVISIONAL a propósito: las fotografías definitivas (con personas) aún no
 * existen. Cada espacio apunta a una ruta fija en `public/img/...`; en cuanto
 * se deja ahí un archivo con ese nombre, se muestra solo. Mientras falte, se
 * dibuja `fallback` y, en desarrollo, la ruta esperada para saber qué subir.
 */
interface ImageSlotProps {
  src: string
  alt: string
  className?: string
  fallback: ReactNode
  /** Leyenda superpuesta (pie de foto); se muestra con o sin imagen */
  caption?: ReactNode
}

export default function ImageSlot({ src, alt, className = '', fallback, caption }: ImageSlotProps) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className={`image-slot ${failed ? 'image-slot--empty' : ''} ${className}`}>
      {failed ? (
        <div className="image-slot__fallback" role="img" aria-label={alt}>
          {fallback}
          {import.meta.env.DEV && <span className="image-slot__hint">Pendiente: {src}</span>}
        </div>
      ) : (
        <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      )}
      {caption && <figcaption className="image-slot__caption">{caption}</figcaption>}
    </figure>
  )
}
