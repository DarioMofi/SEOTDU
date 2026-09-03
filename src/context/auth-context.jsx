import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializamos el estado leyendo de localStorage por si el usuario recarga la página
  const [role, setRole] = useState(() => {
    return localStorage.getItem('sim_role') || null;
  });

  const login = (password) => {
    const pwd = (password || '').trim().toLowerCase();
    let newRole = 'capturista'; // Rol por defecto
    if (pwd === 'administrador' || pwd === 'administradora') {
      newRole = 'administrador';
    } else if (pwd === 'auditor' || pwd === 'auditora') {
      newRole = 'auditor';
    } else if (pwd === 'capturista') {
      newRole = 'capturista';
    }

    setRole(newRole);
    localStorage.setItem('sim_role', newRole);
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem('sim_role');
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
