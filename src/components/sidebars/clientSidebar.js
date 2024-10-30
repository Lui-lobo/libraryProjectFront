// src/ClientSidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../dashboards/css/dashboard.css';

const ClientSidebar = () => {
  const userRole = JSON.parse(localStorage.getItem('user'))?.role; // Obtém a role do usuário do localStorage

  const renderLinks = () => {
    switch (userRole) {
      case 'Administrador':
        return (
          <>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-tachometer-alt fa-fw me-3"></i>
              <Link to="/admin/dashboard">Dashboard Admin</Link>
            </a>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-tachometer-alt fa-fw me-3"></i>
              <Link to="/admin/">Gerenciar acervo</Link>
            </a>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-users fa-fw me-3"></i>
              <Link to="/admin/manage-users">Gerenciar Usuários</Link>
            </a>
          </>
        );

      case 'Funcionario':
        return (
          <>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-book fa-fw me-3"></i>
              <Link to="/employee/dashboard">Dashboard Funcionário</Link>
            </a>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-book-reader fa-fw me-3"></i>
              <Link to="/employee/manage-loans">Gerenciar Empréstimos</Link>
            </a>
          </>
        );

      case 'Cliente':
        return (
          <>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-book fa-fw me-3"></i>
              <Link to="/client/">Acervo de Livros</Link>
            </a>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-bookmark fa-fw me-3"></i>
              <Link to="/client/reserved-books">Livros Reservados</Link>
            </a>
            <a className="list-group-item list-group-item-action py-2 ripple">
              <i className="fas fa-history fa-fw me-3"></i>
              <Link to="/client/loan-history">Histórico de Empréstimos</Link>
            </a>
          </>
        );

      default:
        return (
          <a className="list-group-item list-group-item-action py-2 ripple">
            <i className="fas fa-info-circle fa-fw me-3"></i>
            <Link to="/info">Informações Gerais</Link>
          </a>
        );
    }
  };

  return (
    <div>
      <nav id="sidebarMenu" className="collapse d-lg-block sidebar collapse">
        <div className="position-sticky">
          <div className="list-group list-group-flush mx-3 mt-4">
            {renderLinks()} {/* Renderiza links com base no papel do usuário */}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ClientSidebar;