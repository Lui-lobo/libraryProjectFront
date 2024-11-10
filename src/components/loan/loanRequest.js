import React, { useEffect, useState } from 'react';
import {
  fetchAllLoansRequest, fetchLoanByQuery, fetchLoanDetailsById,
  updateLoan, addLoan, cancelLoan, reactivateLoan
} from '../../api/loansApi';
import { Link, useNavigate } from 'react-router-dom';

const LoanRequests = () => {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('clientName');
  const [noResults, setNoResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ clientName: '', bookTitle: '', loanDate: '', dueDate: '' });
  const [updateError, setUpdateError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoan, setNewLoan] = useState({ clientName: '', bookTitle: '', loanDate: '', dueDate: '' });
  const [addError, setAddError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loansPerPage] = useState(5);
  // Infos do usuário
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');

  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = loans.slice(indexOfFirstLoan, indexOfLastLoan);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();

  // Função para buscar todos os empréstimos
  const fetchUserData = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.role) {
      setRole(userData.role);
      setUserId(userData.id);
    }
  }

  const fetchLoans = async () => {
    try {
      const allLoans = await fetchAllLoansRequest(userId, role);
      console.log('Reservas encontradas', allLoans)
      setLoans(allLoans);
    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error);
    }
  };

  useEffect(() => {
    // Primeira chamada para buscar dados do usuário e definir `userId` e `role`
    fetchUserData();
  }, []);
  
  // Segunda chamada para buscar empréstimos apenas quando `userId` e `role` são definidos
  useEffect(() => {
    if (userId && role) {
      fetchLoans();
    }
  }, [userId, role]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      let searchedLoans;
      if (searchType === 'clientName') {
        searchedLoans = await fetchLoanByQuery(searchQuery, 'clientName');
      } else {
        searchedLoans = await fetchLoanByQuery(searchQuery, 'bookTitle');
      }

      setLoans(searchedLoans);
      setCurrentPage(1);

      if (searchedLoans.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao buscar empréstimos');
    }
  };

  const handleViewDetails = async (loanId) => {
    try {
      const details = await fetchLoanDetailsById(loanId);
      setLoanDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes do empréstimo:", error);
    }
  };

  const handleEditLoan = (loan) => {
    setEditForm({
      clientName: loan.clientName,
      bookTitle: loan.bookTitle,
      loanDate: loan.loanDate,
      dueDate: loan.dueDate,
    });
    setLoanDetails(loan);
    setShowEditModal(true);
    setUpdateError('');
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleConfirmEdit = async () => {
    try {
      await updateLoan(loanDetails.id, editForm);
      setShowEditModal(false);
      setEditForm({ clientName: '', bookTitle: '', loanDate: '', dueDate: '' });
      setUpdateError('');
      await fetchLoans();
    } catch (error) {
      setUpdateError('Erro ao atualizar empréstimo.');
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddError('');
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewLoan({ clientName: '', bookTitle: '', loanDate: '', dueDate: '' });
    setAddError('');
  };

  const handleAddLoan = async () => {
    try {
      if (!newLoan.clientName || !newLoan.bookTitle || !newLoan.loanDate || !newLoan.dueDate) {
        setAddError('Preencha todos os campos.');
        return;
      }
      await addLoan(newLoan);
      await fetchLoans();
      handleCloseAddModal();
    } catch (error) {
      setAddError(error.message);
    }
  };

  const handleCancelLoan = async (loanId) => {
    try {
      await cancelLoan(loanId);
      await fetchLoans();
    } catch (error) {
      console.error("Erro ao cancelar empréstimo:", error);
    }
  };

  const handleReactivateLoan = async (loanId) => {
    try {
      await reactivateLoan(loanId);
      await fetchLoans();
    } catch (error) {
      console.error("Erro ao reativar empréstimo:", error);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setLoanDetails(null);
  };

  const totalPages = Math.ceil(loans.length / loansPerPage);

  const Pagination = ({ totalPages, paginate }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map((number) => (
            <li key={number} className="page-item">
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gerenciamento de solicitações de Empréstimos</h2>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control me-2"
            style={{ flex: '1 0 70%' }}
            placeholder="Digite o nome do cliente ou título do livro"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="form-select me-2"
            style={{ flex: '0 0 20%' }}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="clientName">Nome do Cliente</option>
            <option value="bookTitle">Título do Livro</option>
          </select>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </div>
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        {noResults && <div className="alert alert-warning mt-3">Nenhum empréstimo encontrado.</div>}
      </form>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Livro</th>
              <th>Data do Empréstimo</th>
              <th>Data de Devolução</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentLoans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.clientName}</td>
                <td>{loan.bookTitle}</td>
                <td>{loan.loanDate}</td>
                <td>{loan.dueDate}</td>
                <td>{loan.active ? 'Ativo' : 'Cancelado'}</td>
                <td>
                  <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan.id)}>Detalhes</button>
                  <button className="btn btn-primary me-2" onClick={() => handleEditLoan(loan)}>Editar</button>
                  {loan.active ? (
                    <button className="btn btn-danger" onClick={() => handleCancelLoan(loan.id)}>Cancelar</button>
                  ) : (
                    <button className="btn btn-success" onClick={() => handleReactivateLoan(loan.id)}>Reativar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} paginate={paginate} />

      {/* Modais para Detalhes, Edição e Adição */}
      {/* Modais reutilizáveis são análogos ao componente `ReservationManagement` */}
    </div>
  );
};

export default LoanRequests;
