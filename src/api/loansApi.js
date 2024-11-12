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

export const fetchAllLoans = async () => {

}

export const fetchAllLoansRequest = async (userId, userRole) => {
    let url;
    console.log('ID DO USUÀRIO', userId, 'ROLE DO USUÀRIO',userRole)
    if(userId && userRole === 'Cliente') {
        url = getLoanRequestsRoutesByRole(`${userId}`);
    } else {
        url = getLoanRequestsRoutesByRole('');
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


export const updateLoan = async () => {
    
}


export const addLoan = async () => {
    
}

export const cancelLoan = async () => {
    
}

export const reactivateLoan = async () => {
    
}

export const updateLoanStatus = async () => {
    
}


export const addLoanRequest = async () => {
    
}


export const cancelLoanRequest = async () => {
    
}


export const returnLoanBook = async () => {
    
}



