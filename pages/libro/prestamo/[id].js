import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../lib/firebase'; // Ajusta la ruta
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth'; // Obtener la información del usuario

const SolicitarPrestamo = () => {
  const [libro, setLibro] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Obtener la información del usuario desde el hook
  const router = useRouter();
  const { id } = router.query; // Obtener el id del libro desde la URL

  useEffect(() => {
    const fetchLibro = async () => {
      if (!id) return;

      try {
        const libroRef = doc(db, 'libros', id);
        const libroSnapshot = await getDoc(libroRef);
        if (libroSnapshot.exists()) {
          setLibro(libroSnapshot.data());
        } else {
          console.error('El libro no existe');
          router.push('/404'); // Redirigir a la página de error si el libro no existe
        }
      } catch (error) {
        console.error('Error al obtener detalles del libro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibro();
  }, [id, router]);

  // Mostrar alerta si el usuario no tiene teléfono
  useEffect(() => {
    if (user && !user.telefono) {
      alert('Debes agregar un número de teléfono a tu perfil antes de solicitar un préstamo.');
      router.push('/profile'); // Redirigir a la página de perfil para completar los datos
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !libro) return;

    const nuevoPrestamo = {
      libroId: id,
      usuarioId: user.uid,
      cantidadSolicitada: cantidad,
      estado: 'pendiente', // Estado inicial
      fechaSolicitud: new Date(),
      usuario: {
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono, // Solo enviará el teléfono si está presente
      },
      libro: {
        titulo: libro.titulo,
        autores: libro.autores || ['Desconocido'],
        editorial: libro.editorial || 'Desconocida',
        cantidadDisponible: libro.cantidad
      }
    };

    try {
      // Crear el detalle del préstamo en Firebase
      await addDoc(collection(db, 'prestamos'), nuevoPrestamo);
      alert('Solicitud de préstamo enviada. Espera la autorización del administrador.');
      router.push(`/libro/${id}`); // Redirigir de vuelta a la página del libro
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
        <p className="text-xl">Autor: {libro.autores?.join(', ') || 'Desconocido'}</p>
        <p className="text-xl">Editorial: {libro.editorial || 'Desconocida'}</p>
      </div>

      {/* Mostrar información del usuario */}
      {user && (
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">Información del usuario</h3>
          <p className="text-xl">Nombre: {user.nombre}</p>
          <p className="text-xl">Correo: {user.email}</p>
          <p className="text-xl">Teléfono: {user.telefono}</p>
        </div>
      )}

      {/* Formulario para solicitar el préstamo */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-xl font-semibold mb-2" htmlFor="cantidad">
            Cantidad de libros a solicitar:
          </label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            className="border border-gray-300 p-2 w-full"
            min="1"
            max={libro.cantidad}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
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
