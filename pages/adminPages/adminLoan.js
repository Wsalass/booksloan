import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase'; // Ajusta la ruta
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth'; // Obtener la información del usuario

const GestionarPrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [filteredPrestamos, setFilteredPrestamos] = useState([]);
  const [filter, setFilter] = useState('pendiente'); // Filtro de estado
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Obtener la información del usuario desde el hook

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const prestamosRef = collection(db, 'prestamos');
        const prestamosSnapshot = await getDocs(prestamosRef);
        const prestamosList = prestamosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrestamos(prestamosList);
        setFilteredPrestamos(prestamosList.filter(p => p.estado === filter)); // Filtrar por estado
      } catch (error) {
        console.error('Error al obtener las solicitudes de préstamo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, [filter]); // Recargar cuando el filtro cambie

  const handleDecision = async (id, decision) => {
    try {
      const prestamoRef = doc(db, 'prestamos', id);
      await updateDoc(prestamoRef, { estado: decision });
      alert(`Solicitud de préstamo ${decision}.`);
      setPrestamos(prestamos.filter(prestamo => prestamo.id !== id));
    } catch (error) {
      console.error(`Error al ${decision} la solicitud de préstamo:`, error);
      alert(`Hubo un error al ${decision} la solicitud de préstamo.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'prestamos', id));
      alert('Préstamo rechazado eliminado.');
      setPrestamos(prestamos.filter(prestamo => prestamo.id !== id));
    } catch (error) {
      console.error('Error al eliminar el préstamo:', error);
    }
  };

  const calcularDiasRestantes = (fechaDevolucion) => {
    const hoy = new Date();
    const fechaDevolucionDate = new Date(fechaDevolucion);
    const diferenciaEnTiempo = fechaDevolucionDate.getTime() - hoy.getTime();
    const diferenciaEnDias = Math.ceil(diferenciaEnTiempo / (1000 * 3600 * 24));
    return diferenciaEnDias > 0 ? `${diferenciaEnDias} días restantes` : 'Fecha de devolución vencida';
  };

  if (loading) return <p className="text-center">Cargando...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6">Gestión de Préstamos</h1>

      {/* Filtro de estado */}
      <div className="mb-4">
        <label htmlFor="estado" className="mr-2">Filtrar por estado:</label>
        <select
          id="estado"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded"
        >
          <option value="pendiente">Pendiente</option>
          <option value="aceptado">Aceptado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className='bg-gray-100'>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días para devolución</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrestamos.map((prestamo) => (
            <tr key={prestamo.id}>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{prestamo.id}</td>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{prestamo.usuario.nombre}</td>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{prestamo.libro.titulo}</td>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{prestamo.cantidadSolicitada}</td>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{prestamo.estado}</td>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {prestamo.estado === 'aceptado' ? calcularDiasRestantes(prestamo.fechaDevolucion) : 'N/A'}
              </td>
              <td className="border border-gray-300 p-2">
                {prestamo.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleDecision(prestamo.id, 'aceptado')}
                      className="bg-green-500 hover:bg-green-400 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleDecision(prestamo.id, 'rechazado')}
                      className="bg-red-500 hover:bg-red-400 text-white font-bold py-1 px-2 rounded"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {prestamo.estado === 'rechazado' && (
                  <button
                    onClick={() => handleDelete(prestamo.id)}
                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-1 px-2 rounded"
                  >
                    Eliminar
                  </button>
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
