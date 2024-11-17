import axios from 'axios';
const BASE_URL = 'http://localhost:8080'; // URL base da API


// Função para determinar a rota correta com base no papel do usuário
const getLoanRequestsRoutesByRole = (endpoint) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData && userData.role === 'Cliente') {
    return `${BASE_URL}/api/loanRequests/client/${endpoint}`;
  }
  return `${BASE_URL}/api/loanRequests/${endpoint}`;
};

// Função para determinar a rota correta com base no papel do usuário
const getLoansRoutesByRole = (endpoint) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData && userData.role === 'Cliente') {
    return `${BASE_URL}/api/loans/client/${endpoint}`;
  }
  return `${BASE_URL}/api/loans/${endpoint}`;
};

export const fetchAllLoans = async (userId, userRole) => {
  let url;

  if(userId && userRole === 'Cliente') {
      url = getLoansRoutesByRole(`${userId}`);
  } else {
      url = getLoansRoutesByRole('all');
  }
  
  const response = await axios.get(url);

  if (!response) {
    throw new Error('Erro ao buscar emprestimos');
  }

  return response.data;
}

export const fetchAllLoansRequest = async (userId, userRole) => {
    let url;

    if(userId && userRole === 'Cliente') {
        url = getLoanRequestsRoutesByRole(`${userId}`);
    } else {
        url = getLoanRequestsRoutesByRole('all');
    }
   
  const response = await axios.get(url);

  if (!response) {
    throw new Error('Erro ao buscar emprestimos');
  }

  return response.data;
}

export const fetchLoanByQuery = async () => {

}

export const fetchLoanDetailsById = async (loanId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/loanRequests/${loanId}`)

      if (!response) {
        throw new Error('Erro ao buscar emprestimos');
      }

      return response.data;
    } catch (err) {
      throw new Error('Erro ao buscar emprestimo pelo seu id');
    }
}

export const getLoansByClientIdAndStatus = async (clientId, status) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/loanRequests/client/${clientId}/status/${status}`)

    if (!response) {
      throw new Error('Erro ao buscar emprestimos');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar emprestimo pelo seu id');
  }
}

export const updateLoan = async () => {
    
}


export const addLoan = async () => {
    
}

export const cancelLoan = async (loanId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/loanRequests/cancel/${loanId}`)

    if (!response) {
      throw new Error('Erro ao cancelar emprestimo');
    }

    return response;
  } catch (err) {
    throw new Error('Erro ao cancelar emprestimo pelo seu id');
  }
}

export const reactivateLoan = async () => {
    
}

export const updateLoanStatus = async () => {
    
}


export const addLoanRequest = async () => {
    
}


export const cancelLoanRequest = async () => {
    
}


export const returnLoanBook = async (loanId) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/loans/return/${loanId}`);

    if (!response) {
      throw new Error('Erro ao retornar emprestimo');
    }

    return response;
  } catch (err) {
    throw new Error('Erro ao retornar emprestimo pelo seu id');
  }
}

export const updateLoanRequestStatus = async (loanId, idFuncionario, status) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/loanRequests/${loanId}?idFuncionario=${idFuncionario}&status=${status}`);

    if (!response) {
      throw new Error('Erro ao atualizar solicitação de emprestimo');
    }

    return response;
  } catch (err) {
    throw new Error('Erro ao atualizar solicitação de emprestimo pelo seu id');
  }
}

export const getLoansByQuery = async (searchStatus, searchValue) => {
  try {
    let response;

    if (searchStatus === 'clientId') {
      response = await axios.get(`${BASE_URL}/api/loanRequests/client/${searchValue}`);
    } else if (searchStatus === 'loanId') {
      response = await axios.get(`${BASE_URL}/api/loanRequests/list/${searchValue}`);
    } else {
      // Falta api de buscar pelo id de livro
      response = await axios.get(`${BASE_URL}/api/loanRequests/listByBook/${searchValue}`);
    }

    if (!response) {
      throw new Error('Erro ao buscar solicitação de emprestimo');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar solicitação de emprestimo pela query');
  }
};

export const fetchloanDetailById = async (loanId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/loans/${loanId}`);

    return response.data;
  } catch(err) {
    throw new Error('Erro ao buscar emprestimo pelo seu id');
  }
}

export const fetchLoanByCustomerIdAndStatus = async (userId, status) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/loans/findByCustomerAndStatus?customerId=${userId}&status=${status}`);

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar emprestimo');
  }
}

export const getLoansByQueryInManagement = async (searchStatus, searchValue) => {
  try {
    let response;

    console.log(searchStatus)
    if (searchStatus === 'clientId') {
      response = await axios.get(`${BASE_URL}/api/loans/client/${searchValue}`);
    } else if (searchStatus === 'loanId') {
      response = await axios.get(`${BASE_URL}/api/loans/listId/${searchValue}`);
    } else {
      // Falta api de buscar pelo id de livro
      response = await axios.get(`${BASE_URL}/api/loans/book/${searchValue}`);
    }

    if (!response) {
      throw new Error('Erro ao buscar solicitação de emprestimo');
    }

    return response.data;
  } catch (err) {
    throw new Error('Erro ao buscar solicitação de emprestimo pela query');
  }
};
