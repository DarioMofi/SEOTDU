import Header from '../components/plataforma/header';
import LoginCard from '../components/plataforma/login-card';
import Footer from '../components/plataforma/footer';
import Underfooter from '../components/plataforma/underfooter';

export default function Login() {
  return (
    <div className="page-shell">
      <Header />
      <LoginCard />
      <Footer />
      <Underfooter />
    </div>
  );
}