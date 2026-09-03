import React from 'react';

/**
 * Icono de perfil de Administrador (Silueta ejecutiva formal con corbata y bolsillo)
 */
export const AdminProfileIcon = ({ size = 64, className = '', color = 'currentColor', ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 128 128" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Cabeza */}
    <circle cx="64" cy="36" r="26" fill={color} />
    
    {/* Nudo de corbata */}
    <path d="M 55 67 L 73 67 L 71 76 L 57 76 Z" fill={color} />
    
    {/* Cuerpo de corbata */}
    <path d="M 58 79 L 70 79 L 72 105 L 64 114 L 56 105 Z" fill={color} />
    
    {/* Lado izquierdo del saco */}
    <path 
      d="M 16 114 C 16 88 30 72 50 68 L 53 114 Z" 
      fill={color} 
    />
    
    {/* Lado derecho del saco con bolsillo recortado en espacio negativo */}
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M 78 68 C 98 72 112 88 112 114 L 75 114 Z M 81 92 H 98 V 96 H 81 Z" 
      fill={color} 
    />
  </svg>
);

/**
 * Icono de perfil de Capturista (Misma silueta y proporciones pero simplificada)
 */
export const CapturistaProfileIcon = ({ size = 64, className = '', color = 'currentColor', ...props }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 128 128" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Cabeza idéntica */}
    <circle cx="64" cy="36" r="26" fill={color} />
    
    {/* Torso con silueta idéntica y cuello en V simplificado */}
    <path 
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 16 114 C 16 88 34 70 64 68 C 94 70 112 88 112 114 Z M 64 88 L 53 68 H 75 Z" 
      fill={color} 
    />
  </svg>
);
