import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import { ToastContainer, toast } from 'react-toastify';

const SolicitarPrestamo = () => {
  const [libro, setLibro] = useState(null);
  const [autores, setAutores] = useState([]);
  const [editorial, setEditorial] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [maxCantidad, setMaxCantidad] = useState(3);
  const [loading, setLoading] = useState(true);
  const [usuarioDb, setUsuarioDb] = useState(null);
  const { user } = useAuth(); 
  const router = useRouter();
  const { id } = router.query;

  const obtenerLimiteLibros = (rolId) => {
    switch (rolId) {
      case '0gXv7x0EctdgRrVh96B7': // Estudiante
      case 'fNzerO5gAonx0c28MHfK': // Funcionario
        return 3;
      case '7qm4fox9AjtONPXh8YvR': // Profesor
        return 5;
      default:
        return 3;
    }
  };

  const fetchUsuarioDb = async (uid) => {
    try {
      const usuarioRef = doc(db, 'usuarios', uid);
      const usuarioSnapshot = await getDoc(usuarioRef);
      if (usuarioSnapshot.exists()) {
        setUsuarioDb(usuarioSnapshot.data());
        const limite = obtenerLimiteLibros(usuarioSnapshot.data().rol_id);
        setMaxCantidad(limite);
      } else {
        toast.error('No se encontraron datos del usuario en la base de datos.');
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      toast.error('Hubo un problema al cargar los datos del usuario.');
    }
  };

  const fetchAutores = async (autorIds) => {
    try {
      const autoresData = await Promise.all(autorIds.map(async (autorId) => {
        const autorRef = doc(db, 'autores', autorId);
        const autorSnapshot = await getDoc(autorRef);
        return autorSnapshot.exists() ? autorSnapshot.data().nombre || 'Desconocido' : null;
      }));
      setAutores(autoresData.filter(Boolean));
    } catch (error) {
      console.error('Error al obtener los autores:', error);
      toast.error('No se pudieron cargar los autores. Intenta nuevamente.');
    }
  };

  const fetchEditorial = async (editorialId) => {
    try {
      const editorialRef = doc(db, 'editoriales', editorialId);
      const editorialSnapshot = await getDoc(editorialRef);
      setEditorial(editorialSnapshot.exists() ? editorialSnapshot.data().nombre || 'Desconocida' : 'Desconocida');
    } catch (error) {
      console.error('Error al obtener la editorial:', error);
      toast.error('No se pudo cargar la editorial. Intenta nuevamente.');
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
          await Promise.all([
            libroData.autor_id && fetchAutores(libroData.autor_id),
            libroData.editorial_id && fetchEditorial(libroData.editorial_id),
          ]);
        } else {
          toast.error('El libro no existe. Redirigiendo...');
          router.push('/404');
        }
      } catch (error) {
        console.error('Error al obtener detalles del libro:', error);
        toast.error('Error al cargar la información del libro. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id, router]);

  useEffect(() => {
    if (user && user.uid) {
      fetchUsuarioDb(user.uid);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuarioDb) {
      toast.error('Debes estar logueado para solicitar un préstamo.');
      return;
    }

    if (!libro) {
      toast.error('No se encontró el libro. Intenta más tarde.');
      return;
    }

    const cantidadDisponible = libro.cantidad || 0;

    if (cantidad > cantidadDisponible) {
      toast.error('La cantidad solicitada excede la cantidad disponible.');
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
        nombre: usuarioDb.nombre || 'Desconocido',
        email: usuarioDb.email || 'No proporcionado',
        telefono: usuarioDb.telefono || 'No proporcionado',
      },
      libro: {
        titulo: libro.titulo || 'Título desconocido',
        autores: autores.length > 0 ? autores : ['Desconocido'],
        editorial: editorial || 'Desconocida',
        cantidadDisponible: cantidadDisponible,
      },
    };

    try {
      await addDoc(collection(db, 'prestamos'), nuevoPrestamo);
      await updateDoc(doc(db, 'libros', id), { cantidad: cantidadDisponible - cantidad });
      toast.success('Solicitud de préstamo enviada. Espera la autorización del administrador.');
      router.push(`/libro/${id}`);
    } catch (error) {
      console.error('Error al crear el préstamo:', error);
      let errorMessage = 'Hubo un error al solicitar el préstamo. Inténtalo nuevamente.';
      if (error.code === 'permission-denied') {
        errorMessage = 'No tienes permiso para realizar esta acción.';
      } else if (error.code === 'not-found') {
        errorMessage = 'El libro no fue encontrado. Por favor, verifica la información.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'El servicio no está disponible en este momento. Intenta más tarde.';
      }
      toast.error(errorMessage);
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

      {/* Mostrar información del usuario si está logueado */}
      {usuarioDb ? (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">Información del usuario</h3>
          <p className="text-xl">Nombre: {usuarioDb.nombre || 'Desconocido'}</p>
          <p className="text-xl">Correo: {usuarioDb.email || 'No proporcionado'}</p>
          <p className="text-xl">Teléfono: {usuarioDb.telefono || 'No proporcionado'}</p>
        </div>
      ) : (
        <p className="text-xl text-red-600">No estás logueado. Por favor, inicia sesión para solicitar un préstamo.</p>
      )}

      {/* Formulario para solicitar el préstamo */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cantidad" className="block text-xl font-semibold mb-2">
            Cantidad a solicitar (Máximo {maxCantidad})
          </label>
          <input
            type="number"
            id="cantidad"
            value={cantidad}
            min="1"
            max={maxCantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            className="border border-gray-300 px-3 py-2 rounded w-full"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
        >
          Solicitar Préstamo
        </button>
      </form>

      <ToastContainer />
    </div>
  );
};

export default SolicitarPrestamo;
