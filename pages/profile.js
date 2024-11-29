import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth'; 
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify'; // Importa react-toastify
import useLoan from '../hooks/useLoan'; // Asegúrate de importar el hook useLoan
import Link from 'next/link';

const Profile = () => {
  const { user, role, authLoading } = useAuth(); 
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [ficha, setFicha] = useState('');
  const [tecnologo, setTecnologo] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [activeTab, setActiveTab] = useState('perfil');
  const router = useRouter();

  const { loans, loading: loansLoading, error: loansError } = useLoan(); // Usamos el hook useLoan

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = doc(db, 'usuarios', user.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);
            setNombre(data.nombre);
            setEmail(data.email);
            setFechaNacimiento(data.fecha_nacimiento);
            setTelefono(data.telefono || '');
            setFotoPerfil(data.foto_perfil || '');
            setFicha(data.ficha || '');
            setTecnologo(data.tecnologo || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user, authLoading, router]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (user) {
      try {
        const userRef = doc(db, 'usuarios', user.uid);
        await updateDoc(userRef, {
          nombre: nombre,
          fecha_nacimiento: fechaNacimiento,
          telefono: telefono,
          foto_perfil: fotoPreview || fotoPerfil,
          ficha: ficha,
          tecnologo: tecnologo,
        });
        setUserData({ ...userData, nombre, fecha_nacimiento, telefono, foto_perfil: fotoPreview || fotoPerfil, ficha, tecnologo });
        setEditMode(false);
        toast.success('Perfil actualizado exitosamente!');
      } catch (error) {
        console.error('Error updating user data:', error);
        toast.error('Error al actualizar el perfil.');
      }
    }
  };

  if (authLoading) return <p className="text-center text-red-500">Cargando datos...</p>;
  if (!userData) return <p className="text-center text-red-500">No se encontraron datos de usuario.</p>;

  const isEstu = role === '0gXv7x0EctdgRrVh96B7';
  const isProf = role === '7qm4fox9AjtONPXh8YvR';
  const isFunc = role === 'fNzerO5gAonx0c28MHfK';
  const isAdmi = role === '9EcXJe1Hfrc5pZw84bwI';

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="bg-wave text-white py-6 px-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <img
              src={fotoPreview || fotoPerfil || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEIUxqASqFgPHjQK11brYBvD8pp-l3YM42yQ&s'}
              alt="Foto de Perfil"
              className="w-full h-full object-cover rounded-full border border-gray-300 shadow-lg"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-gray-700 text-white rounded-full p-1 cursor-pointer">
                <input type="file" onChange={handleImageUpload} className="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4m0 0h2m-2 0v2m0-2H7m4 0h4" />
                </svg>
              </label>
            )}
          </div>
          <h1 className="text-3xl font-bold">{nombre}</h1>
        </div>
      </header>

      <div className="my-6">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`px-6 py-3 rounded-t-lg ${activeTab === 'perfil' ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-700'} transition-colors duration-300 shadow-md`}
          >
            Información de Perfil
          </button>
          {(isEstu || isProf || isFunc || isAdmi) && (
            <button onClick={() => setActiveTab('prestamos')} className={`px-6 py-3 rounded-t-lg ${activeTab === 'prestamos' ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-700'} transition-colors duration-300 shadow-md`}>
              Préstamos
            </button>
          )}
        </div>

        {activeTab === 'perfil' && (
          <div>
            {editMode ? (
              <div>
                {/* Formulario de edición del perfil */}
                <div className="mb-4">
                  <label className="block text-xl font-semibold mb-2 text-gray-700">Nombre:</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-xl font-semibold mb-2 text-gray-700">Email:</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                  />
                </div>

                {/* Resto de los campos de edición */}

                <button
                  onClick={handleSave}
                  className="bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-300"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg shadow-md ml-2 transition-colors duration-300"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xl font-semibold">Email: {email}</p>
                <p className="text-xl font-semibold">Fecha de Nacimiento: {fechaNacimiento}</p>
                <p className="text-xl font-semibold">Teléfono: {telefono}</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-lime-500 text-white px-6 py-2 rounded-lg shadow-md transition-colors duration-300"
                >
                  Editar Perfil
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prestamos' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Préstamos</h2>
            {loansLoading ? (
    <p>Cargando libros en préstamo...</p>
  ) : loansError ? (
    <p className="text-red-500">{loansError}</p>
  ) : loans.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {loans
        .filter((loan) => loan.estado === 'pendiente' || loan.estado === 'aceptado') // Filtrar préstamos
        .map((loan) => (
          <div
            key={loan.prestamoId}
            className="p-2 border border-gray-300 rounded-lg shadow-md bg-white"
          >
            <Link href={`/libro/${loan.libro.id}`}>
              <img
                src={loan.libro.imagen}
                alt={loan.libro.titulo}
                className="w-40 h-20 object-cover rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
            <Link href={`/libro/${loan.libro.id}`}>
              <h3 className="text-lg font-semibold cursor-pointer hover:text-blue-500 transition-colors">
                {loan.libro.titulo}
              </h3>
            </Link>

            <p className="text-sm mt-2">Fecha de devolución: {loan.fechaDevolucion}</p>
            <p className="text-sm">Estado: {loan.estado}</p>
          </div>
        ))}
    </div>
  ) : (
    <p>No tienes préstamos activos.</p>
  )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
