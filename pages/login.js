// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importar desde firebase/auth
import { auth } from '../lib/firebase'; // Asegúrate de ajustar el path según tu configuración

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password); // Llamar a la función importada
      router.push('/'); // Redirige al inicio después del inicio de sesión exitoso
    } catch (error) {
      setError(error.message); // Muestra el error si ocurre
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-verde-claro text-white py-2 px-4 rounded hover:bg-verde-medio"
          >
            Iniciar sesión
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>¿No tienes una cuenta? <a href="/register" className="text-verde-claro hover:text-verde-medio">Regístrate</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
