// /pages/404.js
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold">404 - Página no encontrada</h1>
      <p className="mt-4 text-lg">Lo sentimos, la página que buscas no existe.</p>
      <Link href="/" className="mt-4 inline-block text-blue-500">
        Volver al inicio
      </Link>
    </div>
  );
}
