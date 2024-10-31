// src/api/bookApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080'; // URL base da API

// Função para determinar a rota correta com base no papel do usuário
const getRouteForRole = (endpoint) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData && userData.role === 'Cliente') {
    return `${BASE_URL}/api/bookCollection/active${endpoint}`;
  }
  return `${BASE_URL}/api/bookCollection${endpoint}`;
};

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
    url = getRouteForRole(`/getBookOnCollectionByIsbn?isbn=${query}`);
  } else {
    url = getRouteForRole(`/getBookOnCollectionByTitle?title=${query}`);
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
export const addUser = async (bookData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/bookCollection/add`, bookData);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar livro:", error);
    throw error;
  }
};

// Inativa um livro pelo ID
export const inactivateUser = async (bookId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/books/inactivate/${bookId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao inativar o livro:", error);
    throw error;
  }
};

export const activateUser = async (bookId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/books/activate/${bookId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao inativar o livro:", error);
    throw error;
  }
};
