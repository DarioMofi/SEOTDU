import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * Los tres perfiles institucionales. El público no tiene rol: es `null`.
 *
 * Tenerlo como tipo y no como cadena suelta es lo que hace que un
 * `role === 'administradora'` deje de compilar en vez de quedarse como un `if`
 * que nunca se cumple. Había uno así en la bitácora.
 */
export type Rol = 'administrador' | 'capturista' | 'auditor';

const ROLES: readonly Rol[] = ['administrador', 'capturista', 'auditor'];

interface AuthContextValue {
  role: Rol | null;
  login: (password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Qué rol asigna cada contraseña.
 *
 * **Esto es maqueta, no autenticación**: la contraseña *es* el selector de rol.
 * Desaparece cuando entre Supabase Auth.
 */
const ROL_POR_CONTRASENA: Record<string, Rol> = {
  administrador: 'administrador',
  administradora: 'administrador',
  auditor: 'auditor',
  auditora: 'auditor',
  capturista: 'capturista',
};

/** Lo que haya en `localStorage` solo vale si es uno de los tres roles. */
function rolGuardado(): Rol | null {
  const guardado = localStorage.getItem('sim_role');
  return ROLES.includes(guardado as Rol) ? (guardado as Rol) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Se lee de localStorage al arrancar por si el usuario recarga la página.
  const [role, setRole] = useState<Rol | null>(rolGuardado);

  const login = (password: string) => {
    const pwd = (password ?? '').trim().toLowerCase();
    // Cualquier contraseña no reconocida entra como capturista. Es el
    // comportamiento deliberado de la maqueta, no un descuido.
    const nuevoRol = ROL_POR_CONTRASENA[pwd] ?? 'capturista';
    setRole(nuevoRol);
    localStorage.setItem('sim_role', nuevoRol);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('sim_role');
  };

  return <AuthContext.Provider value={{ role, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
