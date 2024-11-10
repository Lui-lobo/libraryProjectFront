const BASE_URL = 'http://localhost:8080'; // URL base da API

// Função para determinar a rota correta com base no papel do usuário
const getRouteForRole = (endpoint) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData && userData.role === 'Cliente') {
    return `${BASE_URL}/api/bookCollection/active${endpoint}`;
  }
  return `${BASE_URL}/api/bookCollection${endpoint}`;
};
