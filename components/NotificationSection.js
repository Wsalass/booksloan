import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth'; // Importa el hook de autenticación
import useLoan from '../hooks/useLoan'; // Importa el hook de préstamos
import { format } from 'date-fns'; // Para formatear fechas

const NotificationCard = ({ title, message, type, isNearDeadline, returnDate }) => {
  const typeStyles = {
    rechazado: 'bg-red-100 text-red-600',
    aceptado: 'bg-green-100 text-green-800',
    pendiente: 'bg-gray-100 text-gray-700',
    nearDeadline: 'bg-yellow-100 text-yellow-800',
  };

  const styles = isNearDeadline ? typeStyles.nearDeadline : typeStyles[type] || typeStyles.pendiente;

  return (
    <li className={`p-3 rounded-md ${styles}`}>
      <h3 className="font-semibold">{title}</h3>
      <p>{message}</p>
      {isNearDeadline && (
        <p className="text-sm mt-1">Fecha de devolución: {returnDate}</p>
      )}
    </li>
  );
};

const NotificationButton = () => {
  const { user, userData } = useAuth(); // Obtén el usuario y sus datos
  const { loans, loading: loansLoading } = useLoan(); // Obtén los préstamos activos
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Cerrar la sección al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener notificaciones basadas en los préstamos
  useEffect(() => {
    if (!user) return;

    const today = new Date();
    const upcomingDeadline = new Date(today.setDate(today.getDate() + 5));

    const userNotifications = loans.map((loan) => {
      const returnDate = new Date(loan.fechaDevolucion);

      return {
        id: loan.prestamoId,
        title:
          loan.estado === 'aceptado'
            ? 'Préstamo aceptado'
            : loan.estado === 'rechazado'
            ? 'Préstamo rechazado'
            : 'Préstamo pendiente',
        message:
          loan.estado === 'aceptado'
            ? `El préstamo para el libro "${loan.libro.titulo}" fue aceptado.`
            : loan.estado === 'rechazado'
            ? `El préstamo para el libro "${loan.libro.titulo}" fue rechazado.`
            : `Tu solicitud para el libro "${loan.libro.titulo}" está en revisión.`,
        type: loan.estado,
        isNearDeadline: returnDate <= upcomingDeadline && loan.estado === 'aceptado',
        returnDate: format(returnDate, 'dd/MM/yyyy'),
      };
    });

    setNotifications(userNotifications);
  }, [user, loans]);

  if (!user || loansLoading) return null; // No muestra nada si el usuario no está logueado o si los préstamos están cargando

  return (
    <div className="fixed bottom-4 right-4">
      {/* Botón para mostrar/ocultar la sección */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-500 transition-all"
      >
        {isOpen ? 'Cerrar Notificaciones' : 'Ver Notificaciones'}
      </button>

      {/* Sección de notificaciones */}
      {isOpen && (
        <div
          ref={ref}
          className="absolute top-0 right-0 w-80 bg-white shadow-lg p-4 border-l border-gray-200 z-50 h-screen overflow-y-auto"
        >
          <h2 className="text-lg font-bold text-gray-700 mb-4">Notificaciones</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No tienes notificaciones en este momento.</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} {...notification} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
