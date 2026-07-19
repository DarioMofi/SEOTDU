import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Catalogo from './pages/Catalogo'
import Geovisor from './pages/Geovisor'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/geovisor" element={<Geovisor />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
