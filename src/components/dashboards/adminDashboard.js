// src/AdminDashboard.js
import React from 'react';
import ClientSidebar from '../sidebars/clientSidebar';
import { Link, useNavigate, Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <ClientSidebar />
      <Outlet></Outlet>
      {/* Aqui você pode adicionar as funcionalidades específicas para o administrador */}
    </div>
  );
};

export default AdminDashboard;
