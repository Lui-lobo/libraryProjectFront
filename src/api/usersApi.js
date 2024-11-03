// src/api/bookApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080'; // URL base da API

// Busca todos os usuários
export const fetchAllUsers = async () => {
  try {
    const url = (`${BASE_URL}/api/users/list`);
    const response = await axios.get(url); // API para buscar todos os livros
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar todos os usuários:", error);
    throw error;
  }
};

// Busca livros por um critério específico (isbn, autor ou título)
export const fetchUserByQuery = async (query, type) => {
  let url;

  // Determina a URL correta com base no tipo de busca
  if (type === 'email') {
    url = `${BASE_URL}/api/users/getUserByEmail?email=${query}`;
  } else {
    url = `${BASE_URL}/api/users/getUserByName?name=${query}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar livros');
  }

  return await response.json();
};

// Busca detalhes de um livro pelo ISBN
export const fetchUserDetailsById = async (id) => {
  try {
    const url = (`${BASE_URL}/api/users/findUserById?id=${id}`);
    const response = await axios.get(url); // API para buscar um livro por ISBN
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar detalhes do usuário:", error);
    throw error;
  }
};

export const updateUserDetails = async (bookId, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/books/updateBook/${bookId}`, data); // API para buscar todos os livros
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar todos os livros:", error);
    throw error;
  }
}

// Função para cadastrar um novo livro
export const addUser = async (newUserData, validatorId) => {
  if(newUserData.role === 'Funcionario') {
    try {
      const response = await axios.post(`${BASE_URL}/api/users/admin/createEmployee?adminId=${validatorId}`, newUserData);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      throw error;
    }
  } else {
    try {
      const response = await axios.post(`${BASE_URL}/api/users/createCustomer?userId=${validatorId}`, newUserData);
      return response.data;
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      throw error;
    }
  }
};

// Inativa um livro pelo ID
export const inactivateUser = async (userId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/users/changeUserActiveStatus/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao inativar o usuário:", error);
    throw error;
  }
};

export const activateUser = async (userId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/users/changeUserActiveStatus/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao ativar o usuário:", error);
    throw error;
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/users/updateEmployee/${employeeId}`, employeeData);
    return response.data;
  } catch (error) {
    console.error("Erro ao inativar o livro:", error);
    throw error;
  }
}

export const updateCustomer = async (customerId, customerData) => {
  try {
    // Retiramos informações pertencentes a outras funções
    const response = await axios.put(`${BASE_URL}/api/users/updateCustomer/${customerId}`, customerData);
    return response.data;
  } catch (error) {
    console.error("Erro ao inativar o livro:", error);
    throw error;
  }
}
