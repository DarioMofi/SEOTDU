import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

/**
 * Envuelve las rutas que exigen sesión.
 *
 * Sin rol manda al **inicio público**, no al login. Importa por dos razones: al
 * cerrar sesión el usuario sale de la plataforma institucional, no regresa a la
 * puerta; y sin esto el logout rebotaba al login, porque al limpiarse el rol
 * este guard se dispara antes de que corra el `navigate('/')` de quien cerró.
 *
 * `replace` evita que el botón de atrás regrese a la vista protegida: sin eso,
 * el historial guarda una entrada que ya no se puede ver y el usuario rebota.
 *
 * Guarda de dónde venía para poder devolverlo ahí cuando el login sea real.
 */
export default function RutaProtegida({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const location = useLocation();

  if (!role) {
    return <Navigate to="/" replace state={{ desde: location.pathname }} />;
  }

  return <>{children}</>;
}
