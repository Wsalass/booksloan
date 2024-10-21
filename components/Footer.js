import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-lime-600 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          {/* Sección de contacto */}
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Contacto</h2>
            <ul>
              <li className="mb-2">
                <a href="email:biblioteca.sena@misena.edu.co" className="hover:underline">
                biblioteca.sena@misena.edu.co
                </a>
              </li>
              <li className="mb-2">
                <a href="tel:3223775154" className="hover:underline">
                322 377 5154
                </a>
              </li>
            </ul>
          </div>

          {/* Sección de redes sociales */}
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Síguenos</h2>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 border-t border-gray-100 pt-4">
          <p className="text-center text-sm">&copy; {new Date().getFullYear()} BookLoan. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
