import React, { useEffect, useState } from 'react';
import {
  fetchAllLoans, fetchLoanByQuery, fetchLoanDetailsById,
  updateLoanStatus, addLoanRequest, cancelLoanRequest, returnLoanBook,
  fetchloanDetailById, fetchLoanByCustomerIdAndStatus, getLoansByQueryInManagement
} from '../../api/loansApi';
import {
  fetchUserDetailsById
} from '../../api/usersApi';
import {
  getBookById
} from '../../api/booksApis';
import { Link, useNavigate } from 'react-router-dom';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('loanId');
  const [noResults, setNoResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loanDetails, setLoanDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ clientName: '', bookTitle: '', loanDate: '', dueDate: '', status: '' });
  const [updateError, setUpdateError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoanRequest, setNewLoanRequest] = useState({ clientName: '', bookTitle: '', loanDate: '', dueDate: '' });
  const [addError, setAddError] = useState('');
  // Informações para mostrar os detalhes
  const [clientDetails, setClientDetails] = useState(null); // Armazena os detalhes do cliente
  const [employeeDetails, setEmployeeDetails] = useState(null); // Armazena os detalhes do funcionário
  const [bookDetails, setBookDetails] = useState(null); // Armazena os detalhes do livro
  // Filtros de busca cliente
  const [statusFilter, setStatusFilter] = useState('todos'); // Para o cliente, por padrão 'Todos'
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [loansPerPage] = useState(5);

  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = loans.slice(indexOfFirstLoan, indexOfLastLoan);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
   // Infos do usuário
   const [role, setRole] = useState('');
   const [userId, setUserId] = useState('');

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
      const allLoans = await fetchAllLoans(userId, role);
      setLoans(allLoans || []);
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

  const handleSearch = async (e, bookStatus, userId) => {
    e.preventDefault();

    try {
      let response;
      if (role === 'Cliente') {
        // Cliente busca por status
        if(bookStatus === 'todos') {
          response = await fetchAllLoans(userId, role);
        } else {
          response = await fetchLoanByCustomerIdAndStatus(userId, bookStatus);
        }
      } else {
        // Funcionário/Admin busca por ID de solicitação, cliente ou livro
        const queryValue = e.target.querySelector('input').value; 
      
        response = await getLoansByQueryInManagement(searchType, queryValue);
      }

      setLoans(response);
      setErrorMessage(response.length === 0 ? 'Nenhum empréstimo encontrado com este status.' : '');
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      setErrorMessage('Erro ao buscar empréstimos.');
    }
  };

  const handleViewDetails = async (loan) => {
    try {
      console.log(loan);
      const details = await fetchloanDetailById(loan.id);

      const clientData = await fetchUserDetailsById(loan.idCliente);
      const employeeData = loan.idFuncionario ? await fetchUserDetailsById(loan.idFuncionario) : null;
      const bookData = await getBookById(loan.idLivro);

      
      setClientDetails(clientData); // Armazena os detalhes do cliente
      setEmployeeDetails(employeeData); // Armazena os detalhes do funcionário (caso tenha)
      setBookDetails(bookData); // Armazena os detalhes do livro
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
      status: loan.status
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
      await updateLoanStatus(loanDetails.id, editForm);
      setShowEditModal(false);
      setEditForm({ clientName: '', bookTitle: '', loanDate: '', dueDate: '', status: '' });
      setUpdateError('');
      await fetchLoans(); // Atualiza a lista de empréstimos
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
    setNewLoanRequest({ clientName: '', bookTitle: '', loanDate: '', dueDate: '' });
    setAddError('');
  };

  const handleAddLoanRequest = async () => {
    try {
      if (!newLoanRequest.clientName || !newLoanRequest.bookTitle || !newLoanRequest.loanDate || !newLoanRequest.dueDate) {
        setAddError('Preencha todos os campos.');
        return;
      }
      await addLoanRequest(newLoanRequest);
      await fetchLoans();
      handleCloseAddModal();
    } catch (error) {
      setAddError(error.message);
    }
  };

  const handleCancelLoanRequest = async (loanId) => {
    try {
      await cancelLoanRequest(loanId);
      await fetchLoans();
    } catch (error) {
      console.error("Erro ao cancelar empréstimo:", error);
    }
  };

  const handleReturnLoanBook = async (loan) => {
    if (window.confirm("Tem certeza de que deseja retornar este empréstimo?")) {
      try {
        await returnLoanBook(loan.id);
        alert('Emprestimo devolvido com sucesso.');
        await fetchLoans();
      } catch (error) {
        console.error("Erro ao devolver livro:", error);
        alert('Houve um error ao realizar a devolução do emprestimo.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setLoanDetails(null);
  };

  const renderActionButtons = (loan) => {
    return (
      <div>
        {/* Para Cliente */}
        {role === 'Cliente' && (
          <>
              <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan)}>Detalhes</button>
          </>
        )}

        {/* Para Funcionário */}
        {role === 'Funcionario' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan)}>Detalhes</button>
            <button
            className="btn btn-success me-2"
            onClick={() => handleReturnLoanBook(loan)}
            disabled={loan.status !== 'ativo' && loan.status !== 'expirado'} // Aprovar habilitado apenas se o status for "pending"
          >
            Devolver emprestimo
          </button>
          </>
        )}

        {/* Para Administrador */}
        {role === 'Administrador' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan)}>Detalhes</button>
            <button
            className="btn btn-success me-2"
            onClick={() => handleReturnLoanBook(loan)}
            disabled={loan.status !== 'ativo' && loan.status !== 'expirado'}
          >
            Devolver emprestimo
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
      <h2 className="mb-4">Gerenciamento de Empréstimo</h2>
      <div className="">
          <button className="btn btn-secondary mb-3" onClick={fetchLoans}>Reiniciar listagem</button>
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
            <option value="ativo">Ativo</option>
            <option value="expirado">expirado</option>
            <option value="devolvido">Devolvido</option>
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
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        {noResults && <div className="alert alert-warning mt-3">Nenhuma solicitação encontrada.</div>}
      </form>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Id do Cliente</th>
              <th>Id do Livro</th>
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
                <td>{loan.idCliente}</td>
                <td>{loan.idLivro}</td>
                <td>{loan.dataAprovacao}</td>
                <td>{loan.dataDevolucaoEstimada	}</td>
                <td>{loan.status}</td>
                <td>{renderActionButtons(loan)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <Pagination totalPages={totalPages} paginate={paginate} />}

      {showDetailsModal && loanDetails && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes da Solicitação</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {loanDetails.id}</p>
                <p><strong>Cliente:</strong> {clientDetails.name}</p>
                <p><strong>Livro:</strong> {bookDetails.title}</p>
                <p><strong>Data do Empréstimo:</strong> {loanDetails.dataAprovacao}</p>
                <p><strong>Data de Devolução:</strong> {loanDetails.dataDevolucaoEstimada	}</p>
                <p><strong>Status:</strong> {loanDetails.status}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Solicitação de Empréstimo</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Cliente</label>
                    <input
                      type="text"
                      name="clientName"
                      className="form-control"
                      value={editForm.clientName}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Livro</label>
                    <input
                      type="text"
                      name="bookTitle"
                      className="form-control"
                      value={editForm.bookTitle}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data do Empréstimo</label>
                    <input
                      type="date"
                      name="loanDate"
                      className="form-control"
                      value={editForm.loanDate}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data de Devolução</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="form-control"
                      value={editForm.dueDate}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Aprovado">Aprovado</option>
                      <option value="Devolvido">Devolvido</option>
                    </select>
                  </div>
                  {updateError && <div className="alert alert-danger">{updateError}</div>}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmEdit}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nova Solicitação de Empréstimo</h5>
                <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Cliente</label>
                    <input
                      type="text"
                      name="clientName"
                      className="form-control"
                      value={newLoanRequest.clientName}
                      onChange={(e) => setNewLoanRequest({ ...newLoanRequest, clientName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Livro</label>
                    <input
                      type="text"
                      name="bookTitle"
                      className="form-control"
                      value={newLoanRequest.bookTitle}
                      onChange={(e) => setNewLoanRequest({ ...newLoanRequest, bookTitle: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data do Empréstimo</label>
                    <input
                      type="date"
                      name="loanDate"
                      className="form-control"
                      value={newLoanRequest.loanDate}
                      onChange={(e) => setNewLoanRequest({ ...newLoanRequest, loanDate: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data de Devolução</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="form-control"
                      value={newLoanRequest.dueDate}
                      onChange={(e) => setNewLoanRequest({ ...newLoanRequest, dueDate: e.target.value })}
                    />
                  </div>
                  {addError && <div className="alert alert-danger">{addError}</div>}
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleAddLoanRequest}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;
