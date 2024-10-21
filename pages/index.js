import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where, getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase';
import LibroCard from '../components/CardLibro';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const WelcomePage = () => {
  const { user, role, userData } = useAuth();
  const [libros, setLibros] = useState([]);
  const [newlyAddedBooks, setNewlyAddedBooks] = useState([]);
  const [userLoanedBooks, setUserLoanedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorials, setEditorials] = useState({});
  const [booksByEditorial, setBooksByEditorial] = useState({});
  const [recommendedBook, setRecommendedBook] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchLibrosAndEditorials = async () => {
      try {
        const librosRef = collection(db, 'libros');
        const librosSnapshot = await getDocs(librosRef);
        const librosData = librosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLibros(librosData);

        const newBooksQuery = query(librosRef, orderBy('created_at', 'desc'), limit(3));
        const newBooksSnapshot = await getDocs(newBooksQuery);
        const newlyAddedBooks = newBooksSnapshot.docs.map(doc => ({
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
        librosData.forEach(libro => {
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

  useEffect(() => {
    const fetchUserLoanedBooks = async () => {
      try {
        if (!user?.uid) return;

        const loansRef = collection(db, 'prestamos');
        const loanQuery = query(loansRef, where('usuario.usuarioId', '==', user.uid));
        const loanSnapshot = await getDocs(loanQuery);

        const loanedBooks = await Promise.all(
          loanSnapshot.docs.map(async (loanDoc) => {
            const prestamoData = loanDoc.data();
            const libroRef = doc(db, 'libros', prestamoData.libroId); // Corrección en la referencia del libro
            const libroSnapshot = await getDoc(libroRef);

            if (!libroSnapshot.exists()) {
              console.error(`El libro con ID ${prestamoData.libroId} no existe`);
              return null;
            }

            return {
              ...libroSnapshot.data(),
              id: libroSnapshot.id,
              prestamoId: loanDoc.id,
              cantidadSolicitada: prestamoData.cantidadSolicitada,
              fechaDevolucion: new Date(prestamoData.fechaDevolucion),
              estado: prestamoData.estado,
            };
          })
        );

        setUserLoanedBooks(loanedBooks.filter((book) => book !== null));
      } catch (error) {
        console.error('Error obteniendo libros en préstamo: ', error);
        toast.error('Error obteniendo libros en préstamo.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserLoanedBooks();
    }
  }, [user]);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">¡Hola Administrador, {userData?.nombre || 'Usuario'}!</h1>
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
            <>
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
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 text-center">¡Hola, {userData?.nombre || 'Usuario'}!</h1>
              <div className="w-full max-w-4xl mb-8 text-center m-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Tus libros en préstamo</h2>
                {loading ? (
                  <p>Cargando libros en préstamo...</p>
                ) : userLoanedBooks.length > 0 ? (
                  <ul className="space-y-4">
                    {userLoanedBooks.map((libro) => (
                      <li key={libro.prestamoId} className="p-4 border border-gray-300 rounded-lg flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-semibold text-lg text-gray-800">{libro.titulo}</span>
                          <span className="text-sm text-gray-600">Fecha de devolución: {libro.fechaDevolucion.toLocaleDateString()}</span>
                          <span className="text-sm text-gray-600">Estado: {libro.estado}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No tienes libros en préstamo actualmente.</p>
                )}
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

