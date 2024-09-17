import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase'; 
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth'; 

const SolicitarPrestamo = () => {
  const [libro, setLibro] = useState(null);
  const [autores, setAutores] = useState([]);
  const [editorial, setEditorial] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [maxCantidad, setMaxCantidad] = useState(3); 
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  const router = useRouter();
  const { id } = router.query; 


  const obtenerLimiteLibros = (rolId) => {
    switch (rolId) {
      case '0gXv7x0EctdgRrVh96B7': // Estudiante
        return 3;
      case '7qm4fox9AjtONPXh8YvR': // Profesor
        return 5;
      case 'fNzerO5gAonx0c28MHfK': // Funcionario
        return 3;
      default:
        return 3; 
    }
  };

  const fetchAutores = async (autorIds) => {
    try {
      const autoresData = [];
      for (const autorId of autorIds) {
        const autorRef = doc(db, 'autores', autorId);
        const autorSnapshot = await getDoc(autorRef);
        if (autorSnapshot.exists()) {
          autoresData.push(autorSnapshot.data().nombre || 'Desconocido'); 
        }
      }
      setAutores(autoresData);
    } catch (error) {
      console.error('Error al obtener los autores:', error);
    }
  };

  const fetchEditorial = async (editorialId) => {
    try {
      const editorialRef = doc(db, 'editoriales', editorialId);
      const editorialSnapshot = await getDoc(editorialRef);
      if (editorialSnapshot.exists()) {
        setEditorial(editorialSnapshot.data().nombre || 'Desconocida'); 
      }
    } catch (error) {
      console.error('Error al obtener la editorial:', error);
    }
  };

  useEffect(() => {
    const fetchLibro = async () => {
      if (!id) return;

      try {
        const libroRef = doc(db, 'libros', id);
        const libroSnapshot = await getDoc(libroRef);
        if (libroSnapshot.exists()) {
          const libroData = libroSnapshot.data();
          setLibro(libroData);

          if (libroData.autor_id && libroData.autor_id.length > 0) {
            await fetchAutores(libroData.autor_id);
          }

          if (libroData.editorial_id) {
            await fetchEditorial(libroData.editorial_id);
          }
        } else {
          console.error('El libro no existe');
          router.push('/404'); 
        }
      } catch (error) {
        console.error('Error al obtener detalles del libro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id, router]);

  useEffect(() => {
    if (user) {
      const limite = obtenerLimiteLibros(user.rol_id); 
      setMaxCantidad(limite);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !libro) return;

    const cantidadDisponible = libro.cantidad || 0;

    if (cantidad > cantidadDisponible) {
      alert('La cantidad solicitada excede la cantidad disponible.');
      return;
    }

    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 30);

    const nuevoPrestamo = {
      libroId: id,
      usuarioId: user.uid,
      cantidadSolicitada: cantidad,
      estado: 'pendiente', 
      fechaSolicitud: new Date(),
      fechaDevolucion: fechaDevolucion.toISOString().split('T')[0], 
      usuario: {
        nombre: user.nombre || 'Desconocido', 
        email: user.email || 'No proporcionado', 
        telefono: user.telefono || 'No proporcionado', 
      },
      libro: {
        titulo: libro.titulo || 'Título desconocido', 
        autores: autores.length > 0 ? autores : ['Desconocido'],
        editorial: editorial || 'Desconocida',
        cantidadDisponible: cantidadDisponible 
      }
    };

    try {

      await addDoc(collection(db, 'prestamos'), nuevoPrestamo);

      const libroRef = doc(db, 'libros', id);
      await updateDoc(libroRef, { cantidad: cantidadDisponible - cantidad });

      alert('Solicitud de préstamo enviada. Espera la autorización del administrador.');
      router.push(`/libro/${id}`); 
    } catch (error) {
      console.error('Error al crear el préstamo:', error);
      alert('Hubo un error al solicitar el préstamo. Inténtalo nuevamente.');
    }
  };

  if (loading) return <p className="text-center">Cargando...</p>;

  if (!libro) return <p className="text-center">No se encontró el libro.</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6">Solicitud de Préstamo</h1>

      {/* Mostrar información del libro */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Libro: {libro.titulo}</h2>
        <p className="text-xl">Cantidad disponible: {libro.cantidad}</p>
        <p className="text-xl">Autores: {autores.length > 0 ? autores.join(', ') : 'Desconocido'}</p>
        <p className="text-xl">Editorial: {editorial || 'Desconocida'}</p>
      </div>

      {/* Mostrar información del usuario */}
      {user && (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">Información del usuario</h3>
          <p className="text-xl">Nombre: {user.nombre || 'Desconocido'}</p>
          <p className="text-xl">Correo: {user.email || 'No proporcionado'}</p>
          <p className="text-xl">Teléfono: {user.telefono || 'No proporcionado'}</p>
        </div>
      )}

      {/* Formulario para solicitar el préstamo */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="cantidad">
            Cantidad de libros a solicitar (Máximo: {maxCantidad}):
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            className="border border-gray-300 p-2 w-full"
            min="1"
            max={Math.min(libro.cantidad, maxCantidad)} 
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))} 
            required
          />
        </div>
        <button type="submit" className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded">
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
};

export default SolicitarPrestamo;
