// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import Header from './components/header';
import { AuthProvider } from './utils/authProvider';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header /> {/* Adiciona o Header na aplicação */}
        <div className="container">
          <AppRoutes /> {/* Rotas que renderizarão as páginas */}
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
