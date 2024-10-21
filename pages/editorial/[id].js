import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import LibroCard from '../../components/CardLibro';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth'; // Importa el hook de autenticación

const EditorialPage = () => {
  const router = useRouter();
  const { id } = router.query; // Obtener el ID de la editorial desde la URL
  const [libros, setLibros] = useState([]);
  const [editorial, setEditorial] = useState(null);
  const { user, userData } = useAuth(); // Obtener información del usuario

  useEffect(() => {
    if (id) {
      const fetchBooksByEditorial = async () => {
        try {
          // Obtener la información de la editorial
          const editorialRef = doc(db, 'editoriales', id);
          const editorialSnapshot = await getDoc(editorialRef);
          if (editorialSnapshot.exists()) {
            setEditorial(editorialSnapshot.data());
          } else {
            toast.error("Editorial no encontrada");
          }

          // Obtener los libros de la editorial
          const librosRef = collection(db, 'libros');
          const queryRef = query(librosRef, where('editorial_id', '==', id));
          const librosSnapshot = await getDocs(queryRef);
          const librosData = librosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLibros(librosData);
        } catch (error) {
          toast.error("Error al obtener los libros de la editorial");
          console.error("Error al obtener los libros de la editorial: ", error);
        }
      };

      fetchBooksByEditorial();
    }
  }, [id]);

  if (!editorial) return <p>Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-8 sm:px-12 lg:px-16">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">{editorial.nombre}</h1>
      <p className="text-lg text-gray-600 mb-8">{editorial.descripcion}</p>

      {/* Muestra información del usuario si está autenticado */}
      {user && userData && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Hola, {userData.nombre}!</h2>
          <p className="text-gray-600">Eres un {userData.rol_id === 4 ? 'administrador' : 'usuario'}.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {libros.length > 0 ? (
          libros.map(libro => (
            <LibroCard key={libro.id} libro={libro} />
          ))
        ) : (
          <p className="text-center text-gray-600">No hay libros disponibles para esta editorial.</p>
        )}
      </div>

      {/* Contenedor para las notificaciones de react-toastify */}
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default EditorialPage;

