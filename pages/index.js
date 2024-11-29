import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import LibroCard from '../components/CardLibro';
import RandomBook from '../components/RandomBook';
import { useAuth } from '../hooks/useAuth';
import useLoan from '../hooks/useLoan';
import { toast } from 'react-toastify';
import Link from 'next/link';

const WelcomePage = () => {
  const { user, role, userData } = useAuth();
  const { loans, loading: loansLoading, error: loansError } = useLoan();
  const [libros, setLibros] = useState([]);
  const [newlyAddedBooks, setNewlyAddedBooks] = useState([]);
  const [editorials, setEditorials] = useState({});
  const [booksByEditorial, setBooksByEditorial] = useState({});
  const [recommendedBook, setRecommendedBook] = useState([]);
  const router = useRouter();

  // Carga de libros y editoriales
  useEffect(() => {
    const fetchLibrosAndEditorials = async () => {
      try {
        const librosRef = collection(db, 'libros');
        const librosSnapshot = await getDocs(librosRef);
        const librosData = librosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLibros(librosData);

        const newBooksQuery = query(librosRef, orderBy('created_at', 'desc'), limit(3));
        const newBooksSnapshot = await getDocs(newBooksQuery);
        const newlyAddedBooks = newBooksSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setNewlyAddedBooks(newlyAddedBooks);

        // Obtener editoriales
        const editorialsRef = collection(db, 'editoriales');
        const editorialsSnapshot = await getDocs(editorialsRef);
        const editorialsData = editorialsSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const booksByEditorial = {};
        librosData.forEach((libro) => {
          const editorialId = libro.editorial_id;
          if (editorialsData[editorialId]) {
            if (!booksByEditorial[editorialId]) {
              booksByEditorial[editorialId] = [];
            }
            booksByEditorial[editorialId].push(libro);
          }
        });

        const filteredEditorials = Object.keys(editorialsData).reduce((acc, editorialId) => {
          if (booksByEditorial[editorialId]) {
            acc[editorialId] = editorialsData[editorialId];
          }
          return acc;
        }, {});

        setEditorials(filteredEditorials);
        setBooksByEditorial(booksByEditorial);
      } catch (error) {
        console.error('Error al obtener libros o editoriales: ', error);
        toast.error('Error al obtener libros o editoriales.');
      }
    };

    fetchLibrosAndEditorials();
  }, []);

  // Recomendar un libro aleatorio
  useEffect(() => {
    if (libros.length > 0) {
      const randomBook = libros[Math.floor(Math.random() * libros.length)];
      setRecommendedBook(randomBook);
    }
  }, [libros]);

  const goToCatalog = () => router.push('/catalog');
  const goToEditorialBooks = (editorialId) => router.push(`/editorial/${editorialId}`);
  const isAdmin = role === '9EcXJe1Hfrc5pZw84bwI';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {isAdmin ? (
        <div className="w-full max-w-4xl mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            ¡Hola Administrador, {userData?.nombre || 'Usuario'}!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">Bienvenido de nuevo a BookLoan</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">Panel de Administrador</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6">Aquí puedes gestionar los libros, editoriales y usuarios.</p>
          <div className="flex flex-col items-center">
            <button
              onClick={() => router.push('/adminPages/adminCrudBook')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mb-4"
            >
              Gestionar Libros
            </button>
            <button
              onClick={() => router.push('/adminPages/adminUser')}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors mb-4"
            >
              Gestionar Usuarios
            </button>
            <button
              onClick={() => router.push('/adminPages/adminLoan')}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors mb-4"
            >
              Gestionar préstamos
            </button>
          </div>
        </div>
      ) : (
        <>
          {!user ? (
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 text-center">Bienvenido a BookLoan</h1>
              <div className="w-full max-w-4xl mb-8 text-center m-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Libros recién agregados a nuestro catálogo</h2>
                <p className="text-lg md:text-xl text-gray-600 mb-6">Descubre los últimos títulos que han llegado a nuestra colección. Mantente al tanto de las novedades.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newlyAddedBooks.map((libro) => (<LibroCard key={libro.id} libro={libro} />))}
                </div>
              </div>
              <div className="w-full max-w-4xl mb-8 text-center m-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Explora libros de estas maravillosas editoriales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Object.keys(editorials).map(editorialId => (
                    <button
                      key={editorialId}
                      onClick={() => goToEditorialBooks(editorialId)}
                      className="relative bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                    >
                      <div className="flex flex-col items-center p-4">
                        {editorials[editorialId].imagen && (
                          <img
                            src={editorials[editorialId].imagen}
                            alt={editorials[editorialId].nombre}
                            className="w-full h-32 object-cover mb-2"
                          />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">{editorials[editorialId].nombre}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 text-center">
                ¡Hola, {userData?.nombre || 'Usuario'}!
              </h1>
              <div className="w-full max-w-4xl mb-8 text-center">
  <h2 className="text-2xl md:text-3xl font-semibold mb-4">Tus libros en préstamo</h2>
  {loansLoading ? (
    <p>Cargando libros en préstamo...</p>
  ) : loansError ? (
    <p className="text-red-500">{loansError}</p>
  ) : loans.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {loans
        .filter((loan) => loan.estado === 'pendiente' || loan.estado === 'aceptado') // Filtrar préstamos
        .map((loan) => (
          <div
            key={loan.prestamoId}
            className="p-4 border border-gray-300 rounded-lg shadow-md bg-white"
          >
            <Link href={`/libro/${loan.libro.id}`}>
              <img
                src={loan.libro.imagen}
                alt={loan.libro.titulo}
                className="w-full h-40 object-cover rounded-md mb-4 cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
            <Link href={`/libro/${loan.libro.id}`}>
              <h3 className="text-lg font-semibold cursor-pointer hover:text-blue-500 transition-colors">
                {loan.libro.titulo}
              </h3>
            </Link>

            <p className="text-sm mt-2">Fecha de devolución: {loan.fechaDevolucion}</p>
            <p className="text-sm">Estado: {loan.estado}</p>
          </div>
        ))}
    </div>
  ) : (
    <p>No tienes préstamos activos.</p>
  )}
</div>

<div>
    <h1 className="text-center text-2xl font-bold mb-4">Libro aleatorio</h1>
    <RandomBook />
  </div>
              <div className="w-full max-w-4xl mb-8 text-center m-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Libros recién agregados a nuestro catálogo</h2>
                <p className="text-lg md:text-xl text-gray-600 mb-6">Descubre los últimos títulos que han llegado a nuestra colección. Mantente al tanto de las novedades.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newlyAddedBooks.map((libro) => (<LibroCard key={libro.id} libro={libro} />))}
                </div>
              </div>
              <div className="w-full max-w-4xl mb-8 text-center m-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Explora libros de estas maravillosas editoriales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Object.keys(editorials).map(editorialId => (
                    <button
                      key={editorialId}
                      onClick={() => goToEditorialBooks(editorialId)}
                      className="relative bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                    >
                      <div className="flex flex-col items-center p-4">
                        {editorials[editorialId].imagen && (
                          <img
                            src={editorials[editorialId].imagen}
                            alt={editorials[editorialId].nombre}
                            className="w-full h-32 object-cover mb-2"
                          />
                        )}
                        <h3 className="text-lg font-semibold text-gray-800">{editorials[editorialId].nombre}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WelcomePage;
