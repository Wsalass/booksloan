import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { db } from '../lib/firebase'; // Asegúrate de tener configurado tu archivo firebase.js

const WelcomePage = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [newlyAddedBooks, setNewlyAddedBooks] = useState([]);
  const [userLoanedBooks, setUserLoanedBooks] = useState([]);

  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        fetchPublicBooks(); // Cargar los libros recién agregados si no hay sesión iniciada
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchUserData = async (uid) => {
    const userRef = doc(db, 'usuarios', uid); // Cambia esta línea a usar 'doc' en vez de 'collection'
    try {
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        setUserData(userSnapshot.data()); // Establece los datos del usuario
      } else {
        console.error("Usuario no encontrado");
      }

      // Obtener libros en préstamo del usuario
      const loansRef = collection(db, 'prestamos');
      const loanQuery = query(loansRef, where('usuario_id', '==', uid));
      const loanSnapshot = await getDocs(loanQuery);
      const loanedBooks = loanSnapshot.docs.map(doc => doc.data().libro);
      setUserLoanedBooks(loanedBooks);

      // Obtener libros recién agregados
      const booksRef = collection(db, 'libros');
      const newBooksQuery = query(booksRef, orderBy('created_at', 'desc'), limit(3));
      const newBooksSnapshot = await getDocs(newBooksQuery);
      const newlyAddedBooks = newBooksSnapshot.docs.map(doc => doc.data());
      setNewlyAddedBooks(newlyAddedBooks);

    } catch (error) {
      console.error("Error obteniendo datos del usuario: ", error);
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

  const handleLoginAlert = () => {
    alert('Debe iniciar sesión para ver los detalles del libro.');
  };

  const goToCatalog = () => router.push('/catalog');
  const goToBookCRUD = () => router.push('/bookCRUD');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {!user ? (
        <>
          <h1 className="text-5xl font-bold mb-4 text-gray-800">Bienvenido a Autobooks</h1>
          <p className="text-xl text-gray-600 mb-6">Descubre y pide prestamos de tus libros favoritos.</p>
          <div className="space-x-4">
            <button onClick={() => router.push('/login')} className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all">Iniciar Sesión</button>
            <button onClick={() => router.push('/register')} className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all">Registrarse</button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-5xl font-bold mb-4 text-gray-800">¡Hola, {userData?.nombre || 'Usuario'}!</h1>
          <p className="text-xl text-gray-600 mb-6">Bienvenido de nuevo a Autobooks, tu plataforma para pedir prestamos de tus libros favoritos.</p>
          <div className="w-full max-w-4xl mb-8">
            <h2 className="text-3xl font-semibold text-gray-700 mb-4">Tus libros en préstamo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {userLoanedBooks.map((book) => (
                <div key={book.id} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-800">{book.titulo}</h3>
                  <p className="text-gray-600">{book.autor}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-x-4">
            <button onClick={goToCatalog} className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all">Ir al Catálogo</button>
            {userData?.rol_id === 4 && (
              <button onClick={goToBookCRUD} className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all">Administrar Libros</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomePage;
