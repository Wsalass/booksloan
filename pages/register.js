import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Campo para el nombre
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Insertar los detalles del usuario en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: email,
        nombre: name,
        created_at: new Date().toISOString(),
      });

      router.push('/');
    } catch (error) {
      setError(`Error durante el registro: ${error.message}`);
    }
  };

  return (
    <div className="w-11/12 max-w-md mx-auto mt-10 backdrop-blur-lg rounded-lg shadow-2xl p-8text-black">
      <h2 className="text-3xl font-extrabold pb-6 text-center">Registro</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-6">
          <label htmlFor="name" className="block mb-2 text-lg font-medium">Nombre</label>
          <input
            type="text"
            id="name"
            className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full py-3 px-4"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-lg font-medium">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full py-3 px-4"
            placeholder="tucorreo@mail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-lg font-medium">Contraseña</label>
          <input
            type="password"
            id="password"
            className="bg-gray-100 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full py-3 px-4"
            placeholder="*********"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 pb-6 text-center text-lg">{error}</p>}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 font-bold rounded-lg text-lg py-3 px-6 w-full"
          >
            Registrarse
          </button>
          <div className="flex items-center text-sm mt-4">
            <p className="text-center font-bold ">¿Ya tienes una cuenta?</p>
            <p
              className="underline cursor-pointer ml-1 text-blue-400 hover:text-blue-500"
              onClick={() => router.push('/login')}
            >
              Inicia sesión
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
