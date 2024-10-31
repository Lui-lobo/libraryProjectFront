// src/Routes.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboards/dashboard';
import ClientDashboard from './components/dashboards/clientDashboard';
import EmployeeDashboard from './components/dashboards/employeeDashboard';
import AdminDashboard from './components/dashboards/adminDashboard';
import SearchHome from './components/search/searchHome';
import Profile from './components/profile/profile';
import UserManagement from './components/search/userSearch';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Rota para Dashboard do Cliente */}
      <Route path="/client" element={<ClientDashboard />}>
        <Route path="/client/" element={<SearchHome />} />
        <Route path="/client/profile" element={<Profile />} />
      </Route>

      <Route path="/employee" element={<EmployeeDashboard />} />
 
      <Route path="/admin" element={<AdminDashboard />}>
        <Route path="/admin/" element={<SearchHome />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/profile" element={<Profile />} />
      </Route>

    </Routes>
  );
};

export default AppRoutes;
