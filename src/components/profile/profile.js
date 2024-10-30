// src/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/users/findUserById?id=${encodeURIComponent(storedUser.id)}`); // API para buscar o usuário
          setUserData(response.data);
          setName(response.data.name); // Inicializa o nome para edição
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      };

      fetchUserData();
    }
  }, []);

  const handleEdit = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      try {
        await axios.put(`/api/users/${storedUser.id}`, { name }); // API para atualizar o nome do usuário
        alert('Nome atualizado com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar nome:', error);
      }
    }
  };

  if (!userData) {
    return <div className="text-center mt-5">Carregando...</div>; // Exibir um carregando enquanto os dados são buscados
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Perfil do Usuário</h2>
      <div className="mb-3">
        <label className="form-label"><strong>Email:</strong></label>
        <p>{userData.email}</p>
      </div>
      <div className="mb-3">
        <label className="form-label"><strong>Nome:</strong></label>
        <input 
          type="text" 
          className="form-control" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>

      {userData.role === 'Administrador' && (
        <div className="mt-4">
          <h3>Informações do Administrador</h3>
          <p>Função: Administrador</p>
          {/* Adicione mais campos específicos para Administradores, se necessário */}
        </div>
      )}

      {userData.role === 'Funcionario' && (
        <div className="mt-4">
          <h3>Informações do Funcionário</h3>
          <p>Função: Funcionário</p>
          {/* Adicione mais campos específicos para Funcionários, se necessário */}
        </div>
      )}

      {userData.role === 'Cliente' && (
        <div>
        <div className="mb-3">
        <label className="form-label"><strong>Tipo de usuário:</strong></label>
            <p>{userData.role}</p>
        </div>
         <div className="mb-3">
         <label className="form-label"><strong>Endereço:</strong></label>
             <p>{userData.address}</p>
         </div>
        </div>
     
      )}

    <button className="btn btn-primary" onClick={handleEdit}>Salvar Alterações</button>
    </div>
  );
};

export default Profile;
