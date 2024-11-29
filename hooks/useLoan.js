import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

const useLoan = () => {
  const { user, loading: authLoading } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const countActiveLoans = (loans) => {
    return loans.filter(loan => loan.estado === 'pendiente' || loan.estado === 'aprobado').length;
  };

  // Función para obtener los préstamos del usuario autenticado
  const fetchUserLoans = async () => {
    if (!user || authLoading) return;

    setLoading(true);
    try {
      const loansRef = collection(db, 'prestamos');
      const loanQuery = query(loansRef, where('usuarioId', '==', user.uid));
      const loanSnapshot = await getDocs(loanQuery);

      const userLoans = await Promise.all(
        loanSnapshot.docs.map(async (loanDoc) => {
          const loanData = loanDoc.data();
          const libroRef = doc(db, 'libros', loanData.libroId);
          const libroSnapshot = await getDoc(libroRef);

          if (libroSnapshot.exists()) {
            return {
              ...loanData,
              prestamoId: loanDoc.id,
              libro: { ...libroSnapshot.data(), id: libroSnapshot.id },
            };
          }
          return null;
        })
      );

      setLoans(userLoans.filter((loan) => loan !== null));
    } catch (err) {
      console.error('Error al obtener los préstamos:', err);
      setError('No se pudieron cargar los préstamos.');
    } finally {
      setLoading(false);
    }
  };

  // Función para devolver un libro
  const returnBook = async (loanId) => {
    try {
      const loanRef = doc(db, 'prestamos', loanId);
      const loanSnapshot = await getDoc(loanRef);
      const loanData = loanSnapshot.data();

      // Incrementar la cantidad disponible del libro
      const libroRef = doc(db, 'libros', loanData.libroId);
      await updateDoc(libroRef, {
        cantidad: loanData.libro.cantidadDisponible + loanData.cantidadSolicitada,
      });

      // Cambiar el estado del préstamo a 'finalizado'
      await updateDoc(loanRef, { estado: 'finalizado' });

      // Actualizar préstamos en estado local
      setLoans((prevLoans) =>
        prevLoans.filter((loan) => loan.prestamoId !== loanId)
      );
    } catch (err) {
      console.error('Error al devolver el libro:', err);
      setError('Hubo un problema al devolver el libro.');
    }
  };

  useEffect(() => {
    fetchUserLoans();
  }, [user, authLoading]);

  return { loans, loading, error, fetchUserLoans, returnBook,countActiveLoans };
};

export default useLoan;
