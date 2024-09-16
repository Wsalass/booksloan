import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Asegúrate de tener configurado tu archivo firebase.js
import LibroCard from '../../components/CardLibro';

const EditorialPage = () => {
  const router = useRouter();
  const { id } = router.query; // Obtener el ID de la editorial desde la URL
  const [libros, setLibros] = useState([]);
  const [editorial, setEditorial] = useState(null);

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
            console.error("Editorial no encontrada");
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
          console.error("Error al obtener los libros de la editorial: ", error);
        }
      };

      fetchBooksByEditorial();
    }
  }, [id]);

  if (!editorial) return <p>Cargando...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">{editorial.nombre}</h1>
      <p className="text-lg text-gray-600 mb-6">{editorial.descripcion}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {libros.length > 0 ? (
          libros.map(libro => (
            <LibroCard key={libro.id} libro={libro} />
          ))
        ) : (
          <p>No hay libros disponibles para esta editorial.</p>
        )}
      </div>
    </div>
  );
};

export default EditorialPage;
