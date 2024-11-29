import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase';
import { doc, getDoc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import useLoan from '../../../hooks/useLoan'; // Asegúrate de que el hook se importa correctamente
import { toast } from 'react-toastify';

const SolicitarPrestamo = () => {
  const [libro, setLibro] = useState(null);
  const [autores, setAutores] = useState([]);
  const [editorial, setEditorial] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [maxCantidad, setMaxCantidad] = useState(3);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();
  const { loans, loading: loansLoading, error: loansError, fetchUserLoans } = useLoan();  // Usamos el hook useLoan
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (user?.uid) {
      fetchUserLoans(user.uid); // Llamamos a la función de préstamos al cargar el componente
    }
  }, [user, fetchUserLoans]);

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

  const fetchLibro = async () => {
    if (!id) return;

    try {
      const libroRef = doc(db, 'libros', id);
      const libroSnapshot = await getDoc(libroRef);
      if (libroSnapshot.exists()) {
        const libroData = libroSnapshot.data();
        setLibro(libroData);
        if (libroData.autor_id) {
          await fetchAutores(libroData.autor_id);
        }
        if (libroData.editorial_id) {
          await fetchEditorial(libroData.editorial_id);
        }
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
    fetchLibro();
  }, [id]);

  useEffect(() => {
    if (user) {
      const limite = obtenerLimiteLibros(userData?.rol_id);
      setMaxCantidad(limite);
    }
  }, [user, userData]);

  const canRequestLoan = () => {
    if (!user) return false;
    const activeLoans = countActiveLoans(loans);
    const roleLimit = obtenerLimiteLibros(userData?.rol_id);
    
    if (userData?.rol_id === '9EcXJe1Hfrc5pZw84bwI') { // Administrador
      return false;
    }

    return activeLoans < roleLimit;
  };

  const countActiveLoans = (loans) => {
    return loans?.filter(loan => loan.estado === 'pendiente').length || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Debes estar logueado para solicitar un préstamo.');
      return;
    }

    if (!libro) {
      toast.error('No se encontró el libro. Intenta más tarde.');
      return;
    }

    if (!canRequestLoan()) {
      toast.error('Ya has alcanzado tu límite de préstamos.');
      return;
    }

    if (!userData?.telefono) {
      toast.error('Por favor, completa tu número de teléfono antes de solicitar un préstamo.');
      return;
    }

    const cantidadDisponible = libro.cantidad || 0;

    if (cantidad < 1 || cantidad > cantidadDisponible) {
      toast.error('La cantidad solicitada no es válida.');
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
        nombre: userData?.nombre || 'Desconocido',
        email: userData?.email || 'No proporcionado',
        telefono: userData?.telefono || 'No proporcionado',
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
      toast.error('Hubo un error al solicitar el préstamo. Inténtalo nuevamente.');
    }
  };

  if (loading) return <p className="text-center">Cargando...</p>;

  if (!libro) return <p className="text-center">No se encontró el libro.</p>;

  return (
    <div className="container mx-auto px-4 py-6">

  
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Libro: {libro.titulo}</h2>
        <p className="text-xl">Cantidad disponible: {libro.cantidad}</p>
        <p className="text-xl">Autores: {autores.length > 0 ? autores.join(', ') : 'Desconocido'}</p>
        <p className="text-xl">Editorial: {editorial || 'Desconocida'}</p>
      </div>

      {/* Mostrar información del usuario si está logueado */}
      {userData ? (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">Información del usuario</h3>
          <p className="text-xl">Nombre: {userData.nombre || 'Desconocido'}</p>
          <p className="text-xl">Correo: {userData.email || 'No proporcionado'}</p>
          <p className="text-xl">Teléfono: {userData.telefono || 'No proporcionado'}</p>
        </div>
      ) : (
        <p className="text-xl text-red-600">No estás logueado. Por favor, inicia sesión para solicitar un préstamo.</p>
      )}

      {/* Formulario para solicitar el préstamo */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cantidad" className="block text-xl font-medium">Cantidad de libros:</label>
          <input
            type="number"
            id="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
            max={libro.cantidad}
            className="border rounded-md px-4 py-2 w-full"
          />
        </div>

        <button
          type="submit"
          className={`py-2 px-6 rounded-md ${canRequestLoan() ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
          disabled={!canRequestLoan()}
        >
          Solicitar préstamo
        </button>
      </form>
    </div>
  );
};

export default SolicitarPrestamo;
