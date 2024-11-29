import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';

const GestionarPrestamos = () => {
  const { userData, role, loading } = useAuth();
  const [prestamos, setPrestamos] = useState([]);
  const [filter, setFilter] = useState('pendiente');
  const [loadingData, setLoadingData] = useState(true);
  const [processing, setProcessing] = useState(false); // Para deshabilitar botones durante el procesamiento

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const prestamosRef = collection(db, 'prestamos');
        const prestamosSnapshot = await getDocs(prestamosRef);
        const prestamosList = prestamosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPrestamos(prestamosList);
      } catch (error) {
        toast.error('Error al obtener las solicitudes de préstamo.');
        console.error('Error:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPrestamos();
  }, []);

  if (loading || loadingData) {
    return <p className="text-center">Cargando datos...</p>;
  }

  if (role !== '9EcXJe1Hfrc5pZw84bwI') {
    return <p>No tienes permisos para gestionar préstamos.</p>;
  }

  // Función para actualizar la cantidad del libro
  const updateBookQuantity = async (bookId, quantityToAdd) => {
    try {
      const bookRef = doc(db, 'libros', bookId);
      const bookSnap = await getDoc(bookRef);
  
      if (bookSnap.exists()) {
        const bookData = bookSnap.data();
        const currentQuantity = parseInt(bookData.cantidad || '0');
        const updatedQuantity = currentQuantity + parseInt(quantityToAdd);
  
        // Actualizar la cantidad del libro en la base de datos
        await updateDoc(bookRef, { cantidad: updatedQuantity.toString() });
  
        toast.success('Cantidad de libros actualizada correctamente.');
      } else {
        toast.error('El libro no existe en la base de datos.');
      }
    } catch (error) {
      toast.error('Error al actualizar la cantidad del libro.');
      console.error('Error:', error);
    }
  };
  

  // Manejar la decisión sobre un préstamo
  const handleDecision = async (id, decision, bookId, quantity) => {
    if (processing) return; // Evitar múltiples clics mientras se procesa
    setProcessing(true);
  
    try {
      const prestamoRef = doc(db, 'prestamos', id);
  
      // Si se rechaza, actualiza el préstamo y la cantidad de libros disponibles
      if (decision === 'rechazado') {
        // Actualizar la cantidad del libro sumando los libros rechazados
        await updateBookQuantity(bookId, quantity);
      }
  
      // Cambiar el estado del préstamo
      await updateDoc(prestamoRef, { estado: decision });
  
      toast.success(`Solicitud de préstamo ${decision}.`);
  
      // Actualizar la lista de préstamos localmente
      setPrestamos((prev) =>
        prev.map((prestamo) =>
          prestamo.id === id ? { ...prestamo, estado: decision } : prestamo
        )
      );
    } catch (error) {
      toast.error('Error al actualizar el estado del préstamo.');
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-6">Gestión de Préstamos</h1>
      <div className="mb-4">
        <label htmlFor="estado" className="mr-2">
          Filtrar por estado:
        </label>
        <select
          id="estado"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="pendiente">Pendiente</option>
          <option value="aceptado">Aceptado</option>
          <option value="rechazado">Rechazado</option>
          <option value="finalizado">Finalizados</option>
        </select>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Libro</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prestamos
            .filter((prestamo) => prestamo.estado === filter)
            .map((prestamo) => (
              <tr key={prestamo.id}>
                <td>{prestamo.id}</td>
                <td>{prestamo.usuario?.nombre || 'Desconocido'}</td>
                <td>{prestamo.libro?.titulo || 'Desconocido'}</td>
                <td>{prestamo.cantidadSolicitada}</td>
                <td>{prestamo.estado}</td>
                <td>
                  {prestamo.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() =>
                          handleDecision(
                            prestamo.id,
                            'aceptado',
                            prestamo.libro.id,
                            -prestamo.cantidadSolicitada
                          )
                        }
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        disabled={processing}
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() =>
                          handleDecision(
                            prestamo.id,
                            'rechazado',
                            prestamo.libro.id,
                            prestamo.cantidadSolicitada
                          )
                        }
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        disabled={processing}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default GestionarPrestamos;
