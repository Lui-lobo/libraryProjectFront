import React, { useEffect, useState } from 'react';
import { 
   fetchAllBooksOnCollection, fetchBooksByQuery, fetchBookDetailsByIsbn,
   updateBookDetails, addBook, inactivateBook, activateBook, updateBookQuantity,
   reserveBookForCliente, loanBookForCliente 
} from '../../api/booksApis'; // Importando API para buscar detalhes
import { Link, useNavigate } from 'react-router-dom';

const ClientHome = () => {
  // Estados de dados do componente no geral
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [noResults, setNoResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookDetails, setBookDetails] = useState(null); // Estado para armazenar os detalhes do livro
  // Estados de edição
  const [showEditModal, setShowEditModal] = useState(false); // Estado para modal de edição
  const [editForm, setEditForm] = useState({ title: '', author: '', isbn: '', genre: '' }); // Estado do formulário de edição
  const [updateError, setUpdateError] = useState('');
  // Estados de edição de quantidade de livro
  const [showEditQuantityModal, setShowEditQuantityModal] = useState(false);
  const [editQuantity, setEditQuantity] = useState(0);
  const [quantityError, setQuantityError] = useState('');
  // Estados de adição
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    copies: 0
  });
  const [addError, setAddError] = useState('');
  // Estados de reserva
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationBook, setReservationBook] = useState(null);
  const [reservationUserId, setReservationUserId] = useState(null);
  // Estado para mostrar/ocultar o modal de confirmação de empréstimo
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanBook, setLoanBook] = useState(null);
  const [loanUserId, setLoanUserId] = useState(null);
  // Logica de paginação
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [booksPerPage] = useState(2); // Número de livros por página

  // Cálculo de livros por página
const indexOfLastBook = currentPage * booksPerPage;
const indexOfFirstBook = indexOfLastBook - booksPerPage;
const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
const paginate = (pageNumber) => setCurrentPage(pageNumber);

 const navigate = useNavigate();

  // Funções de busca
// Função para buscar os livros
const fetchBooks = async () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  if (userData && userData.role) {
    setRole(userData.role);
    setUserId(userData.id);
  }

  try {
    const allBooks = await fetchAllBooksOnCollection();
    setBooks(allBooks);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
  }
};

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');
  
    try {
      let searchedBooks;
      if (searchType === 'isbn') {
        searchedBooks = await fetchBooksByQuery(searchQuery, 'isbn');
      } else if (searchType === 'author') {
        searchedBooks = await fetchBooksByQuery(searchQuery, 'author');
      } else {
        searchedBooks = await fetchBooksByQuery(searchQuery, 'title');
      }
      
      setBooks(searchedBooks);
      setCurrentPage(1); // Redefinir para a primeira página após a busca
  
      if (searchedBooks.length === 0) {
        setNoResults(true);
      } else {
        setBooks(searchedBooks);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Erro ao buscar livros');
    }
  };

  const handleBackToAllBooks = async () => {
    const allBooks = await fetchAllBooksOnCollection();
    setBooks(allBooks);
    setNoResults(false);
  };

  const handleViewDetails = async (bookIsbn) => {
    try {
      const details = await fetchBookDetailsByIsbn(bookIsbn); // Chamada à API para buscar detalhes
      setBookDetails(details);
      setShowDetailsModal(true); // Exibe o modal ao obter detalhes
    } catch (error) {
      console.error("Erro ao buscar detalhes do livro:", error);
    }
  };

  // Funções de edição
  const handleEditBook = async (book) => {
    try {
      setEditForm({ title: book.title, author: book.author, isbn: book.isbn, genre: book.genre });
      setBookDetails(book);
      setShowEditModal(true);
      setUpdateError(''); // Limpa a mensagem de erro ao fechar o modal
    } catch (error) {
      console.error("Erro ao iniciar edição do livro:", error);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleConfirmEdit = async () => {
    try {
      await updateBookDetails(bookDetails.id, editForm); // API para enviar edição
      setShowEditModal(false);
      setEditForm({ title: '', author: '', isbn: '', genre: '' });
      setUpdateError(''); // Limpa a mensagem de erro em caso de sucesso
      // Atualiza a lista de livros com as alterações
      const updatedBooks = books.map((book) => 
        book.book.id === bookDetails.id ? { ...book, book: { ...book.book, ...editForm } } : book
      );
      setBooks(updatedBooks);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            setUpdateError(error.response.data.message || 'ISBN já está em uso.'); // Captura a mensagem de erro do servidor
          } else {
            setUpdateError('Erro ao atualizar livro.'); // Mensagem genérica de erro
          }
    }
  };

  const handleEditQuantity = (collection) => {
    setEditQuantity(collection.availableCopies); // Define a quantidade atual
    setBookDetails(collection); // Armazena os detalhes do livro
    setShowEditQuantityModal(true); // Abre o modal de edição
    setQuantityError(''); // Limpa qualquer erro anterior
  };

  const handleConfirmEditQuantity = async () => {
    if (editQuantity < 0) {
      setQuantityError('A quantidade não pode ser negativa.');
      return;
    }

    try {
      const updatedBook = { availableCopies: editQuantity };
      await updateBookQuantity(bookDetails.id, updatedBook);
      setShowEditQuantityModal(false);
      // Atualiza a lista de livros localmente
      const updatedBooks = books.map((book) =>
        book.book.id === bookDetails.id ? { ...book, availableCopies: editQuantity } : book
      );
      setBooks(updatedBooks);
    } catch (error) {
      setQuantityError('Erro ao atualizar quantidade.'); // Mensagem genérica de erro
    }
  };

  // Funções de adição
  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setAddError(''); // Limpa o erro ao abrir o modal
  };
  
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      publishedYear: '',
      genre: '',
      copies: 0
    });
    setAddError(''); // Limpa o erro ao fechar o modal
  };

  const handleAddBook = async () => {
    try {
      // Validação simples dos campos
      if (!newBook.title || !newBook.author || !newBook.isbn || !newBook.genre || !newBook.publishedYear || !newBook.copies) {
        setAddError('Preencha todos os campos.');
        return;
      }

      // Converte a data de publicação para milissegundos
      const publicationDate = new Date(newBook.publicationYear);
      const publicationTimeInMs = publicationDate.getTime();
      newBook.publishedYear = publicationTimeInMs;
  
      // Chamada para a API de cadastro de livros usando a função importada
      await addBook(newBook);
  
      // Atualiza a lista de livros após o cadastro
      await fetchBooks();
  
      handleCloseAddModal(); // Fecha o modal ao cadastrar com sucesso
    } catch (error) {
      setAddError(error.message);
    }
  };

  // Função para inativar um livro
  const handleInactivateBook = async (bookId) => {
    try {
      await inactivateBook(bookId);
      // Atualiza a lista de livros após a inativação
      await fetchBooks(); 
    } catch (error) {
      console.error("Erro ao inativar o livro:", error);
    }
  };

  const handleActivateBook = async (bookId) => {
    try {
      await activateBook(bookId);
      // Atualiza a lista de livros após a inativação
      await fetchBooks(); 
    } catch (error) {
      console.error("Erro ao inativar o livro:", error);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setBookDetails(null);
  };

  
// Função para abrir o modal de reserva
const handleOpenReservationModal = (book) => {
  setReservationBook(book);  // Armazena o livro selecionado
  setReservationUserId(userId);  // Armazena o ID do usuário
  setShowReservationModal(true);
};

// Função para fechar o modal de reserva
const handleCloseReservationModal = () => {
  setShowReservationModal(false);
  setReservationBook(null);  // Armazena o livro selecionado
  setReservationUserId(null);  // Armazena o ID do usuário
};

const handleConfirmReservation = async (book, userId) => {
  try {
    if (!book || !userId) {
      throw new Error("Faltando informações para realizar a solicitação.");
    }
    console.log("Livro:", book, "Usuário:", userId);
    await reserveBookForCliente(book.id, userId);
    // Lógica para lidar com sucesso da reserva (exibir mensagem ou atualizar estado)
    alert('Solicitação de Reserva realizada com sucesso!');
  } catch (error) {
    // Lógica para lidar com erro na reserva
    alert('Erro ao realizar a solicitação de reserva: ' + error.message);
  } finally {
    // Fechar o modal após tentativa de reserva
    setReservationBook(null);  // Limpa o estado do livro
    setReservationUserId(null);  // Limpa o estado do usuário
    fetchBooks();
    handleCloseReservationModal();
  }
};

  // Função para abrir o modal de confirmação de empréstimo
  const handleOpenLoanModal = (book) => {
    setLoanBook(book);  // Armazena o livro selecionado
    setLoanUserId(userId);  // Armazena o ID do usuário
    setShowLoanModal(true);
  };

  // Função para fechar o modal de confirmação de empréstimo
  const handleCloseLoanModal = () => {
    setShowLoanModal(false);
    setLoanBook(null);  // Limpa o estado do livro
    setLoanUserId(null);  // Limpa o estado do usuário
  };

  // Função para chamar a API de solicitação de empréstimo
  const handleConfirmLoan = async (book, userId) => {
    try {
      if (!book || !userId) {
        throw new Error("Faltando informações para realizar a solicitação.");
      }
      console.log("Livro:", book, "Usuário:", userId);
      await loanBookForCliente(book.id, userId);
      // Aqui você faria a chamada da API para registrar a solicitação de empréstimo
      alert('Solicitação de Empréstimo realizada com sucesso!');
    } catch (error) {
      alert('Erro ao realizar a solicitação de empréstimo: ' + error.message);
    } finally {
      setLoanBook(null);  // Limpa o estado do livro
      setLoanUserId(null);  // Limpa o estado do usuário
      fetchBooks();
      handleCloseLoanModal();  // Fecha o modal
    }
  };


  const totalPages = Math.ceil(books.length / booksPerPage);

  const Pagination = ({ totalPages, paginate }) => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map(number => (
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

  const renderActionButtons = (book) => {
    return (
      <div>
        {(role === 'Cliente' ) && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(book.isbn)}>
              Visualizar Detalhes
            </button>
            <button
              className={`btn ${book.availableCopies <= 0 ? 'btn-secondary' : 'btn-success'} me-2`}
              onClick={() => handleOpenReservationModal(book)}
              disabled={book.availableCopies <= 0}
            >
              Solicitar Reserva
            </button>
            <button
              className={`btn ${book.availableCopies <= 0 ? 'btn-secondary' : 'btn-warning'}`}
              onClick={() => handleOpenLoanModal(book)}
              disabled={book.availableCopies <= 0}
            >
              Solicitar Empréstimo
            </button>
          </>
        )}

        {(role === 'Funcionario') && (
            <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(book.isbn)}>
              Visualizar Detalhes
            </button>
            <button className="btn btn-success me-2">Reservar para cliente</button>
            <button className="btn btn-warning">Solicitar Empréstimo para cliente</button>
            {book.active ? (
              <button className="btn btn-danger" onClick={() => handleInactivateBook(book.id)}>Inativar</button>
            ) : (
              <button className="btn btn-success" onClick={() => handleActivateBook(book.id)}>Ativar</button>
            )}
            </>
        )}

        {role === 'Administrador' && (
          <>
            <button className="btn btn-info me-2" onClick={() => handleViewDetails(book.isbn)}>
              Visualizar Detalhes
            </button>
            <button className="btn btn-primary me-2"  onClick={() => handleEditBook(book)}>Editar</button>
            <button className="btn btn-secondary me-2" onClick={() => handleEditQuantity(book)}>Editar Quantidade Disponível</button> {/* Novo botão */}
            {book.active ? (
              <button className="btn btn-danger" onClick={() => handleInactivateBook(book.id)}>Inativar</button>
            ) : (
              <button className="btn btn-success" onClick={() => handleActivateBook(book.id)}>Ativar</button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      {/* Exibir botão de cadastrar livros apenas para funcionários e administradores */}
      <div className="d-flex align-items-center mb-3">
          <div className="">
            <button onClick={handleBackToAllBooks} className="btn btn-secondary">Reiniciar listagem</button>
          </div>
          {(role === 'Administrador' || role === 'Funcionario') && (
            <button className="btn btn-success" onClick={handleOpenAddModal}>
              Cadastrar um novo Livro
            </button>
          )}
      </div>
 
      <h2 className="mb-4">Busca de Livros</h2>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control me-2"
            style={{ flex: '1 0 70%' }}
            placeholder="Digite o título, autor ou ISBN"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="form-select me-2"
            style={{ flex: '0 0 20%' }}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="title">Título</option>
            <option value="author">Autor</option>
            <option value="isbn">ISBN</option>
          </select>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </div>
        {errorMessage && <div className="alert alert-danger mt-2">{errorMessage}</div>}
      </form>

      {noResults ? (
        <div className="alert alert-info">
          Sua pesquisa não retornou nenhum resultado.<br />
          Verifique se você digitou as palavras corretamente ou tente novamente mais tarde.
          <div className="mt-3">
            <button onClick={handleBackToAllBooks} className="btn btn-secondary">Voltar para todos os livros</button>
          </div>
        </div>
      ) : (
        <div>
        <h2>Livros Encontrados</h2>
        <ul className="list-group">
          {currentBooks.map((collection) => (
            <li key={collection.book.id} className="list-group-item">
              <p>{collection.book.title}</p>
              <p>Autor: {collection.book.author}</p>
              <p>ISBN: {collection.book.isbn}</p>
              <p>Quantidade disponível: {collection.book.availableCopies = collection.availableCopies}</p>

              {/* Renderiza os botões de ação */}
              {renderActionButtons(collection.book)}
            </li>
          ))}
        </ul>
        {/* Renderiza os botões de paginação */}
        <Pagination totalPages={totalPages} paginate={paginate} />
      </div>
      )}
      

        {/* Modal para exibir edição do livro */}
        {showEditModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Livro</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div>
                  <h6>ID: {bookDetails.id}</h6>
                  <label>Título:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditFormChange}
                  />
                  <label>Autor:</label>
                  <input
                    type="text"
                    className="form-control"
                    name="author"
                    value={editForm.author}
                    onChange={handleEditFormChange}
                  />
                    <label>ISBN: </label>
                    <input
                    type="text"
                    className="form-control"
                    name="isbn"
                    value={editForm.isbn}
                    onChange={handleEditFormChange}
                  />
                    <label>Genero: </label>
                    <input
                    type="text"
                    className="form-control"
                    name="genre"
                    value={editForm.genre}
                    onChange={handleEditFormChange}
                  />
                  {/* Outros campos de edição aqui */}
                </div>
                {updateError && <div className="alert alert-danger">{updateError}</div>}
              </div>
             
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmEdit}>
                  Confirmar Edição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para exibir detalhes do livro */}
      {showDetailsModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes do Livro</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                {bookDetails ? (
                  <div>
                    <h3><strong>Título:</strong> {bookDetails.title}</h3>
                    <h5><strong>Autor:</strong> {bookDetails.author}</h5>
                    <h5><strong>ISBN:</strong> {bookDetails.isbn}</h5>
                    <h5><strong>Genero:</strong> {bookDetails.genre}</h5>
                    {/* Outras informações que você deseja exibir */}
                  </div>
                ) : (
                  <p>Carregando detalhes...</p>
                )}
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

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cadastrar Novo Livro</h5>
                <button type="button" className="btn-close" onClick={handleCloseAddModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Título</label>
                  <input
                    type="text"
                    id="title"
                    className="form-control"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="author" className="form-label">Autor</label>
                  <input
                    type="text"
                    id="author"
                    className="form-control"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="isbn" className="form-label">ISBN</label>
                  <input
                    type="text"
                    id="isbn"
                    className="form-control"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="publishedYear" className="form-label">Ano de publicação</label>
                  <input
                    type="date"
                    id="publishedYear"
                    className="form-control"
                    value={newBook.publishedYear}
                    onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="genre" className="form-label">Genero</label>
                  <input
                    type="text"
                    id="genre"
                    className="form-control"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="copies" className="form-label">Quantidade</label>
                  <input
                    type="number"
                    id="copies"
                    className="form-control"
                    value={newBook.copies}
                    onChange={(e) => setNewBook({ ...newBook, copies: e.target.value })}
                  />
                </div>

                {addError && (
                  <div className="alert alert-danger mb-2" style={{ display: 'inline-block', width: '100%' }}>
                    {addError}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseAddModal}>
                  Fechar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddBook}>
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditQuantityModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Editar Quantidade Disponível</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditQuantityModal(false)}></button>
              </div>
              <div className="modal-body">
                <label htmlFor="quantity" className="form-label">Quantidade Disponível</label>
                <input
                  type="number"
                  id="quantity"
                  className="form-control"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                />
                {quantityError && <div className="alert alert-danger mt-2">{quantityError}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditQuantityModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={handleConfirmEditQuantity}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    {showReservationModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmação de Reserva</h5>
                <button type="button" className="btn-close" onClick={handleCloseReservationModal}></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza de que deseja realizar esta reserva?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseReservationModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleConfirmReservation(reservationBook, userId)}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoanModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmação de Empréstimo</h5>
                <button type="button" className="btn-close" onClick={handleCloseLoanModal}></button>
              </div>
              <div className="modal-body">
                <p>Tem certeza de que deseja solicitar o empréstimo deste livro?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseLoanModal}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary" onClick={() => handleConfirmLoan(loanBook, userId)}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};

export default ClientHome;
