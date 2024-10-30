// src/AuthContext.js
import React, { createContext, useState } from 'react';

// Criação do contexto
export const AuthContext = createContext();

// Componente de provedor
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('user'));

  // Função para realizar login
  const login = (user) => {
    localStorage.setItem('user', user);
    setIsAuthenticated(true);
  };

  // Função para realizar logout
  const logout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
