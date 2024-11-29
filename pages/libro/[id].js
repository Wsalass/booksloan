import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';

const LibroDetalle = () => {
  const { user,role } = useAuth(); 
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

          const autoresData = await Promise.all(
            (libroData.autor_id || []).map(async (autorId) => {
              const autorDoc = await getDoc(doc(db, 'autores', autorId));
              return autorDoc.exists() ? autorDoc.data().nombre : 'Desconocido';
            })
          );
          setAutores(autoresData.length > 0 ? autoresData : ['No especificado']);

          if (libroData.editorial_id) {
            const editorialDoc = await getDoc(doc(db, 'editoriales', libroData.editorial_id));
            setEditorial(editorialDoc.exists() ? editorialDoc.data().nombre : 'Desconocido');
          } else {
            setEditorial('No especificado');
          }

          const generosData = await Promise.all(
            (libroData.genero_id || []).map(async (generoId) => {
              const generoDoc = await getDoc(doc(db, 'generos', generoId));
              return generoDoc.exists() ? generoDoc.data().nombre : 'Desconocido';
            })
          );
          setGeneros(generosData.length > 0 ? generosData : ['No especificado']);
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

  const Admin = role === '9EcXJe1Hfrc5pZw84bwI';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-4">
        <div className="bg-wave py-6 px-6 rounded-xl shadow-lg mb-8 w-full">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-full md:w-60 h-80 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={libro.imagen} 
                alt={libro.titulo} 
                className="w-full h-full object-cover rounded-md" 
                style={{ objectFit: 'cover', objectPosition: 'center' }} 
              />
            </div>
            <div className="flex flex-col justify-between w-full">
              <h1 className="text-2xl font-extrabold text-gray-100 leading-tight mb-4">{libro.titulo}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-semibold text-lg text-gray-100">Resumen</h2>
                  <p className="text-gray-100">{libro.resumen || 'No disponible'}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-100">Detalles</h2>
                  <p className="text-gray-100">Autor{autores.length > 1 ? 'es' : ''}: {autores.join(', ')}</p>
                  <p className="text-gray-100">Editorial: {editorial}</p>
                  <p className="text-gray-100">Género{generos.length > 1 ? 's' : ''}: {generos.join(', ')}</p>
                  <p className="text-gray-100">Cantidad disponible: {libro.cantidad || 'No disponible'}</p>
                  
                  <div className="mt-6 flex">
                    {user && Admin ? (  
                      <p className="text-red-500">No puedes pedir préstamos como administrador cambia a un usuario de Funcionario.</p>
                    ): (
                      <div className="mt-6 flex">
                        {user ? (
                          <button onClick={() => router.push(`/libro/prestamo/${id}`)}className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded">
                            Pedir Préstamo
                          </button>
                        ) : (
                          <p className="text-red-500">Debes iniciar sesión para pedir un préstamo.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibroDetalle;
