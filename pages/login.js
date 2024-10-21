import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'El correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Este usuario ha sido deshabilitado.';
    case 'auth/user-not-found':
      return 'No hay un usuario registrado con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/email-already-in-use':
      return 'Ya hay una cuenta asociada a este correo electrónico.';
    default:
      return 'Ocurrió un error. Por favor, intenta de nuevo.';
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reiniciar error antes de intentar iniciar sesión

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await auth.signOut();
        toast.warn('Por favor, verifica tu correo electrónico antes de iniciar sesión.', {
          position: "top-center",
          autoClose: 5000,
        });
        return;
      }

      toast.success('Inicio de sesión exitoso!', {
        position: "top-center",
        autoClose: 5000,
      });
      router.push('/');
    } catch (error) {
      const friendlyMessage = getErrorMessage(error.code);
      setError(friendlyMessage);
      toast.error(friendlyMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-verde-claro"
              placeholder="tucorreo@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-verde-claro"
              placeholder="*********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-4 text-center">
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="flex flex-col items-center">
            <button
              type="submit"
              className="w-full bg-verde-claro text-white py-2 px-4 rounded hover:bg-verde-medio focus:outline-none focus:ring focus:ring-verde-medio"
            >
              Iniciar Sesión
            </button>
            <div className="mt-4 text-center">
              <p>¿No tienes una cuenta? <a href="/register" className="text-verde-claro hover:text-verde-medio">Regístrate</a></p>
            </div>
            <div className="mt-4 text-center">
              <p>¿Olvidaste tu contraseña?{' '}<a href="/password-reset" className="text-verde-claro hover:text-verde-medio">Recuperar Contraseña</a></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
