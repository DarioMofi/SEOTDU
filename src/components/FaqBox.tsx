import { useState } from 'react'

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: '¿Cómo puedo consultar los instrumentos de planeación?',
    answer:
      'Puede acceder al Catálogo de instrumentos desde el menú superior o mediante el botón "Consultar Catálogo" en la sección principal. Encontrará planes de desarrollo, programas de ordenamiento ecológico, normas territoriales y más.',
  },
    {
    id: 'faq-2',
    question: '¿Cómo accedo al Geovisor Interactivo del territorio?',
    answer:
      'Puede acceder al Geovisor desde la pestaña "Geovisor" en el menú principal o mediante el botón "Abrir Geovisor" en la sección de inicio. Permite visualizar capas temáticas del territorio campechano.',
  },
  {
    id: 'faq-3',
    question: '¿Qué tipo de documentos puedo encontrar en el catálogo?',
    answer:
      'El catálogo incluye planes de desarrollo, programas de ordenamiento ecológico, normas territoriales, estudios de aptitud del suelo, planes parciales de desarrollo urbano y demás instrumentos de planeación regional y municipal.',
  },

]

export default function FaqBox() {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  const toggle = (id: string) => setOpenId(openId === id ? null : id)

  return (
    <aside className="faq-box" aria-label="Preguntas frecuentes">
      <h2 className="faq-box__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Preguntas Frecuentes
      </h2>

      <dl>
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id
          return (
            <div key={item.id} className="faq-item">
              <dt>
                <button
                  className="faq-item__btn"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-answer`}
                  id={`${item.id}-btn`}
                >
                  <span className="faq-item__question">{item.question}</span>
                  <span className={`faq-item__icon${isOpen ? ' faq-item__icon--open' : ''}`} aria-hidden="true">+</span>
                </button>
              </dt>
              <dd
                id={`${item.id}-answer`}
                role="region"
                aria-labelledby={`${item.id}-btn`}
                className={`faq-item__answer${isOpen ? ' faq-item__answer--open' : ''}`}
              >
                {item.answer}
              </dd>
            </div>
          )
        })}
      </dl>
    </aside>
  )
}
