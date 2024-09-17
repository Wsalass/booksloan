import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); 
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z]).{6,}$/;
    return regex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres y una mayúscula.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'usuarios', user.uid), {
        email: email,
        nombre: name,
        rol_id: '0gXv7x0EctdgRrVh96B7',
        created_at: new Date().toISOString(),
      });

      router.push('/');
    } catch (error) {
      setError(`Error durante el registro: ${error.message}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded"
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
              className="w-full px-3 py-2 border border-gray-300 rounded"
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
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="*********"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordError && <p className="text-red-500 pb-6 text-center text-lg">{passwordError}</p>}
          {error && <p className="text-red-500 pb-6 text-center text-lg">{error}</p>}
          <div className="flex flex-col items-center">
            <button
              type="submit"
              className="w-full bg-verde-claro text-white py-2 px-4 rounded hover:bg-verde-medio"
            >
              Registrarse
            </button>
            <div className="mt-4 text-center">
              <p>¿Ya tienes una cuenta? <a href="/login" className="text-verde-claro hover:text-verde-medio">Inicia sesión</a></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
