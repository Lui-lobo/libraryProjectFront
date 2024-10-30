// src/Dashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')); // ou o que você usou para salvar os dados do usuário
    if (!user) {
      navigate('/'); // Redireciona para login se não estiver autenticado
      return;
    }

    switch (user.role) {
      case 'Cliente':
        navigate('/client'); // Redireciona para o painel do cliente
        break;
      case 'Funcionario':
        navigate('/employee'); // Redireciona para o painel do funcionário
        break;
      case 'Administrador':
        navigate('/admin'); // Redireciona para o painel do administrador
        break;
      default:
        navigate('/'); // Redireciona para login se a role não for reconhecida
    }
  }, [navigate]);

  return null; // Componente não renderiza nada
};

export default Dashboard;
