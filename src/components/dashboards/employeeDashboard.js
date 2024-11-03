// src/EmployeeDashboard.js
import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import '../dashboards/css/dashboard.css'
import ClientSidebar from '../sidebars/clientSidebar';

const EmployeeDashboard = () => {
  return (
    <div>
      <ClientSidebar />
      <Outlet></Outlet>
      {/* Aqui você pode adicionar as funcionalidades específicas para o funcionário */}
    </div>
  );
};

export default EmployeeDashboard;
