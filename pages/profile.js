// pages/profile.js
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [ficha, setFicha] = useState('');
  const [tecnologo, setTecnologo] = useState('');
  const [librosPrestados, setLibrosPrestados] = useState([]);
  const [fotoPreview, setFotoPreview] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const userRef = doc(db, 'usuarios', user.uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            setUserData(data);
            setNombre(data.nombre);
            setFechaNacimiento(data.fecha_nacimiento);
            setTelefono(data.telefono || '');
            setFotoPerfil(data.foto_perfil || '');
            setFicha(data.ficha || '');
            setTecnologo(data.tecnologo || '');

            const prestamosRef = collection(db, 'prestamos');
            const q = query(prestamosRef, where('user_id', '==', user.uid));
            const snapshot = await getDocs(q);
            const prestamos = await Promise.all(snapshot.docs.map(async (doc) => {
              const detalleRef = doc(db, 'detalles_prestamos', doc.id);
              const detalleSnapshot = await getDoc(detalleRef);
              return detalleSnapshot.exists() ? detalleSnapshot.data() : null;
            }));
            setLibrosPrestados(prestamos.filter(libro => libro !== null));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        router.push('/login');
      }
    };

    fetchUserData();
  }, [router]);

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
    const auth = getAuth();
    const user = auth.currentUser;

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
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
  };

  if (!userData) return <p className="text-center text-red-500">Cargando datos...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Perfil de Usuario</h1>
      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="relative w-32 h-32 mb-4 md:mb-0">
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

        <div className="flex-1 md:ml-6">
          <div className="mb-4">
            <label className="block text-xl font-semibold mb-2 text-gray-700">Nombre:</label>
            {editMode ? (
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            ) : (
              <p className="text-xl text-gray-600">{nombre}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xl font-semibold mb-2 text-gray-700">Fecha de Nacimiento:</label>
            {editMode ? (
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            ) : (
              <p className="text-xl text-gray-600">{fechaNacimiento}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xl font-semibold mb-2 text-gray-700">Teléfono:</label>
            {editMode ? (
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            ) : (
              <p className="text-xl text-gray-600">{telefono}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xl font-semibold mb-2 text-gray-700">Tecnólogo:</label>
            {editMode ? (
              <input
                type="text"
                value={tecnologo}
                onChange={(e) => setTecnologo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            ) : (
              <p className="text-xl text-gray-600">{tecnologo}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xl font-semibold mb-2 text-gray-700">Ficha:</label>
            {editMode ? (
              <input
                type="text"
                value={ficha}
                onChange={(e) => setFicha(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
            ) : (
              <p className="text-xl text-gray-600">{ficha}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center mb-6">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          >
            Editar
          </button>
        )}
      </div>

      <h2 className="text-3xl font-bold mt-8 mb-4">Libros Prestados</h2>
      {librosPrestados.length > 0 ? (
        <ul className="space-y-4">
          {librosPrestados.map((libro, index) => (
            <li key={index} className="border border-gray-300 p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold">{libro.titulo}</h3>
              <p>Fecha de Préstamo: {libro.fecha_prestamo}</p>
              <p>Fecha de Devolución: {libro.fecha_devolucion}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No has prestado ningún libro.</p>
      )}
    </div>
  );
};

export default Profile;
