import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';

const PrestamoForm = ({ libroId }) => {
  const [prestamosActivos, setPrestamosActivos] = useState(0);
  const [maxPrestamos, setMaxPrestamos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fechaDevolucion, setFechaDevolucion] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState('');
  const [libroValido, setLibroValido] = useState(true);

  useEffect(() => {
    console.log('ID de libro recibido en useEffect:', libroId);

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUsuario(user);
      getMaxPrestamosForRole(user.uid).then(max => setMaxPrestamos(max));
    } else {
      setError('No hay usuario autenticado.');
    }
  }, []);

  useEffect(() => {
    if (libroId) {
      console.log('Verificando ID de libro:', libroId);
      fetchLibroValido();
    } else {
      console.error('ID de libro no proporcionado.');
      setError('ID de libro no proporcionado.');
      setLibroValido(false);
    }
  }, [libroId]);

  const fetchLibroValido = async () => {
    if (libroId) {
      try {
        const libroRef = doc(db, 'libros', libroId);
        const libroSnapshot = await getDoc(libroRef);
        if (libroSnapshot.exists()) {
          setLibroValido(true);
        } else {
          console.error('ID de libro no válido.');
          setLibroValido(false);
          setError('ID de libro no válido.');
        }
      } catch (error) {
        console.error('Error al verificar el ID del libro:', error);
        setError('Error al verificar el ID del libro.');
      }
    }
  };

  useEffect(() => {
    if (usuario) {
      const fetchPrestamos = async () => {
        try {
          const prestamosQuery = query(
            collection(db, 'prestamos'),
            where('usuario_id', '==', usuario.uid),
            where('devuelto', '==', false)
          );
          const prestamosSnapshot = await getDocs(prestamosQuery);
          setPrestamosActivos(prestamosSnapshot.size);
        } catch (error) {
          console.error('Error al obtener los préstamos:', error);
          setError('Error al obtener los préstamos.');
        }
        setLoading(false);
      };
      fetchPrestamos();
    }
  }, [usuario]);

  useEffect(() => {
    const fechaPrestamo = new Date();
    const fechaDev = new Date();
    fechaDev.setDate(fechaPrestamo.getDate() + 30);
    setFechaDevolucion(fechaDev);
  }, []);

  const getMaxPrestamosForRole = async (uid) => {
    try {
      const userRef = doc(db, 'usuarios', uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        switch (data.rol_id) {
          case '0gXv7x0EctdgRrVh96B7':
            return 3; // Estudiante
          case '7qm4fox9AjtONPXh8YvR':
            return 5; // Profesor
          case 'fNzerO5gAonx0c28MHfK':
            return 2; // Funcionario
          case '9EcXJe1Hfrc5pZw84bwI':
            return 5; // Administrador
          default:
            return 0;
        }
      } else {
        setError('Usuario no encontrado en la base de datos.');
        return 0;
      }
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
      setError('Error al obtener el rol del usuario.');
      return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario) {
      setError('No hay usuario autenticado.');
      return;
    }

    if (!libroId || !libroValido) {
      setError('ID de libro no válido.');
      return;
    }

    if (prestamosActivos >= maxPrestamos) {
      setError(`Has alcanzado el máximo de ${maxPrestamos} préstamos activos permitidos para tu rol.`);
      return;
    }

    const fechaPrestamo = new Date();

    try {
      await addDoc(collection(db, 'prestamos'), {
        usuario_id: usuario.uid,
        libro_id: libroId,
        fecha_prestamo: fechaPrestamo,
        fecha_devolucion: fechaDevolucion,
        devuelto: false,
      });
      alert('Préstamo registrado con éxito.');
      setPrestamosActivos((prev) => prev + 1);
    } catch (error) {
      console.error('Error al registrar el préstamo:', error);
      setError('Ocurrió un error al registrar el préstamo. Inténtalo de nuevo más tarde.');
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Solicitar Préstamo de Libro</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {usuario ? (
        <>
          <div className="mb-4">
            <p><strong>Usuario:</strong> {usuario.displayName || 'Nombre no disponible'}</p>
          </div>

          {prestamosActivos >= maxPrestamos ? (
            <p className="text-red-600">
              Has alcanzado el máximo de préstamos activos permitidos para tu rol. Devuelve algún libro para solicitar un nuevo préstamo.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Fecha de Préstamo:</label>
                <input
                  type="text"
                  value={format(new Date(), 'yyyy-MM-dd')} // Fecha actual
                  className="mb-4 px-4 py-2 border border-gray-300 rounded-lg w-full"
                  readOnly
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700">Fecha de Devolución (30 días después):</label>
                <input
                  type="text"
                  value={format(fechaDevolucion, 'yyyy-MM-dd')}
                  className="mb-4 px-4 py-2 border border-gray-300 rounded-lg w-full"
                  readOnly
                />
              </div>

              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Solicitar Préstamo
              </button>
            </form>
          )}
        </>
      ) : (
        <p>No hay usuario autenticado.</p>
      )}
    </div>
  );
};

export default PrestamoForm;
