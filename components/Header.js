import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi'; // Paquete de íconos react-icons

const Header = () => {
  const { user, role, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  const isLoggedIn = Boolean(user);
  const isAdmin = role === '9EcXJe1Hfrc5pZw84bwI';

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="relative bg-lime-600 text-white py-6 px-4 shadow-xl transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center  mx-auto">
        <div className="text-2xl font-extrabold tracking-wide">
          <Link href="/" className="hover:text-white transition-colors duration-300">
            Autobooks
          </Link>
        </div>

        {/* Ícono de menú para pantallas pequeñas */}
        <div className="sm:hidden flex items-center">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>

        <nav className={`space-x-8 hidden sm:flex items-center`}>
          <Link href="/catalog" className="block bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
            Catálogo
          </Link>
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="block bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="block bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg">
                Perfil
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Administración
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-400 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>

        {/* Menú desplegable para móviles */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-lime-600 p-4 rounded-b-3xl sm:hidden">
            <nav className="space-y-4">
              <Link href="/catalog" className="block text-lg hover:text-gray-300 transition-colors duration-300">
                Catálogo
              </Link>
              {!isLoggedIn ? (
                <>
                  <Link href="/login" className="block text-lg hover:text-gray-300 transition-colors duration-300">
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile" className="block text-lg hover:text-gray-300 transition-colors duration-300">
                    Perfil
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block bg-white text-verde-claro px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Administración
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-400 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
