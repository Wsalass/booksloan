import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Link from 'next/link';

const RandomBook = () => {
  const [randomBook, setRandomBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRandomBook = async () => {
    setLoading(true);
    setError(null);
    try {
      const librosRef = collection(db, 'libros');
      const librosSnapshot = await getDocs(librosRef);
      const libros = librosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (libros.length > 0) {
        const randomIndex = Math.floor(Math.random() * libros.length);
        setRandomBook(libros[randomIndex]);
      } else {
        setRandomBook(null);
      }
    } catch (error) {
      console.error('Error al obtener un libro aleatorio:', error);
      setError('No se pudo obtener un libro aleatorio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomBook();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg h-[400px]">
      {loading ? (
        <p className="text-center text-gray-500">Cargando libro...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : randomBook ? (
        <div className="flex h-full">
          {/* Imagen del libro */}
          <div className="flex-shrink-0 w-1/3 h-full">
            <Link href={`/libro/${randomBook.id}`}>
              <img
                src={randomBook.imagen}
                alt={randomBook.titulo}
                className="w-full h-full object-cover rounded-md shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>

          {/* Información del libro */}
          <div className="flex flex-col justify-between w-2/3 px-6">
            {/* Título del libro */}
            <div className="mb-4">
              <Link href={`/libro/${randomBook.id}`}>
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 cursor-pointer hover:text-blue-500 transition-colors">
                  {randomBook.titulo}
                </h2>
              </Link>
            </div>

            {/* Resumen del libro */}
            <div className="flex-1 mb-4 overflow-auto">
              <p className="text-gray-600">{randomBook.resumen}</p>
            </div>

            {/* Botón para mostrar otro libro */}
            <button
              onClick={fetchRandomBook}
              className="self-start px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Mostrar otro libro
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No hay libros disponibles.</p>
      )}
    </div>
  );
};

export default RandomBook;
