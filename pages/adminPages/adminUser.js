import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../hooks/useAuth';

const roles = {
  '0gXv7x0EctdgRrVh96B7': 'Estudiante',
  '7qm4fox9AjtONPXh8YvR': 'Profesor',
  '9EcXJe1Hfrc5pZw84bwI': 'Administrador',
  'fNzerO5gAonx0c28MHfK': 'Funcionario',
};

const AdminUsers = () => {
  const { userData, role, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'usuarios');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchRoleOptions = () => {
      setRoleOptions(
        Object.entries(roles).map(([id, name]) => ({ id, name }))
      );
    };

    fetchUsers();
    fetchRoleOptions();
  }, []);

  if (loading) {
    return <p>Cargando información de usuario...</p>;
  }

  if (role !== '9EcXJe1Hfrc5pZw84bwI') {
    return <p>No tienes permisos para acceder a esta página.</p>;
  }

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      const userRef = doc(db, 'usuarios', userId);
      await updateDoc(userRef, { rol_id: newRoleId });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, rol_id: newRoleId } : user
        )
      );
      toast.success('Rol de usuario actualizado exitosamente!');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol del usuario.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">
        Administración de Usuarios
      </h1>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cambiar Rol
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.nombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {roles[user.rol_id] || 'Desconocido'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select
                  value={user.rol_id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {roleOptions.map((option) => (
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
      <ToastContainer />
    </div>
  );
};

export default AdminUsers;
