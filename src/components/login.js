// src/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosModel';
import { AuthContext } from '../utils/authProvider';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null); // Estado para armazenar a mensagem
  const [messageType, setMessageType] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post(`/api/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      // Caso de sucesso
      setMessage('Login bem-sucedido!');
      setMessageType('success');
      login(JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) {
      setMessage('Falha ao fazer login, Verifique suas credenciais.');
      setMessageType('danger');
      console.error('Erro ao fazer login:', error);
      // Aqui você pode mostrar uma mensagem de erro
    }

    // Limpar a mensagem após 3 segundos
    setTimeout(() => {
      setMessage(null);
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control" 
            id="email" 
            placeholder="Digite seu email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Senha</label>
          <input 
            type="password" 
            className="form-control" 
            id="password" 
            placeholder="Digite sua senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Entrar</button>
      </form>

        {/* Exibir mensagem de sucesso ou erro */}
        {message && (
        <div className={`alert alert-${messageType} mt-3`} role="alert">
          {message}
        </div>
      )}

      <p className="mt-3">
        Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
      </p>
    </div>
  );
};

export default Login;
