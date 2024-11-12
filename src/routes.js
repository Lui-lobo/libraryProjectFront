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
import ReservationManagement from './components/reservation/reservationManagement';
import LoanManagement from './components/loan/loanManagement';
import LoanRequests from './components/loan/loanRequest';
import ReservationRequest from './components/reservation/reservationRequest';

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
        <Route path="/client/reservationsRequests" element={<ReservationRequest />}></Route>
        <Route path="/client/reservations" element={<ReservationManagement />}></Route>
        <Route path="/client/loansRequest" element={<LoanRequests />}></Route>
        <Route path="/client/loans" element={<LoanManagement />}></Route>
      </Route>

      <Route path="/employee" element={<EmployeeDashboard />} >
        <Route path="/employee/" element={<SearchHome />} />
        <Route path="/employee/users" element={<UserManagement />} />
        <Route path="/employee/profile" element={<Profile />} />
        <Route path="/employee/reservationsRequests" element={<ReservationRequest />}></Route>
        <Route path="/employee/reservations" element={<ReservationManagement />}></Route>
        <Route path="/employee/loansRequest" element={<LoanRequests />}></Route>
        <Route path="/employee/loans" element={<LoanManagement />}></Route>
      </Route>
 
      <Route path="/admin" element={<AdminDashboard />}>
        <Route path="/admin/" element={<SearchHome />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/admin/reservationsRequests" element={<ReservationRequest />}></Route>
        <Route path="/admin/reservations" element={<ReservationManagement />}></Route>
        <Route path="/admin/loansRequest" element={<LoanRequests />}></Route>
        <Route path="/admin/loans" element={<LoanManagement />}></Route>
      </Route>

    </Routes>
  );
};

export default AppRoutes;
