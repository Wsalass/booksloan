import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import LibroCard from '../components/CardLibro';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../hooks/useAuth'; // Importa el hook useAuth

const Catalog = () => {
  const { userData } = useAuth(); // Accede a los datos del usuario
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenero, setSelectedGenero] = useState('');
  const [generos, setGeneros] = useState([]);
  const [error, setError] = useState(null);

  const fetchGeneros = async () => {
    try {
      const generosRef = collection(db, 'generos');
      const generosSnapshot = await getDocs(generosRef);
      const generosData = generosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGeneros(generosData);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setError('No se pudieron cargar los géneros. Inténtalo más tarde.');
      toast.error('Error al cargar los géneros. Inténtalo más tarde.', { position: 'top-center' });
    }
  };

  const fetchLibros = async () => {
    try {
      setLoading(true);
      const librosRef = collection(db, 'libros');
      let librosQuery = query(librosRef, orderBy('titulo'));

      if (searchTerm) {
        librosQuery = query(
          librosRef,
          where('titulo', '>=', searchTerm),
          where('titulo', '<=', searchTerm + '\uf8ff'),
          orderBy('titulo')
        );
      }

      if (selectedGenero) {
        librosQuery = query(
          librosRef,
          where('generos_id', 'array-contains', selectedGenero),
          orderBy('titulo')
        );
      }

      const librosSnapshot = await getDocs(librosQuery);
      const librosData = librosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLibros(librosData);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Error al cargar los libros. Inténtalo más tarde.', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneros();
  }, []);

  useEffect(() => {
    fetchLibros();
  }, [searchTerm, selectedGenero]);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-12 text-center">Catálogo de Libros</h2>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 mb-12">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Buscar libros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 border border-stone-950 rounded-lg text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-verde-claro focus:border-transparent transition-all duration-300 ease-in-out"
            />
          </div>

          <select
            value={selectedGenero}
            onChange={(e) => setSelectedGenero(e.target.value)}
            className="w-full max-w-xs px-5 py-3 border border-gray-300 rounded-lg text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-verde-claro focus:border-transparent transition-all duration-300 ease-in-out"
          >
            <option value="">Todos los géneros</option>
            {generos.map((genero) => (
              <option key={genero.id} value={genero.id}>
                {genero.nombre}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-center text-lg text-red-500">{error}</p>}

        {loading ? (
          <p className="text-center text-lg text-gray-500">Cargando...</p>
        ) : libros.length === 0 ? (
          <p className="text-center text-lg text-red-500">No hay libros disponibles en este género.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {libros.map((libro) => (
              <LibroCard libro={libro} key={libro.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
