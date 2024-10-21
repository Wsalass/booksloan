import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import ReactPaginate from 'react-paginate';
import { toast, ToastContainer } from 'react-toastify'; // Importa Toastify
import 'react-toastify/dist/ReactToastify.css'; // Importa el CSS de Toastify

const GestionarPrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [filteredPrestamos, setFilteredPrestamos] = useState([]);
  const [filter, setFilter] = useState('pendiente');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5); 
  const { user, userData } = useAuth(); 

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const prestamosRef = collection(db, 'prestamos');
        const prestamosSnapshot = await getDocs(prestamosRef);
        const prestamosList = prestamosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPrestamos(prestamosList);
      } catch (error) {
        setErrorMessage('Error al obtener las solicitudes de préstamo.');
        toast.error('Error al obtener las solicitudes de préstamo.'); // Usa Toastify
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrestamos();
  }, []);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    setFilteredPrestamos(prestamos.filter(p => {
      const fechaDevolucion = new Date(p.fechaDevolucion);
      return p.estado === filter || (filter === 'finalizado' && fechaDevolucion < thirtyDaysAgo);
    }));
  }, [prestamos, filter]);

  const handleDecision = async (id, decision) => {
    try {
      const prestamoRef = doc(db, 'prestamos', id);
      await updateDoc(prestamoRef, { estado: decision });
      toast.success(`Solicitud de préstamo ${decision}.`); // Usa Toastify
      setPrestamos(prev => prev.map(prestamo => prestamo.id === id ? { ...prestamo, estado: decision } : prestamo));
    } catch (error) {
      setErrorMessage(`Error al ${decision} la solicitud de préstamo.`);
      toast.error(`Error al ${decision} la solicitud de préstamo.`); // Usa Toastify
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'prestamos', id));
      toast.success('Préstamo rechazado eliminado.'); // Usa Toastify
      setPrestamos(prev => prev.filter(prestamo => prestamo.id !== id));
    } catch (error) {
      setErrorMessage('Error al eliminar el préstamo.');
      toast.error('Error al eliminar el préstamo.'); // Usa Toastify
      console.error('Error:', error);
    }
  };

  const calcularDiasRestantes = (fechaDevolucion) => {
    const hoy = new Date();
    const fechaDevolucionDate = new Date(fechaDevolucion);
    const diferenciaEnTiempo = fechaDevolucionDate.getTime() - hoy.getTime();
    const diferenciaEnDias = Math.ceil(diferenciaEnTiempo / (1000 * 3600 * 24));
    return diferenciaEnDias > 0 ? `${diferenciaEnDias} días restantes` : 'Fecha de devolución finalizada';
  };

  const pageCount = Math.ceil(filteredPrestamos.length / itemsPerPage);
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPrestamos = filteredPrestamos.slice(startIndex, endIndex);

  if (loading) return <p className="text-center">Cargando...</p>;
  if (errorMessage) return <p className="text-red-500 text-center">{errorMessage}</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer /> {/* Agrega el contenedor de Toastify */}
      <h1 className="text-4xl font-bold mb-6">Gestión de Préstamos</h1>

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
          <option value="finalizado">Finalizados</option>
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
          {currentPrestamos.map((prestamo) => (
            <tr key={prestamo.id}>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{prestamo.id}</td>
              <td className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {prestamo.usuario?.nombre || 'Usuario no disponible'}
              </td>
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

      {/* Paginación */}
      <ReactPaginate
        previousLabel={'← Anterior'}
        nextLabel={'Siguiente →'}
        breakLabel={'...'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        pageClassName={'page-item'}
        pageLinkClassName={'page-link'}
        previousClassName={'page-item'}
        previousLinkClassName={'page-link'}
        nextClassName={'page-item'}
        nextLinkClassName={'page-link'}
        activeClassName={'active'}
      />
    </div>
  );
};

export default GestionarPrestamos;
