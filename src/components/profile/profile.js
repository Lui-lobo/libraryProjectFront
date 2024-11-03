// src/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const fetchUserData = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      try {
        const response = await axios.get(`http://localhost:8080/api/users/findUserById?id=${encodeURIComponent(storedUser.id)}`);
        setUserData(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          address: response.data.address || '',
          password: response.data.password,
        });
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }
  };

  useEffect(() => {
    fetchUserData()
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEdit = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
  
    if (storedUser) {
      try {
        const endpoint =
          storedUser.role === 'Funcionario'
            ? `http://localhost:8080/api/users/updateEmployee/${storedUser.id}`
            : `http://localhost:8080/api/users/updateCustomer/${storedUser.id}`;

        await axios.put(endpoint, formData); // Envia o formData atualizado
        alert('Informações atualizadas com sucesso!');
        setUserData(formData); // Atualiza os dados localmente após a atualização
        await fetchUserData()
      } catch (error) {
        console.error('Erro ao atualizar informações:', error);
      }
    }
  };

  if (!userData) {
    return <div className="text-center mt-5">Carregando...</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Perfil do Usuário</h2>

      <div className="mb-3">
        <label className="form-label"><strong>Email:</strong></label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          readOnly // Email apenas para visualização, ajuste se necessário
        />
      </div>

      <div className="mb-3">
        <label className="form-label"><strong>Nome:</strong></label>
        <input
          type="text"
          className="form-control"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label"><strong>Senha:</strong></label>
        <input
          type="text"
          className="form-control"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>

      {userData.role === 'Cliente' && (
        <div className="mb-3">
          <label className="form-label"><strong>Endereço:</strong></label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
      )}

      {userData.role === 'Administrador' && (
        <div className="mt-4">
          <h3>Informações do Administrador</h3>
          <p>Função: Administrador</p>
        </div>
      )}

      {userData.role === 'Funcionario' && (
        <div className="mt-4">
          <h3>Informações do Funcionário</h3>
          <p>Função: Funcionário</p>
        </div>
      )}

      <button className="btn btn-primary mt-3" onClick={handleEdit}>Salvar Alterações</button>
    </div>
  );
};

export default Profile;
