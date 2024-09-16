import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import LibroCard from '../components/CardLibro';
import { useAuth } from '../hooks/useAuth';

const WelcomePage = () => {
  const { user, userData } = useAuth();
  const [libros, setLibros] = useState([]);
  const [newlyAddedBooks, setNewlyAddedBooks] = useState([]);
  const [userLoanedBooks, setUserLoanedBooks] = useState([]);
  const [editorials, setEditorials] = useState({});
  const [booksByEditorial, setBooksByEditorial] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchLibrosAndEditorials = async () => {
      try {
        // Obtener todos los libros
        const librosRef = collection(db, 'libros');
        const librosSnapshot = await getDocs(librosRef);
        const librosData = librosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLibros(librosData);

        // Obtener libros recién agregados
        const newBooksQuery = query(librosRef, orderBy('created_at', 'desc'), limit(3));
        const newBooksSnapshot = await getDocs(newBooksQuery);
        const newlyAddedBooks = newBooksSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setNewlyAddedBooks(newlyAddedBooks);

        // Obtener todas las editoriales
        const editorialsRef = collection(db, 'editoriales');
        const editorialsSnapshot = await getDocs(editorialsRef);
        const editorialsData = editorialsSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        // Filtrar las editoriales que tienen al menos un libro
        const booksByEditorial = {};
        librosData.forEach(libro => {
          const editorialId = libro.editorial_id; // Ajuste: `editorial_id`
          if (editorialsData[editorialId]) {
            if (!booksByEditorial[editorialId]) {
              booksByEditorial[editorialId] = [];
            }
            booksByEditorial[editorialId].push(libro);
          }
        });

        // Actualizar el estado con las editoriales que tienen libros
        const filteredEditorials = Object.keys(editorialsData).reduce((acc, editorialId) => {
          if (booksByEditorial[editorialId]) {
            acc[editorialId] = editorialsData[editorialId];
          }
          return acc;
        }, {});

        setEditorials(filteredEditorials);
        setBooksByEditorial(booksByEditorial);
      } catch (error) {
        console.error("Error al obtener libros o editoriales: ", error);
      }
    };

    fetchLibrosAndEditorials();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserLoanedBooks(user.uid);
    } else {
      fetchPublicBooks();
    }
  }, [user]);

  const fetchUserLoanedBooks = async (uid) => {
    try {
      const loansRef = collection(db, 'prestamos');
      const loanQuery = query(loansRef, where('usuario_id', '==', uid));
      const loanSnapshot = await getDocs(loanQuery);
      const loanedBooks = loanSnapshot.docs.map(doc => ({
        ...doc.data().libro,
        id: doc.id
      }));
      setUserLoanedBooks(loanedBooks);
    } catch (error) {
      console.error("Error obteniendo libros en préstamo: ", error);
    }
  };

  const fetchPublicBooks = async () => {
    try {
      const booksRef = collection(db, 'libros');
      const newBooksQuery = query(booksRef, orderBy('created_at', 'desc'), limit(3));
      const newBooksSnapshot = await getDocs(newBooksQuery);
      const newlyAddedBooks = newBooksSnapshot.docs.map(doc => doc.data());
      setNewlyAddedBooks(newlyAddedBooks);
    } catch (error) {
      console.error('Error obteniendo libros públicos: ', error);
    }
  };

  const goToCatalog = () => router.push('/catalog');
  const goToEditorialBooks = (editorialId) => router.push(`/editorial/${editorialId}`);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {!user ? (
        <>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 text-center">Bienvenido a Autobooks</h1>
          <div className="w-full max-w-4xl mb-8 text-center m-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 text-center">Libros recién agregados a nuestro catálogo</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 text-center">Descubre los últimos títulos que han llegado a nuestra colección. En esta sección, encontrarás los libros más recientes que hemos añadido, cada uno con su propia historia y encanto. Mantente al tanto de las novedades.</p>
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
                  <img
                    src={editorials[editorialId]?.imagen || '/default-editorial.png'}
                    alt={editorials[editorialId]?.nombre}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">¡Hola, {userData?.nombre || 'Usuario'}!</h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 text-center">Bienvenido de nuevo a Autobooks, tu plataforma para pedir préstamos de tus libros favoritos.</p>
          <div className="w-full max-w-4xl mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 text-center">Tus libros en préstamo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {userLoanedBooks.map((book) => (
                <div key={book.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800">{book.titulo}</h3>
                  <p className="text-gray-600">{book.autor}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full max-w-4xl mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 text-center">Libros recién agregados a nuestro catálogo</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 text-center">Descubre los últimos títulos que han llegado a nuestra colección. En esta sección, encontrarás los libros más recientes que hemos añadido, cada uno con su propia historia y encanto. Mantente al tanto de las novedades.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newlyAddedBooks.map((libro) => (<LibroCard key={libro.id} libro={libro} />))}
            </div>
          </div>

          <div className="w-full max-w-4xl mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4 text-center">Explora libros de estas maravillosas editoriales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.keys(editorials).map(editorialId => (
                <button
                  key={editorialId}
                  onClick={() => goToEditorialBooks(editorialId)}
                  className="relative bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:scale-105"
                >
                  <img
                    src={editorials[editorialId]?.imagen || '/default-editorial.png'}
                    alt={editorials[editorialId]?.nombre}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomePage;
