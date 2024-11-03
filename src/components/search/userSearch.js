import React, { useEffect, useState } from 'react';
import {
  fetchAllUsers, fetchUserByQuery, fetchUserDetailsById,
  updateUserDetails, addUser, inactivateUser, activateUser, updateCustomer, updateEmployee
} from '../../api/usersApi'; // Importando API para buscar detalhes dos usuários
import { Link, useNavigate } from 'react-router-dom';

const UserManagement = () => {
  // Estados de dados do componente no geral
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('');
  const [professionalPosition, setProfessionalPosition] = useState('');
  const [validatorId, setValidatorId] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [noResults, setNoResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', role: '', professionalPosition: '', address: '' });
  const [updateError, setUpdateError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: '', professionalPosition: '' });
  const [addError, setAddError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const isRoleRestricted = role === 'Administrador' || (role === 'Funcionario' && professionalPosition === 'gestor');

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const navigate = useNavigate();

  // Função para buscar todos os usuários
  const fetchUsers = async () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.role) {
      setRole(userData.role);
      setValidatorId(userData.id);
      if(userData.role === 'funcionario') {
        setProfessionalPosition(userData.professionalPosition);
      }
    }

    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      let searchedUsers;
      if (searchType === 'email') {
        searchedUsers = await fetchUserByQuery(searchQuery, 'email');
      } else {
        searchedUsers = await fetchUserByQuery(searchQuery, 'name');
      }

      setUsers(searchedUsers);
      setCurrentPage(1);

      if (searchedUsers.length === 0) {
        setNoResults(true);
      } else {
        setNoResults(false);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao buscar usuários');
    }
  };

  const handleBackToAllUsers = async () => {
    await fetchUsers();
    setNoResults(false);
  };

  const handleViewDetails = async (userId) => {
    try {
      const details = await fetchUserDetailsById(userId);
      setUserDetails(details);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error);
    }
  };

  const handleEditUser = async (user) => {
    try {
      setEditForm({ name: user.name, email: user.email, password: user.password, role: user.role, professionalPosition: user.professionalPosition, address: user.address });
      setUserDetails(user);
      setShowEditModal(true);
      setUpdateError('');
    } catch (error) {
      console.error("Erro ao iniciar edição do usuário:", error);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleConfirmEdit = async () => {
    try {
      if(editForm.role === 'Funcionario') {
        await updateEmployee(userDetails.id, editForm);
      } else {
        // Edita um cliente
        await updateCustomer(userDetails.id, editForm);
      }

      setShowEditModal(false);
      setEditForm({ name: '', email: '', password: '', professionalPosition: '', address: '' });
      setUpdateError('');
      await fetchUsers(); // Atualiza a lista de usuários
    } catch (error) {
      setUpdateError('Erro ao atualizar usuário.');
    }
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddError('');
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewUser({ name: '', email: '', password: '', role: '', professionalPosition: '' });
    setAddError('');
  };

  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
        setAddError('Preencha todos os campos.');
        return;
      }

      if(newUser.role === 'Funcionario' && !newUser.professionalPosition) {
        setAddError('Preencha todos os campos.');
        return;
      }

      await addUser(newUser, validatorId);
      await fetchUsers();
      handleCloseAddModal();
    } catch (error) {
      setAddError(error.message);
    }
  };

  const handleInactivateUser = async (userId) => {
    try {
      await inactivateUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error("Erro ao inativar o usuário:", error);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await activateUser(userId);
      await fetchUsers();
    } catch (error) {
      console.error("Erro ao ativar o usuário:", error);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setUserDetails(null);
  };

  const totalPages = Math.ceil(users.length / usersPerPage);

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

  const renderActionButtons = (user) => {
    return (
      <div>
        {role === 'Funcionario' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(user.id)}>
              Visualizar Detalhes
            </button>
            <button className="btn btn-primary me-2" onClick={() => handleEditUser(user)}>Editar</button>
            {user.active ? (
              <button className="btn btn-danger" onClick={() => handleInactivateUser(user.id)}>Inativar</button>
            ) : (
              <button className="btn btn-success" onClick={() => handleActivateUser(user.id)}>Ativar</button>
            )}
          </>
        )}

        {role === 'Administrador' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(user.id)}>
              Visualizar Detalhes
            </button>
            <button className="btn btn-primary me-2" onClick={() => handleEditUser(user)}>Editar</button>
            {user.active ? (
              <button className="btn btn-danger" onClick={() => handleInactivateUser(user.id)}>Inativar</button>
            ) : (
              <button className="btn btn-success" onClick={() => handleActivateUser(user.id)}>Ativar</button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
     <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <button onClick={handleBackToAllUsers} className="btn btn-secondary me-2">
          Reiniciar Listagem de Usuários
        </button>
        {(role === 'Administrador' || role === 'Funcionario') && (
          <button className="btn btn-success" onClick={handleOpenAddModal}>
            Cadastrar um novo Usuário
          </button>
        )}
      </div>
    </div>

      <h2 className="mb-4">Busca de Usuários</h2>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control me-2"
            style={{ flex: '1 0 70%' }}
            placeholder="Digite o nome ou email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="form-select me-2"
            style={{ flex: '0 0 20%' }}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">Nome</option>
            <option value="email">Email</option>
          </select>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </div>
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
        {noResults && <div className="alert alert-warning mt-3">
          Nenhum usuário encontrado.
          <div className="mt-3">
            <button onClick={handleBackToAllUsers} className="btn btn-secondary">Voltar para a listagem de usuários</button>
          </div>
          </div>}
      </form>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.active ? 'Ativo' : 'Inativo'}</td>
                <td>{renderActionButtons(user)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} paginate={paginate} />

      {/* Modais */}
      {/* Modal de Visualização de Detalhes */}
        {showDetailsModal && (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Detalhes do Usuário</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                <p>ID: {userDetails.id}</p>
                <p>Nome: {userDetails.name}</p>
                <p>Email: {userDetails.email}</p>
                <p>Role: {userDetails.role}</p>
                <p>Status: {userDetails.active ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Fechar
                </button>
                </div>
            </div>
            </div>
        </div>
        )}

      {/* Modal de Edição */}
     {showEditModal && (
    <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title">Editar Usuário</h5>
            <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <div className="modal-body">
            <form>
                <div className="mb-3">
                <label className="form-label">Nome</label>
                <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                />
                </div>
                <div className="mb-3">
                <label className="form-label">Senha</label>
                <input
                    type="text"
                    className="form-control"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditFormChange}
                />
                </div>
                {/* Cargo do funcionário (aparece somente se "Funcionário" for selecionado) */}
                {editForm.role === 'Funcionario' && (
                      <div className="mb-3">
                        <label className="form-label">Cargo</label>
                        <select
                          className="form-select"
                          name="professionalPosition"
                          value={editForm.professionalPosition}
                          onChange={handleEditFormChange}
                        >
                          <option value="assistente">Assistente</option>
                          <option value="analista">Analista</option>
                          <option value="gestor">Gestor</option>
                        </select>
                      </div>
                    )}
                    {editForm.role === 'Cliente' && (
                      <div className="mb-3">
                        <label className="form-label">Endereço</label>
                        <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={editForm.address}
                            onChange={handleEditFormChange}
                        />
                      </div>
                    )}
                {updateError && <div className="alert alert-danger">{updateError}</div>}
            </form>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmEdit}>
                Salvar Alterações
            </button>
            </div>
        </div>
        </div>
    </div>
    )}

      {/* Modal de Cadastro */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">Cadastrar Novo Usuário</h5>
                <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
                </div>
                <div className="modal-body">
                <form>
                    <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                    </div>
                    <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                    </div>
                    <div className="mb-3">
                    <label className="form-label">Senha</label>
                    <input
                        type="text"
                        className="form-control"
                        name="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Função do usuário</label>
                      <select
                        className="form-select"
                        name="role"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      >
                        <option value="">Selecione uma função</option>
                        {isRoleRestricted && <option value="Funcionario">Funcionário</option>}
                        <option value="Cliente">Cliente</option>
                      </select>
                    </div>
                    {/* Cargo do funcionário (aparece somente se "Funcionário" for selecionado) */}
                    {newUser.role === 'Funcionario' && (
                      <div className="mb-3">
                        <label className="form-label">Cargo</label>
                        <select
                          className="form-select"
                          name="professionalPosition"
                          value={newUser.professionalPosition}
                          onChange={(e) => setNewUser({ ...newUser, professionalPosition: e.target.value })}
                        >
                          <option value="">Selecione um cargo</option>
                          <option value="assistente">Assistente</option>
                          <option value="analista">Analista</option>
                          <option value="gestor">Gestor</option>
                        </select>
                      </div>
                    )}
                    {addError && <div className="alert alert-danger">{addError}</div>}
                </form>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal}>
                    Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={handleAddUser}>
                    Adicionar Usuário
                </button>
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};

export default UserManagement;
