import React, { useEffect, useState } from 'react';
import {
  fetchAllReservationsForReservations, fetchReservationByQueryForReservations, fetchReservationDetailsByIdForReservations,
  updateReservation, addReservation, cancelReseravtionForReservation, reactivateReservation, fetchReservationByCustomerIdAndStatusForReservations,
  convertReservationInLoan
} from '../../api/reservationsApi';
import { Link, useNavigate } from 'react-router-dom';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('reservationId');
  const [noResults, setNoResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ clientName: '', bookTitle: '', reservationDate: '', dueDate: '' });
  const [updateError, setUpdateError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReservation, setNewReservation] = useState({ clientName: '', bookTitle: '', reservationDate: '', dueDate: '' });
  const [addError, setAddError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reservationsPerPage] = useState(5);

   // Infos do usuário
   const [role, setRole] = useState('');
   const [userId, setUserId] = useState('');
    // Filtros de busca cliente
  const [statusFilter, setStatusFilter] = useState('todos'); // Para o cliente, por padrão 'Todos'

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();

  const fetchUserData = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.role) {
      setRole(userData.role);
      setUserId(userData.id);
    }
  }

  // Função para buscar todas as reservas
  const fetchReservations = async () => {
    try {
      const allReservations = await fetchAllReservationsForReservations(userId, role);
      setReservations(allReservations);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    }
  };

 
  useEffect(() => {
    // Primeira chamada para buscar dados do usuário e definir `userId` e `role`
    fetchUserData();
  }, []);

    // Segunda chamada para buscar empréstimos apenas quando `userId` e `role` são definidos
    useEffect(() => {
      if (userId && role) {
        fetchReservations();
      }
    }, [userId, role]);

    const handleSearch = async (event, statusFilter, userId) => {
      event.preventDefault();
      setErrorMessage('');
  
      try {
        let response;
        if(role === 'Cliente') {
          if(statusFilter === 'todos') {
            response = await fetchAllReservationsForReservations(userId, role);
          } else {
            response = await fetchReservationByCustomerIdAndStatusForReservations(userId, statusFilter);
          }
        } else {
          // Funcionario/admin buscão por id de solicitações e etc.
            // Funcionário/Admin busca por ID de solicitação, cliente ou livro
            const queryValue = event.target.querySelector('input').value; 
        
            response = await fetchReservationByQueryForReservations(searchType, queryValue);
        }
  
        setReservations(response);
        setErrorMessage(response.length === 0 ? 'Nenhuma reserva encontrada com este status.' : '');
      } catch (e) {
        setErrorMessage('Error ao buscar reservas');
      }
    };

  const handleViewDetails = async (reservationId) => {
    try {
      const details = await fetchReservationDetailsByIdForReservations(reservationId);
      setReservationDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da reserva:", error);
    }
  };

  const handleEditReservation = (reservation) => {
    setEditForm({
      clientName: reservation.clientName,
      bookTitle: reservation.bookTitle,
      reservationDate: reservation.reservationDate,
      dueDate: reservation.dueDate,
    });
    setReservationDetails(reservation);
    setShowEditModal(true);
    setUpdateError('');
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleConfirmEdit = async () => {
    try {
      await updateReservation(reservationDetails.id, editForm);
      setShowEditModal(false);
      setEditForm({ clientName: '', bookTitle: '', reservationDate: '', dueDate: '' });
      setUpdateError('');
      await fetchReservations(); // Atualiza a lista de reservas
    } catch (error) {
      setUpdateError('Erro ao atualizar reserva.');
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddError('');
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewReservation({ clientName: '', bookTitle: '', reservationDate: '', dueDate: '' });
    setAddError('');
  };

  const handleAddReservation = async () => {
    try {
      if (!newReservation.clientName || !newReservation.bookTitle || !newReservation.reservationDate || !newReservation.dueDate) {
        setAddError('Preencha todos os campos.');
        return;
      }
      await addReservation(newReservation);
      await fetchReservations();
      handleCloseAddModal();
    } catch (error) {
      setAddError(error.message);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm("Tem certeza de que deseja cancelar esta reserva?")) {
      try {
        await cancelReseravtionForReservation(reservationId);
        await fetchReservations();
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
      }
    }
  };

  const handleConvertReservation = async (reservationId) => {
    if (window.confirm("Tem certeza de que deseja transformar esta reserva em um emprestimo ?")) {
      try {
        await convertReservationInLoan(reservationId, userId);
        await fetchReservations();
      } catch (error) {
        console.error("Erro ao reativar reserva:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setReservationDetails(null);
  };

  const totalPages = Math.ceil(reservations.length / reservationsPerPage);

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

  const renderActionButtons = (reservation) => {
    return (
      <div>
        {/* Para Cliente */}
        {role === 'Cliente' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation.id)}>Detalhes</button>
            <button
            className="btn btn-danger me-2"
            onClick={() => handleCancelReservation(reservation.id)}
            disabled={reservation.status !== 'reservado'} // Reprovar habilitado apenas se o status for "reservado"
          >
            Cancelar reserva
          </button>
          </>
        )}

        {/* Para Funcionário */}
        {role === 'Funcionario' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation.id)}>Detalhes</button>
            <button
            className="btn btn-success me-2"
            onClick={() => handleConvertReservation(reservation.id)}
            disabled={reservation.status !== 'reservado'} // Aprovar habilitado apenas se o status for "pending"
          >
            Transformar em Emprestimo
          </button>
          <button
            className="btn btn-danger me-2"
            onClick={() => handleCancelReservation(reservation.id)}
            disabled={reservation.status !== 'reservado'} // Reprovar habilitado apenas se o status for "pending"
          >
            Cancelar reserva
          </button>
          </>
        )}

        {/* Para Administrador */}
        {role === 'Administrador' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation.id)}>Detalhes</button>
            <button
            className="btn btn-success me-2"
            onClick={() => handleConvertReservation(reservation.id)}
            disabled={reservation.status !== 'reservado'} // Aprovar habilitado apenas se o status for "reservado"
          >
            Transformar em Emprestimo
          </button>
          <button
            className="btn btn-danger me-2"
            onClick={() => handleCancelReservation(reservation.id)}
            disabled={reservation.status !== 'reservado'} // Reprovar habilitado apenas se o status for "reservado"
          >
            Cancelar reserva
          </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gerenciamento de Reservas</h2>
      <div className="">
          <button className="btn btn-secondary mb-3" onClick={fetchReservations}>Reiniciar listagem</button>
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
            <option value="reservado">Reservado</option>
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
              <option value="reservationId">ID de Solicitação</option>
              <option value="clientId">ID do Cliente</option>
              <option value="bookId">ID do Livro</option>
            </select>
          </>
        )}
          <button type="submit" className="btn btn-primary">Buscar</button>
        </div>
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        {noResults && <div className="alert alert-warning mt-3">Nenhuma reserva encontrada.</div>}
      </form>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Livro</th>
              <th>Data da Reserva</th>
              <th>Data de Devolução</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{reservation.customerId}</td>
                <td>{reservation.bookId}</td>
                <td>{reservation.dataAprovacao}</td>
                <td>{reservation.dataExpiracao}</td>
                <td>{reservation.status}</td>
                <td>
                <td>{renderActionButtons(reservation)}</td>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} paginate={paginate} />

      {/* Modais de Detalhes, Edição e Adição */}
      {showDetailsModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes da Reserva</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {reservationDetails.id}</p>
                <p><strong>Cliente:</strong> {reservationDetails.customerId}</p>
                <p><strong>Livro:</strong> {reservationDetails.bookId}</p>
                <p><strong>Data da Reserva:</strong> {reservationDetails.dataAprovacao}</p>
                <p><strong>Data de Devolução:</strong> {reservationDetails.dataExpiracao}</p>
                <p><strong>Status:</strong> {reservationDetails.status}</p>
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
                <h5 className="modal-title">Editar Reserva</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Cliente</label>
                    <input type="text" name="clientName" className="form-control" value={editForm.clientName} onChange={handleEditFormChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Livro</label>
                    <input type="text" name="bookTitle" className="form-control" value={editForm.bookTitle} onChange={handleEditFormChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data da Reserva</label>
                    <input type="date" name="reservationDate" className="form-control" value={editForm.reservationDate} onChange={handleEditFormChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data de Devolução</label>
                    <input type="date" name="dueDate" className="form-control" value={editForm.dueDate} onChange={handleEditFormChange} />
                  </div>
                </form>
                {updateError && <div className="alert alert-danger">{updateError}</div>}
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
                <h5 className="modal-title">Nova Reserva</h5>
                <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Cliente</label>
                    <input type="text" name="clientName" className="form-control" value={newReservation.clientName} onChange={(e) => setNewReservation({ ...newReservation, clientName: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Livro</label>
                    <input type="text" name="bookTitle" className="form-control" value={newReservation.bookTitle} onChange={(e) => setNewReservation({ ...newReservation, bookTitle: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data da Reserva</label>
                    <input type="date" name="reservationDate" className="form-control" value={newReservation.reservationDate} onChange={(e) => setNewReservation({ ...newReservation, reservationDate: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Data de Devolução</label>
                    <input type="date" name="dueDate" className="form-control" value={newReservation.dueDate} onChange={(e) => setNewReservation({ ...newReservation, dueDate: e.target.value })} />
                  </div>
                </form>
                {addError && <div className="alert alert-danger">{addError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleAddReservation}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
