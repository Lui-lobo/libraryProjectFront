// src/ClientDashboard.js
import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import '../dashboards/css/dashboard.css'
import ClientSidebar from '../sidebars/clientSidebar';

const ClientDashboard = () => {
  return (
    <div className='dashboard-container'>
      <ClientSidebar />
      {/* Saida dos dados de outros componentes */}
      <Outlet />
    </div>
  );
};

export default ClientDashboard;
