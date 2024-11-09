import React, { useEffect, useState } from 'react';
import {
  fetchAllLoans, fetchLoanByQuery, fetchLoanDetailsById,
  updateLoanStatus, addLoanRequest, cancelLoanRequest, returnLoanBook
} from '../../api/loansApi';
import { Link, useNavigate } from 'react-router-dom';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('clientName');
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
  const [currentPage, setCurrentPage] = useState(1);
  const [loansPerPage] = useState(5);

  const indexOfLastLoan = currentPage * loansPerPage;
  const indexOfFirstLoan = indexOfLastLoan - loansPerPage;
  const currentLoans = loans.slice(indexOfFirstLoan, indexOfLastLoan);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();

  // Função para buscar todas as solicitações de empréstimo
  const fetchLoans = async () => {
    try {
      const allLoans = await fetchAllLoans();
      setLoans(allLoans);
    } catch (error) {
      console.error("Erro ao buscar empréstimos:", error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

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

  const handleReturnLoanBook = async (loanId) => {
    try {
      await returnLoanBook(loanId);
      await fetchLoans();
    } catch (error) {
      console.error("Erro ao devolver livro:", error);
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
      <h2 className="mb-4">Gerenciamento de Solicitações de Empréstimo</h2>
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
        {noResults && <div className="alert alert-warning mt-3">Nenhuma solicitação encontrada.</div>}
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
                <td>{loan.status}</td>
                <td>
                  <button className="btn btn-info me-2" onClick={() => handleViewDetails(loan.id)}>Detalhes</button>
                  <button className="btn btn-primary me-2" onClick={() => handleEditLoan(loan)}>Editar</button>
                  {loan.status === 'Aprovado' && (
                    <button className="btn btn-success" onClick={() => handleReturnLoanBook(loan.id)}>Devolver</button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleCancelLoanRequest(loan.id)}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <Pagination totalPages={totalPages} paginate={paginate} />}

      <button className="btn btn-primary mt-4" onClick={handleOpenAddModal}>Nova Solicitação de Empréstimo</button>

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
                <p><strong>Cliente:</strong> {loanDetails.clientName}</p>
                <p><strong>Livro:</strong> {loanDetails.bookTitle}</p>
                <p><strong>Data do Empréstimo:</strong> {loanDetails.loanDate}</p>
                <p><strong>Data de Devolução:</strong> {loanDetails.dueDate}</p>
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
