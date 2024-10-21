import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth'; // Importar el hook de autenticación

const LibroDetalle = () => {
  const { user, userData } = useAuth(); // Obtener el usuario y los datos del usuario
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

          // Obtener autores
          if (libroData.autor_id && libroData.autor_id.length > 0) {
            const autoresPromises = libroData.autor_id.map(async (autorId) => {
              const autorDoc = await getDoc(doc(db, 'autores', autorId));
              return autorDoc.exists() ? autorDoc.data().nombre : 'Desconocido';
            });
            const autoresData = await Promise.all(autoresPromises);
            setAutores(autoresData);
          } else {
            setAutores(['No especificado']);
          }

          // Obtener editorial
          if (libroData.editorial_id) {
            const editorialDoc = await getDoc(doc(db, 'editoriales', libroData.editorial_id));
            setEditorial(editorialDoc.exists() ? editorialDoc.data().nombre : 'Desconocido');
          } else {
            setEditorial('No especificado');
          }

          // Obtener géneros
          if (libroData.genero_id && libroData.genero_id.length > 0) {
            const generosPromises = libroData.genero_id.map(async (generoId) => {
              const generoDoc = await getDoc(doc(db, 'generos', generoId));
              return generoDoc.exists() ? generoDoc.data().nombre : 'Desconocido';
            });
            const generosData = await Promise.all(generosPromises);
            setGeneros(generosData);
          } else {
            setGeneros(['No especificado']);
          }
        } else {
          toast.error('El libro no existe');
        }
      } catch (error) {
        toast.error('Error al cargar el libro');
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id]);

  if (loading) return <p className="text-center text-blue-500">Cargando...</p>;

  if (!libro) return <p className="text-center text-red-500">No se encontró el libro.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Detalles del Libro</h1>
      <div className="flex flex-col md:flex-row mb-8">
        <div className="w-48 h-48 mb-6 md:mb-0">
          <img
            src={libro.imagen}
            alt={libro.titulo}
            className="w-full h-full object-cover rounded-lg border border-gray-300"
          />
        </div>
        <div className="flex-1 md:ml-8">
          <h2 className="text-3xl font-semibold mb-4">{libro.titulo}</h2>
          <p className="text-lg mb-2">Autor{autores.length > 1 ? 'es' : ''}: {autores.join(', ')}</p>
          <p className="text-lg mb-2">Editorial: {editorial}</p>
          <p className="text-lg mb-2">Género{generos.length > 1 ? 's' : ''}: {generos.join(', ')}</p>
          <p className="text-lg mb-2">Cantidad disponible: {libro.cantidad || 'No disponible'}</p>
          <p className="text-lg mb-4">Resumen: {libro.resumen || 'No disponible'}</p>
          {user ? (
            <button
              onClick={() => router.push(`/libro/prestamo/${id}`)}
              className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-6 rounded"
            >
              Pedir Préstamo
            </button>
          ) : (
            <p className="text-red-500">Debes iniciar sesión para pedir un préstamo.</p>
          )}
        </div>
      </div>

      {/* Contenedor para las notificaciones de react-toastify */}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default LibroDetalle;

