import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/auth-context'
import LandingPage from './pages/landing-page'
import Catalogo from './pages/catalogo'
import Geovisor from './pages/geovisor'
import Login from './pages/login'
import AdminLayout from './components/plataforma/admin-layout'
import AdminMapViewer from './components/geovisor/admin-map-viewer'
import BitacoraLogs from './components/bitacora/bitacora-logs'
import RutaProtegida from './components/ruta-protegida'
import PruebaMapaBase from './pages/prueba-mapa-base'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <Routes>
          {/* Rutas Publicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/geovisor" element={<Geovisor />} />
          <Route path="/login" element={<Login />} />
          {/* Banco de pruebas de la entrega nueva de cartografia. Desechable. */}
          <Route path="/prueba-mapa-base" element={<PruebaMapaBase />} />

          {/* Visor interactivo multi-rol (Administrador, Capturista, Auditor).
              Lo que va detras de RutaProtegida exige sesion. */}
          <Route path="/admin-visor" element={<RutaProtegida><AdminLayout /></RutaProtegida>}>
            <Route index element={<AdminMapViewer />} />
          </Route>

          {/* Rutas de Bitacora e Historiales */}
          <Route element={<RutaProtegida><AdminLayout /></RutaProtegida>}>
            <Route path="/logs/user/:userId" element={<BitacoraLogs />} />
            <Route path="/logs/global" element={<BitacoraLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
