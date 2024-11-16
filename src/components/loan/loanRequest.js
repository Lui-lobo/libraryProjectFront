import React, { useEffect, useState } from 'react';
import {
  fetchAllLoansRequest, fetchLoanByQuery, fetchLoanDetailsById,
  updateLoan, addLoan, cancelLoan, reactivateLoan,
  getLoansByClientIdAndStatus, updateLoanRequestStatus,
  getLoansByQuery
} from '../../api/loansApi';
import {
  fetchUserDetailsById
} from '../../api/usersApi';
import {
  getBookById
} from '../../api/booksApis';
import { Link, useNavigate } from 'react-router-dom';

const LoanRequests = () => {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('loanId');
  const [statusFilter, setStatusFilter] = useState('todos'); // Para o cliente, por padrão 'Todos'
  const [bookStatus, setBookStatus] = useState('todos'); // Status do livro
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
  const [showModal, setShowModal] = useState(false); // Controla se o modal está aberto
  const [selectedLoan, setSelectedLoan] = useState(null); // Dados do empréstimo selecionado
  const [clientDetails, setClientDetails] = useState(null); // Armazena os detalhes do cliente
  const [employeeDetails, setEmployeeDetails] = useState(null); // Armazena os detalhes do funcionário
  const [bookDetails, setBookDetails] = useState(null); // Armazena os detalhes do livro
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

  // Função de busca de empréstimos na API com base no role e nos parâmetros de busca
  const handleSearch = async (e, bookStatus, userId) => {
    e.preventDefault();

    try {
      let response;

      if (role === 'Cliente') {
        // Cliente busca por status
        if(bookStatus === 'todos') {
          response = await fetchAllLoansRequest(userId, role);
        } else {
          response = await getLoansByClientIdAndStatus(userId, bookStatus);
        }
      } else {
        // Funcionário/Admin busca por ID de solicitação, cliente ou livro
        const queryValue = e.target.querySelector('input').value; 
      
        response = await getLoansByQuery(searchType, queryValue);
      }

      setLoans(response);
      setErrorMessage(response.length === 0 ? 'Nenhum empréstimo encontrado com este status.' : '');
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      setErrorMessage('Erro ao buscar empréstimos.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false); // Fecha o modal
    setSelectedLoan(null); // Limpa os dados do empréstimo
  };

  const handleViewDetails = async (loan) => {
    try {
      const details = await fetchLoanDetailsById(loan.id);
      setSelectedLoan(details);

      const clientData = await fetchUserDetailsById(loan.idCliente);
      const employeeData = loan.idFuncionario ? await fetchUserDetailsById(loan.idFuncionario) : null;
      const bookData = await getBookById(loan.idBook);

      setClientDetails(clientData); // Armazena os detalhes do cliente
      setEmployeeDetails(employeeData); // Armazena os detalhes do funcionário (caso tenha)
      setBookDetails(bookData); // Armazena os detalhes do livro
      setShowModal(true);
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

  // Função para cancelar a solicitação
  const handleCancelRequest = async (loan) => {
    if (window.confirm("Tem certeza de que deseja cancelar esta solicitação de empréstimo?")) {
      try {
        await cancelLoan(loan.id);
        alert('Solicitação cancelada com sucesso.');
        // Atualize o estado das solicitações ou recarregue a lista, conforme necessário
        await fetchLoans();
      } catch (error) {
        console.error("Erro ao cancelar solicitação:", error);
        alert('Erro ao cancelar a solicitação. Tente novamente mais tarde.');
      }
    }
  };

  // Função para aprovar a solicitação (Funcionário/Admin)
const handleApproveRequest = async (loan) => {
  if (window.confirm("Tem certeza de que deseja aprovar esta solicitação de empréstimo?")) {
    try {
      await updateLoanRequestStatus(loan.id, userId, 'aprovado');
      alert('Solicitação aprovada com sucesso.');
      // Atualize o estado das solicitações ou recarregue a lista, conforme necessário
      await fetchLoans();
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error);
      alert('Erro ao aprovar a solicitação. Tente novamente mais tarde.');
    }
  }
};

// Função para reprovar a solicitação (Funcionário/Admin)
const handleRejectRequest = async (loan) => {
  if (window.confirm("Tem certeza de que deseja reprovar esta solicitação de empréstimo?")) {
    try {
      await updateLoanRequestStatus(loan.id, userId, 'reprovado');
      alert('Solicitação reprovada com sucesso.');
      // Atualize o estado das solicitações ou recarregue a lista, conforme necessário
      await fetchLoans();
    } catch (error) {
      console.error("Erro ao reprovar solicitação:", error);
      alert('Erro ao reprovar a solicitação. Tente novamente mais tarde.');
    }
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

  const renderActionButtons = (loan) => {
    return (
      <div>
        {/* Para Cliente */}
        {role === 'Cliente' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan)}>
              Visualizar Detalhes
            </button>
            <button
            className="btn btn-danger me-2"
            onClick={() => handleCancelRequest(loan)}
            disabled={loan.status !== 'pendente'} // Botão habilitado apenas se o status for "pending"
          >
            Cancelar Solicitação
          </button>
          </>
        )}

        {/* Para Funcionário */}
        {role === 'Funcionario' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan)}>
              Visualizar Detalhes
            </button>
            <button
            className="btn btn-danger me-2"
            onClick={() => handleCancelRequest(loan)}
            disabled={loan.status !== 'pendente'} // Botão habilitado apenas se o status for "pending"
          >
            Cancelar Solicitação
          </button>
          <button
            className="btn btn-success me-2"
            onClick={() => handleApproveRequest(loan)}
            disabled={loan.status !== 'pendente'} // Aprovar habilitado apenas se o status for "pending"
          >
            Aprovar Solicitação
          </button>
          <button
            className="btn btn-danger me-2"
            onClick={() => handleRejectRequest(loan)}
            disabled={loan.status !== 'pendente'} // Reprovar habilitado apenas se o status for "pending"
          >
            Reprovar Solicitação
          </button>
          </>
        )}

        {/* Para Administrador */}
        {role === 'Administrador' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan)}>
              Visualizar Detalhes
            </button>
            <button
            className="btn btn-danger me-2"
            onClick={() => handleCancelRequest(loan)}
            disabled={loan.status !== 'pendente'} // Botão habilitado apenas se o status for "pending"
          >
            Cancelar Solicitação
          </button>
          <button
            className="btn btn-success me-2"
            onClick={() => handleApproveRequest(loan)}
            disabled={loan.status !== 'pendente'} // Aprovar habilitado apenas se o status for "pending"
          >
            Aprovar Solicitação
          </button>
          <button
            className="btn btn-danger me-2 mt-2"
            onClick={() => handleRejectRequest(loan)}
            disabled={loan.status !== 'pendente'} // Reprovar habilitado apenas se o status for "pending"
          >
            Reprovar Solicitação
          </button>
          </>
        )}
      </div>
    );
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
      <div className="">
          <button onClick={fetchLoans} className="btn btn-secondary mb-3">Reiniciar listagem</button>
      </div>
      <form onSubmit={(e) => handleSearch(e, statusFilter, userId)} className="mb-4">
      <div className="input-group">
        {role === 'Cliente' ? (
          // Dropdown para Cliente selecionar o status
          <select
            className="form-select me-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
          </select>
        ) : (
          // Input e dropdown de tipo de busca para Funcionário/Admin
          <>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Digite o ID de solicitação, cliente ou livro"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select me-2"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="loanId">ID de Solicitação</option>
              <option value="clientId">ID do Cliente</option>
              <option value="bookId">ID do Livro</option>
            </select>
          </>
        )}
        <button type="submit" className="btn btn-primary">Buscar</button>
      </div>
    </form>

    {/* Mensagem de erro ou tabela de resultados */}
    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Livro</th>
              <th>Data da Solicitação de Empréstimo</th>
              <th>Funcionário</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentLoans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.idCliente}</td>
                <td>{loan.idBook}</td>
                <td>{loan.dataSolicitacao}</td>
                <td>{loan.idFuncionario ? loan.idFuncionario : 'N/A'}</td>
                <td>{loan.status}</td>
                <td>{renderActionButtons(loan)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} paginate={paginate} />

      {/* Modais para Detalhes, Edição e Adição */}
      {/* Modais reutilizáveis são análogos ao componente `ReservationManagement` */}
       {/* Modal de detalhes */}
       {showModal && selectedLoan && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes do Empréstimo</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>ID do Empréstimo:</strong> {selectedLoan.id}</p>
                <p><strong>Cliente:</strong> {clientDetails.name ? clientDetails.name : 'N/A'}</p>
                <p><strong>Livro:</strong> {bookDetails.title ? bookDetails.title : 'N/A'}</p>
                <p><strong>Data de Empréstimo:</strong> {selectedLoan.dataSolicitacao}</p>
                <p><strong>Funcionario:</strong> {employeeDetails ? employeeDetails.name : 'N/A'}</p>
                <p><strong>Status:</strong> {selectedLoan.status}</p>
                {/* Adicione mais campos conforme necessário */}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRequests;
