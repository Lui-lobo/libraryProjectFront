// src/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosModel';

const Register = () => {
  const [name, setname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState(null); // Estado para armazenar a mensagem
  const [messageType, setMessageType] = useState(''); // Tipo de mensagem (sucesso/erro)

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      setMessageType('danger');
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setMessage(null);
        setMessageType('');
      }, 3000);
      return;
    }

    try {
      const response = await api.post('/api/users/public/createCustomer', { name, email, password, address });
      // Aqui você pode redirecionar o usuário para a página de login ou mostrar uma mensagem de sucesso
      // Caso de sucesso
      if (response.status === 200) {
        setMessage('Usuário cadastrado com sucesso!');
        setMessageType('success');
  
        // Redirecionar para a página de login após 3 segundos
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      // Aqui você pode mostrar uma mensagem de erro
      if (error.response && error.response.status === 400) {
        setMessage(`Falha ao cadastrar, ${error.response.data}`);
        setMessageType('danger');
      } else {
        setMessage('Erro no servidor. Tente novamente mais tarde.');
        setMessageType('danger');
      }

      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setMessage(null);
        setMessageType('');
      }, 3000);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome de Usuário</label>
          <input 
            type="text" 
            className="form-control" 
            id="name" 
            placeholder="Digite seu nome de usuário" 
            value={name}
            onChange={(e) => setname(e.target.value)}
            required 
          />
        </div>
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
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
          <input 
            type="password" 
            className="form-control" 
            id="confirmPassword" 
            placeholder="Confirme sua senha" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Endereço</label>
          <input 
            type="setAddress" 
            className="form-control" 
            id="setAddress" 
            placeholder="Digite seu endereço" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">Cadastrar</button>
      </form>
      {/* Exibir mensagem de sucesso ou erro */}
      {message && (
        <div className={`alert alert-${messageType} mt-3`} role="alert">
          {message}
        </div>
      )}

      <p className="mt-3">
        Já possui uma conta ? <Link to="/">Ir para login</Link>
      </p>
    </div>
  );
};

export default Register;
