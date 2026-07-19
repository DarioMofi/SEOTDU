import Header from '../components/Header'
import LoginCard from '../components/LoginCard'
import Footer from '../components/Footer'
import Underfooter from '../components/Underfooter'

// Vista Institucional: sin Navbar, solo Header + LoginCard + Footer
export default function Login() {
  return (
    <div className="page-shell">
      <Header />

      <LoginCard />

      <Footer />
      <Underfooter />
    </div>
  )
}
