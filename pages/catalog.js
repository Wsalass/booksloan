import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import LibroCard from '../components/CardLibro';

const Catalog = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenero, setSelectedGenero] = useState('');
  const [generos, setGeneros] = useState([]);
  const [error, setError] = useState(null);

  // Función para obtener géneros
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
    }
  };

  // Función para obtener libros
  const fetchLibros = async () => {
    try {
      setLoading(true);
      const librosRef = collection(db, 'libros');
      let librosQuery = query(librosRef, orderBy('titulo'));

      // Filtro por término de búsqueda
      if (searchTerm) {
        librosQuery = query(
          librosRef,
          where('titulo', '>=', searchTerm),
          where('titulo', '<=', searchTerm + '\uf8ff'),
          orderBy('titulo')
        );
      }

      // Filtro por género seleccionado
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
      setError('No se pudieron cargar los libros. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar géneros al inicio
  useEffect(() => {
    fetchGeneros();
  }, []);

  // useEffect para cargar libros cuando cambia el término de búsqueda o el género seleccionado
  useEffect(() => {
    fetchLibros();
  }, [searchTerm, selectedGenero]);

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 text-center">Catálogo de Libros</h2>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-10">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar libros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-stone-950 rounded-lg text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-verde-claro focus:border-transparent transition-all duration-300 ease-in-out"
            />
          </div>

          <select
            value={selectedGenero}
            onChange={(e) => setSelectedGenero(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-verde-claro focus:border-transparent transition-all duration-300 ease-in-out"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
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
