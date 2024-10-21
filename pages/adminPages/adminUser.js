import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Roles de usuario
const roles = {
  '0gXv7x0EctdgRrVh96B7': 'Estudiante',
  '7qm4fox9AjtONPXh8YvR': 'Profesor',
  '9EcXJe1Hfrc5pZw84bwI': 'Administrador',
  'fNzerO5gAonx0c28MHfK': 'Funcionario',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [newRoleId, setNewRoleId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // Ajusta la cantidad de usuarios por página según tus necesidades

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'usuarios');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchRoleOptions = () => {
      setRoleOptions(Object.entries(roles).map(([id, name]) => ({ id, name })));
    };

    fetchUsers();
    fetchRoleOptions();
  }, []);

  const handleRoleChange = (userId, newRoleId) => {
    setCurrentUserId(userId);
    setNewRoleId(newRoleId);
    setModalOpen(true);
  };

  const confirmRoleChange = async () => {
    try {
      const userRef = doc(db, 'usuarios', currentUserId);
      await updateDoc(userRef, { rol_id: newRoleId });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === currentUserId ? { ...user, rol_id: newRoleId } : user
        )
      );
      toast.success('Rol de usuario actualizado exitosamente!');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol del usuario.');
    } finally {
      setModalOpen(false);
    }
  };

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Administración de Usuarios</h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cambiar Rol</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentUsers.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {roles[user.rol_id] || 'Desconocido'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select
                  value={user.rol_id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {roleOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="self-center">Página {currentPage} de {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal de Confirmación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Confirmación</h2>
            <p>¿Estás seguro de que deseas cambiar el rol del usuario?</p>
            <div className="mt-4">
              <button onClick={confirmRoleChange} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                Confirmar
              </button>
              <button onClick={() => setModalOpen(false)} className="bg-red-500 text-white px-4 py-2 rounded">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminUsers;
