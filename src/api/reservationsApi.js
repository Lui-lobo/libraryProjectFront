import axios from 'axios';
const BASE_URL = 'http://localhost:8080'; // URL base da API

// Função para determinar a rota correta com base no papel do usuário
const getRouteForRole = (endpoint) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData && userData.role === 'Cliente') {
    return `${BASE_URL}/api/reservations/client/${endpoint}`;
  }
  return `${BASE_URL}/api/reservations/${endpoint}`;
};


export const fetchAllReservations = async (userId, userRole) => {
  let url;

  if(userId && userRole === 'Cliente') {
      url = getRouteForRole(`${userId}`);
  } else {
      url = getRouteForRole('reservationRequests/all');
  }
 
  const response = await axios.get(url);

  if (!response) {
    throw new Error('Erro ao buscar reservas');
  }

  return response.data;
}

export const fetchReservationByQuery = async (searchStatus, searchValue) => {
  try {
    let response;

    console.log(searchStatus)
    if (searchStatus === 'clientId') {
      response = await axios.get(`${BASE_URL}/api/reservations/client/${searchValue}`);
    } else if (searchStatus === 'reservationId') {
      response = await axios.get(`${BASE_URL}/api/reservationRequests/${searchValue}`);
    } else {
      // Falta api de buscar pelo id de livro
      response = await axios.get(`${BASE_URL}/api/reservationRequests/book/${searchValue}`);
    }

    if (!response) {
      throw new Error('Erro ao buscar solicitação de reserva');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar solicitação de reserva pela query');
  }
}

export const fetchReservationByCustomerIdAndStatus = async (customerId, status) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/reservations/client/${customerId}/status?status=${status}`);

    if (!response) {
      throw new Error('Erro ao buscar reservas');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar reservas');
  }
}

export const fetchReservationDetailsById = async (reservationId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/reservations/${reservationId}`)

    if (!response) {
      throw new Error('Erro ao buscar reserva');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar reserva pelo seu id');
  }
}

export const updateReservation = async () => {
  
}

export const addReservation = async () => {
  
}

export const cancelReservation = async (reservationId) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/reservations/cancel/${reservationId}`)

    if (!response) {
      throw new Error('Erro ao cancelar solicitação de reserva');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao cancelar solicitação de reserva pelo seu id');
  }
}

export const reactivateReservation = async () => {
  
}

export const updateReservationRequestStatus = async (reservationId, employeeId, status) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/reservationRequests/${reservationId}/status?approverId=${employeeId}&status=${status}`);

    if (!response) {
      throw new Error('Erro ao atualizar solicitação de emprestimo');
    }

    return response;
  } catch (err) {
    throw new Error('Erro ao atualizar solicitação de emprestimo pelo seu id');
  }
};