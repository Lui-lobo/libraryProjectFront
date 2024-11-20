import React, { useEffect, useState } from 'react';
import {
  fetchAllReservations, fetchReservationByQuery, fetchReservationDetailsById,
  updateReservation, addReservation, cancelReservation, reactivateReservation,
  fetchReservationByCustomerIdAndStatus, updateReservationRequestStatus
} from '../../api/reservationsApi';
import {
  fetchUserDetailsById
} from '../../api/usersApi';
import {
  getBookById
} from '../../api/booksApis';
import { Link, useNavigate, useRouteError } from 'react-router-dom';

const ReservationRequest = () => {
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

  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();
   // Infos do usuário
   const [role, setRole] = useState('');
   const [userId, setUserId] = useState('');
     // Informações para mostrar os detalhes
  const [clientDetails, setClientDetails] = useState(null); // Armazena os detalhes do cliente
  const [bookDetails, setBookDetails] = useState(null); // Armazena os detalhes do livro
  // Filtros de busca cliente
  const [statusFilter, setStatusFilter] = useState('todos'); // Para o cliente, por padrão 'Todos'

   // Função para buscar todos os empréstimos
  const fetchUserData = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.role) {
      setRole(userData.role);
      setUserId(userData.id);
    }
  }

  const fetchReservations = async () => {
    try {
      const allReservations = await fetchAllReservations(userId, role);
      setReservations(allReservations);
    } catch (error) {
      console.log("Erro ao buscar reservas:", error);
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
          response = await fetchAllReservations(userId, role);
        } else {
          response = await fetchReservationByCustomerIdAndStatus(userId, statusFilter);
        }
      } else {
        // Funcionario/admin buscão por id de solicitações e etc.
          // Funcionário/Admin busca por ID de solicitação, cliente ou livro
          const queryValue = event.target.querySelector('input').value; 
      
          response = await fetchReservationByQuery(searchType, queryValue);
      }

      setReservations(response);
      setErrorMessage(response.length === 0 ? 'Nenhuma reserva encontrada com este status.' : '');
    } catch (e) {
      setErrorMessage('Error ao buscar reservas');
    }
  };

  const handleViewDetails = async (reservation) => {
    try {
      const details = await fetchReservationDetailsById(reservation.id);

      const clientData = await fetchUserDetailsById(reservation.customerId);
      const bookData = await getBookById(reservation.bookId);

      setClientDetails(clientData); // Armazena os detalhes do cliente
      setBookDetails(bookData); // Armazena os detalhes do livro

      setReservationDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da reserva:", error);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm("Tem certeza de que deseja cancelar esta solicitação de reserva?")) {
      try {
        await cancelReservation(reservationId);
        await fetchReservations();
      } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
      }
    }
  };

    // Função para aprovar a solicitação (Funcionário/Admin)
  const handleApproveRequest = async (reservation) => {
    if (window.confirm("Tem certeza de que deseja aprovar esta solicitação de reserva?")) {
      try {
        await updateReservationRequestStatus(reservation.id, userId, 'aprovado');
        alert('Solicitação aprovada com sucesso.');
        // Atualize o estado das solicitações ou recarregue a lista, conforme necessário
        await fetchReservations();
      } catch (error) {
        console.error("Erro ao aprovar solicitação:", error);
        alert('Erro ao aprovar a solicitação. Tente novamente mais tarde.');
      }
    }
  };

  // Função para reprovar a solicitação (Funcionário/Admin)
  const handleRejectRequest = async (reservation) => {
    if (window.confirm("Tem certeza de que deseja reprovar esta solicitação de reserva?")) {
      try {
        await updateReservationRequestStatus(reservation.id, userId, 'reprovado');
        alert('Solicitação reprovada com sucesso.');
        // Atualize o estado das solicitações ou recarregue a lista, conforme necessário
        await fetchReservations();
      } catch (error) {
        console.error("Erro ao reprovar solicitação:", error);
        alert('Erro ao reprovar a solicitação. Tente novamente mais tarde.');
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
             <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation)}>Detalhes</button>
             <button
              className="btn btn-danger me-2"
              onClick={() => handleCancelReservation(reservation.id)}
              disabled={reservation.status !== 'pendente'} // Botão habilitado apenas se o status for "pending"
            >
              Cancelar Solicitação
            </button>
          </>
        )}

        {/* Para Funcionário */}
        {role === 'Funcionario' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation)}>Detalhes</button>
            <button
              className="btn btn-danger me-2"
              onClick={() => handleCancelReservation(reservation.id)}
              disabled={reservation.status !== 'pendente'} // Botão habilitado apenas se o status for "pending"
            >
              Cancelar Solicitação
            </button>
            <button
            className="btn btn-success me-2"
            onClick={() => handleApproveRequest(reservation)}
            disabled={reservation.status !== 'pendente'} // Aprovar habilitado apenas se o status for "pending"
          >
            Aprovar Solicitação
          </button>
          <button
            className="btn btn-danger me-2"
            onClick={() => handleRejectRequest(reservation)}
            disabled={reservation.status !== 'pendente'} // Reprovar habilitado apenas se o status for "pending"
          >
            Reprovar Solicitação
          </button>
          </>
        )}

        {/* Para Administrador */}
        {role === 'Administrador' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(reservation)}>Detalhes</button>
            <button
              className="btn btn-danger me-2"
              onClick={() => handleCancelReservation(reservation.id)}
              disabled={reservation.status !== 'pendente'} // Botão habilitado apenas se o status for "pending"
            >
              Cancelar Solicitação
            </button>
            <button
            className="btn btn-success me-2"
            onClick={() => handleApproveRequest(reservation)}
            disabled={reservation.status !== 'pendente'} // Aprovar habilitado apenas se o status for "pending"
          >
            Aprovar Solicitação
          </button>
          <button
            className="btn btn-danger me-2"
            onClick={() => handleRejectRequest(reservation)}
            disabled={reservation.status !== 'pendente'} // Reprovar habilitado apenas se o status for "pending"
          >
            Reprovar Solicitação
          </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="">
          <button className="btn btn-secondary mb-3" onClick={fetchReservations}>Reiniciar listagem</button>
      </div>
      <h2 className="mb-4">Gerenciamento de solicitações de Reservas</h2>
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
            <option value="pendente">Pendente</option>
            <option value="reprovado">Reprovado</option>
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
                <td>{reservation.dataSolicitacao}</td>
                <td>{reservation.status}</td>
                <td>{renderActionButtons(reservation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} paginate={paginate} />

      {/* Modais para Detalhes, Edição e Adição */}
      {/* Modais reutilizáveis são análogos ao componente `LoanRequests` */}
      {showDetailsModal && reservationDetails && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes da Solicitação</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {reservationDetails.id}</p>
                <p><strong>Cliente:</strong> {clientDetails.name}</p>
                <p><strong>Livro:</strong> {bookDetails.title}</p>
                <p><strong>Data da solicitação de reserva:</strong> {reservationDetails.dataSolicitacao}</p>
                <p><strong>Status:</strong> {reservationDetails.status}</p>
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

export default ReservationRequest;
