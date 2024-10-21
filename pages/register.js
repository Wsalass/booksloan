import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify'; // Importa ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos de Toastify

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z]).{6,}$/;
    return regex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres y una mayúscula.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    try {
      // Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el usuario en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: email,
        nombre: name,
        rol_id: '0gXv7x0EctdgRrVh96B7', // ID de rol predeterminado
        created_at: new Date().toISOString(),
      });

      // Enviar el correo de verificación
      await sendEmailVerification(user);

      // Cerrar la sesión automáticamente después del registro
      await signOut(auth);

      // Mostrar un mensaje al usuario
      toast.success('Registro exitoso. Por favor, verifica tu correo antes de iniciar sesión.'); // Usar toast para mensajes de éxito
    } catch (error) {
      handleFirebaseError(error); // Manejar el error de Firebase
    }
  };

  const handleFirebaseError = (error) => {
    let message;

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'El correo electrónico ya está en uso. Prueba con otro.';
        break;
      case 'auth/invalid-email':
        message = 'El correo electrónico ingresado no es válido.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Este tipo de registro no está permitido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres y una mayúscula.';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.';
        break;
      default:
        message = `Error durante el registro: ${error.message}`;
    }

    toast.error(message); // Usar toast para mostrar el mensaje de error
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Registro</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-5">
            <label htmlFor="name" className="block text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-verde-claro"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-verde-claro"
              placeholder="tucorreo@mail.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-verde-claro"
              placeholder="*********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-gray-700 mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirm-password"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-verde-claro"
              placeholder="*********"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordError && <p className="text-red-500 text-center text-lg mb-4">{passwordError}</p>}
          <div className="flex flex-col items-center">
            <button
              type="submit"
              className="w-full bg-verde-claro text-white py-2 rounded hover:bg-verde-medio transition duration-300"
            >
              Registrarse
            </button>
            <div className="mt-4 text-center">
              <p>¿Ya tienes una cuenta? <a href="/login" className="text-verde-claro hover:text-verde-medio">Inicia sesión</a></p>
            </div>
          </div>
        </form>
        <ToastContainer /> {/* Agrega el contenedor de Toastify */}
      </div>
    </div>
  );
};

export default Register;
