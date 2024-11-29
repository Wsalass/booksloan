import Link from 'next/link';
import { useRouter } from 'next/router';

const LibroCard = ({ libro }) => {
  const router = useRouter();

  const goToBookDetail = () => {
    router.push(`/libro/${libro.id}`);
  };
  return (
    <Link href={`/libro/${libro.id}`} as={`/libro/${libro.id}`}>
      <div className="bg-white shadow-md rounded-lg p-4 hhover:shadow-lg transition-transform transform hover:scale-105">
        <img 
          src={libro.imagen || "/default-book.png"} 
          alt={libro.titulo} 
          className="h-64 w-full object-cover object-center transition-transform duration-300 ease-in-out transform group-hover:scale-110"
        />
        <h3 className="text-xl font-bold text-gray-800 mt-4">{libro.titulo}</h3>
        <p className="text-gray-600">{libro.autor}</p>
      </div>
    </Link>
  );
};

export default LibroCard;
