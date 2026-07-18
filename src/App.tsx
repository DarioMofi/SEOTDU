import { useState } from 'react'

type View = 'inicio' | 'catalogo' | 'geovisor'

const GUINDA = '#621132'
const GUINDA_DARK = '#4a0d26'
const BEIGE = '#C0A878'
const BEIGE_BG = '#f0e6ce'

// Module cards data
const modules = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" fill="#f0e6ce" />
        <path d="M16 30c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="18" r="4" stroke={GUINDA} strokeWidth="2"/>
        <path d="M12 36h24" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 36v-6M28 36v-6" stroke={GUINDA} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Monitoreo Ambiental y Territorial',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" fill="#f0e6ce" />
        <path d="M14 34l4-8 4 4 4-12 4 8" stroke={GUINDA} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="12" y="12" width="24" height="22" rx="2" stroke={GUINDA} strokeWidth="2"/>
        <path d="M17 38h14" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Bienestar Social y Demografía',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" fill="#f0e6ce" />
        <rect x="13" y="20" width="8" height="14" rx="1" stroke={GUINDA} strokeWidth="2"/>
        <rect x="27" y="14" width="8" height="20" rx="1" stroke={GUINDA} strokeWidth="2"/>
        <path d="M11 34h26" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 20l7-8" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="27" cy="14" r="2" fill={GUINDA}/>
      </svg>
    ),
    title: 'Infraestructura Estratégica y Conectividad',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" fill="#f0e6ce" />
        <path d="M24 14l2.5 5 5.5.8-4 3.9.9 5.5L24 26.5l-4.9 2.7.9-5.5-4-3.9 5.5-.8L24 14z" stroke={GUINDA} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M16 34c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Aptitud Territorial y Desarrollo Económico',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <circle cx="24" cy="24" r="20" fill="#f0e6ce" />
        <path d="M16 20h16M16 24h12M16 28h8" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
        <rect x="12" y="13" width="24" height="22" rx="2" stroke={GUINDA} strokeWidth="2"/>
        <circle cx="32" cy="32" r="5" fill="#f0e6ce" stroke={GUINDA} strokeWidth="2"/>
        <path d="M32 30v2.5l1.5 1.5" stroke={GUINDA} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Normatividad y Modelo de Ordenamiento',
  },
]

const faqs = [
  {
    q: '¿Cómo puedo consultar los instrumentos de planeación?',
    a: 'Puede acceder al Catálogo de Instrumentos desde el menú superior o mediante el botón "Consultar Catálogo" en la sección principal.',
  },
  {
    q: '¿Cómo accedo al Geovisor interactivo del territorio?',
    a: 'El Geovisor está disponible en el menú de navegación. Desde ahí podrá visualizar capas cartográficas y datos territoriales de Campeche.',
  },
  {
    q: '¿Qué tipo de documentos puedo encontrar en el catálogo?',
    a: 'El catálogo incluye planes de desarrollo, programas de ordenamiento ecológico, normas territoriales y estudios técnicos oficiales.',
  },
]

function Header({ activeView, setView }: { activeView: View; setView: (v: View) => void }) {
  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo placeholder 1 */}
            <div className="w-32 h-14 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto bg-gray-300 rounded-full mb-0.5" />
                <span className="text-[9px] text-gray-500 font-medium">GOBIERNO</span>
              </div>
            </div>
            {/* Logo placeholder 2 */}
            <div className="w-28 h-14 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 mx-auto bg-gray-300 rounded mb-0.5" />
                <span className="text-[9px] text-gray-500 font-medium leading-tight block">CAMPECHE</span>
              </div>
            </div>
          </div>
          {/* User profile */}
          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-500">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{ backgroundColor: GUINDA }} className="w-full">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-12">
          <div className="flex items-center gap-0">
            <NavTab label="Inicio" active={activeView === 'inicio'} onClick={() => setView('inicio')} />
            <NavTab label="Catálogo de Instrumentos" active={activeView === 'catalogo'} onClick={() => setView('catalogo')} />
            <NavTab label="Geovisor" active={activeView === 'geovisor'} onClick={() => setView('geovisor')} />
          </div>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-3 pr-8 py-1.5 rounded text-sm bg-white/90 text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 w-52 transition-all"
              style={{ '--tw-ring-color': BEIGE } as React.CSSProperties}
            />
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute right-2.5 top-2 text-gray-400">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16.5 16.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </nav>
    </header>
  )
}

function NavTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-5 h-12 text-sm font-medium transition-colors relative cursor-pointer"
      style={{
        color: active ? '#fff' : 'rgba(255,255,255,0.75)',
        borderBottom: active ? `2px solid ${BEIGE}` : '2px solid transparent',
        backgroundColor: active ? 'rgba(0,0,0,0.15)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)' }}
    >
      {label}
    </button>
  )
}

function Footer() {
  return (
    <footer className="w-full mt-auto">
      <div className="bg-gray-100 border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logos */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Institucional</h4>
            <div className="flex flex-col gap-3">
              <div className="w-28 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-[10px] text-gray-400">Logo Gobierno</span>
              </div>
              <div className="w-28 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-[10px] text-gray-400">Logo Campeche</span>
              </div>
            </div>
          </div>
          {/* Transparencia */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Transparencia</h4>
            <ul className="space-y-2">
              {['Portal de Obligaciones', 'Declaración Patrimonial', 'Compras Públicas', 'Acceso a la Información'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contacto */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mt-0.5 shrink-0 text-gray-400"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" stroke="currentColor" strokeWidth="1.5"/></svg>
                Av. 16 de Septiembre No. 348, Col. Centro, Campeche, Cam.
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-gray-400"><path d="M3 5a2 2 0 012-2h3.6a1 1 0 01.9.6L11 7.5a1 1 0 01-.2 1.1L9 10.3a11 11 0 005.7 5.7l1.6-1.8a1 1 0 011.1-.2l3.9 1.5a1 1 0 01.6.9V19a2 2 0 01-2 2A16 16 0 013 5z" stroke="currentColor" strokeWidth="1.5"/></svg>
                (981) 811-9200
              </li>
              <li className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-gray-400"><path d="M3 8l9 5 9-5M3 8v10a1 1 0 001 1h16a1 1 0 001-1V8M3 8a1 1 0 011-1h16a1 1 0 011 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                contacto@campeche.gob.mx
              </li>
            </ul>
          </div>
          {/* Enlaces */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Enlaces</h4>
            <ul className="space-y-2">
              {['Gobierno del Estado', 'SEDATU', 'INEGI', 'CONABIO', 'SEMARNAT'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div style={{ backgroundColor: '#2d2d2d' }} className="py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Gobierno del Estado de Campeche. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {/* Social icons */}
            {[
              { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
              { label: 'Twitter/X', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
              { label: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98l5.75 3.02z' },
            ].map(({ label, path }) => (
              <a key={label} href="#" aria-label={label} className="text-gray-500 hover:text-gray-300 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d={path} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function UnderConstruction({ section }: { section: string }) {
  return (
    <main className="flex-1 flex items-center justify-center min-h-96 bg-gray-50">
      <div className="text-center px-6 py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: BEIGE_BG }}>
          <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
            <path d="M24 6l4 8h8l-6.5 5.5 2.5 8L24 23l-8 4.5 2.5-8L12 14h8z" stroke={GUINDA} strokeWidth="2" strokeLinejoin="round"/>
            <path d="M14 32l-8 10M34 32l8 10M20 38h8" stroke={GUINDA} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-3">{section}</h2>
        <p className="text-5xl font-light mb-4" style={{ color: GUINDA }}>Se encuentra en construcción</p>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Estamos trabajando para ofrecerle una mejor experiencia. Próximamente disponible.
        </p>
        <div className="mt-8 w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: BEIGE }} />
      </div>
    </main>
  )
}

function InicioView({ setView }: { setView: (v: View) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative w-full h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=1400&h=600&fit=crop&auto=format"
          alt="Vista aérea del territorio de Campeche"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30,10,20,0.82) 0%, rgba(30,10,20,0.55) 60%, rgba(30,10,20,0.3) 100%)' }} />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-semibold max-w-xl leading-snug drop-shadow-lg">
              Sistema Estatal de Planeación y Ordenamiento Territorial de Campeche
            </h1>
          </div>
        </div>
      </section>

      {/* Content section */}
      <section className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: description + buttons */}
        <div className="lg:col-span-3">
          <p className="text-gray-700 text-base leading-relaxed mb-6">
            Explore el territorio de Campeche a través de nuestras herramientas de planeación y ordenamiento. Consulte normativas, usos de suelo y planes de desarrollo del municipio. Acceda al visualizador interactivo o busque documentos oficiales directamente en el acervo institucional.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setView('geovisor')}
              className="px-6 py-2.5 rounded text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: GUINDA }}
            >
              Abrir Geovisor
            </button>
            <button
              onClick={() => setView('catalogo')}
              className="px-6 py-2.5 rounded text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: GUINDA }}
            >
              Consultar Catálogo
            </button>
          </div>
        </div>

        {/* Right: FAQ */}
        <div className="lg:col-span-2 rounded-lg p-5" style={{ backgroundColor: BEIGE_BG, border: `1px solid ${BEIGE}` }}>
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" style={{ color: GUINDA }}>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v.01M12 11v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3 className="font-semibold text-base" style={{ color: GUINDA }}>Preguntas Frecuentes</h3>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-amber-200 last:border-0 pb-2 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left flex items-start justify-between gap-2 py-1 group"
                >
                  <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900 leading-snug">{faq.q}</span>
                  <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: GUINDA }}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <p className="text-xs text-gray-600 mt-1 pb-1 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module cards grid */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {modules.map((mod, i) => (
            <ModuleCard key={i} icon={mod.icon} title={mod.title} />
          ))}
        </div>
      </section>
    </main>
  )
}

function ModuleCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="bg-white rounded-lg p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-200"
      style={{
        boxShadow: hovered ? '0 4px 16px rgba(98,17,50,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
        border: hovered ? `1px solid ${BEIGE}` : '1px solid #e5e7eb',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="mb-3">{icon}</div>
      <h4 className="text-xs font-semibold text-gray-700 leading-tight mb-3">{title}</h4>
      <span className="text-xs font-semibold mt-auto" style={{ color: GUINDA }}>Explorar &gt;&gt;</span>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('inicio')

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header activeView={view} setView={setView} />

      {view === 'inicio' && <InicioView setView={setView} />}
      {view === 'catalogo' && <UnderConstruction section="Catálogo de Instrumentos" />}
      {view === 'geovisor' && <UnderConstruction section="Geovisor" />}

      <Footer />
    </div>
  )
}
