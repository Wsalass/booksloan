import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const LibroDetalle = () => {
  const [libro, setLibro] = useState(null);
  const [autores, setAutores] = useState([]);
  const [editorial, setEditorial] = useState('');
  const [generos, setGeneros] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchLibro = async () => {
      if (!id) return;

      try {
        const libroRef = doc(db, 'libros', id);
        const libroSnapshot = await getDoc(libroRef);
        if (libroSnapshot.exists()) {
          const libroData = libroSnapshot.data();
          setLibro(libroData);

          if (libroData.autores && libroData.autores.length > 0) {
            const autoresPromises = libroData.autores.map(async (autorId) => {
              const autorDoc = await getDoc(doc(db, 'autores', autorId));
              return autorDoc.exists() ? autorDoc.data().nombre : 'Desconocido';
            });
            const autoresData = await Promise.all(autoresPromises);
            setAutores(autoresData);
          } else {
            setAutores(['No especificado']);
          }
          if (libroData.editorial) {
            const editorialDoc = await getDoc(doc(db, 'editoriales', libroData.editorial));
            setEditorial(editorialDoc.exists() ? editorialDoc.data().nombre : 'Desconocido');
          } else {
            setEditorial('No especificado');
          }

          if (libroData.generos && libroData.generos.length > 0) {
            const generosPromises = libroData.generos.map(async (generoId) => {
              const generoDoc = await getDoc(doc(db, 'generos', generoId));
              return generoDoc.exists() ? generoDoc.data().nombre : 'Desconocido';
            });
            const generosData = await Promise.all(generosPromises);
            setGeneros(generosData);
          } else {
            setGeneros(['No especificado']);
          }
        } else {
          console.error('El libro no existe');
          router.push('/404'); // Redirect to a 404 page if the book is not found
        }
      } catch (error) {
        console.error('Error fetching book details:', error);
        router.push('/404'); // Redirect to a 404 page on error
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id, router]);

  if (loading) return <p className="text-center text-red-500">Cargando...</p>;

  if (!libro) return <p className="text-center text-red-500">No se encontró el libro.</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6">Detalles del Libro</h1>
      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="w-48 h-48 mb-4 md:mb-0">
          <img
            src={libro.imagen}
            alt={libro.titulo}
            className="w-full h-full object-cover rounded-lg border border-gray-300"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-semibold mb-2">{libro.titulo}</h2>
          <p className="text-xl mb-2">Autor{autores.length > 1 ? 'es' : ''}: {autores.join(', ')}</p>
          <p className="text-xl mb-2">Editorial: {editorial}</p>
          <p className="text-xl mb-2">Género{generos.length > 1 ? 's' : ''}: {generos.join(', ')}</p>
          <p className="text-xl mb-2">Cantidad disponible: {libro.cantidad || 'No disponible'}</p>
          <p className="text-xl mb-2">Resumen: {libro.resumen || 'No disponible'}</p>
        </div>
      </div>
      <button
        onClick={() => router.push('/prestamo/${id}')}
        className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded"
      >
        Pedir Préstamo
      </button>
    </div>
  );
};

export default LibroDetalle;