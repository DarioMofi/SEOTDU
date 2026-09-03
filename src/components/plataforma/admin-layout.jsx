import React from 'react';
import { Outlet } from 'react-router-dom';
/* El header de la plataforma es uno solo: el de PEOTDU. El que venía en el
   paquete de roles (`./Header`) quedó sin usar. */
import Header from './header';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;