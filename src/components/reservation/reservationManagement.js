import React, { useEffect, useState } from 'react';
import {
  fetchAllReservations, fetchReservationByQuery, fetchReservationDetailsById,
  updateReservation, addReservation, cancelReservation, reactivateReservation
} from '../../api/reservationsApi';
import { Link, useNavigate } from 'react-router-dom';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('clientName');
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

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();

  // Função para buscar todas as reservas
  const fetchReservations = async () => {
    try {
      const allReservations = await fetchAllReservations();
      setReservations(allReservations);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      let searchedReservations;
      if (searchType === 'clientName') {
        searchedReservations = await fetchReservationByQuery(searchQuery, 'clientName');
      } else {
        searchedReservations = await fetchReservationByQuery(searchQuery, 'bookTitle');
      }

      setReservations(searchedReservations);
      setCurrentPage(1);

      if (searchedReservations.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao buscar reservas');
    }
  };

  const handleViewDetails = async (reservationId) => {
    try {
      const details = await fetchReservationDetailsById(reservationId);
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
    try {
      await cancelReservation(reservationId);
      await fetchReservations();
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    }
  };

  const handleReactivateReservation = async (reservationId) => {
    try {
      await reactivateReservation(reservationId);
      await fetchReservations();
    } catch (error) {
      console.error("Erro ao reativar reserva:", error);
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

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gerenciamento de Reservas</h2>
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
                <td>{reservation.clientName}</td>
                <td>{reservation.bookTitle}</td>
                <td>{reservation.reservationDate}</td>
                <td>{reservation.dueDate}</td>
                <td>{reservation.active ? 'Ativa' : 'Cancelada'}</td>
                <td>
                  <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation.id)}>Detalhes</button>
                  <button className="btn btn-primary me-2" onClick={() => handleEditReservation(reservation)}>Editar</button>
                  {reservation.active ? (
                    <button className="btn btn-danger" onClick={() => handleCancelReservation(reservation.id)}>Cancelar</button>
                  ) : (
                    <button className="btn btn-success" onClick={() => handleReactivateReservation(reservation.id)}>Reativar</button>
                  )}
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
                <p><strong>Cliente:</strong> {reservationDetails.clientName}</p>
                <p><strong>Livro:</strong> {reservationDetails.bookTitle}</p>
                <p><strong>Data da Reserva:</strong> {reservationDetails.reservationDate}</p>
                <p><strong>Data de Devolução:</strong> {reservationDetails.dueDate}</p>
                <p><strong>Status:</strong> {reservationDetails.active ? 'Ativa' : 'Cancelada'}</p>
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
