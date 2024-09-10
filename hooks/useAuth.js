// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase'; // Asegúrate de que estas exportando correctamente desde lib/firebase
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Obtener el rol del usuario desde la colección 'usuarios'
        const userDocRef = doc(db, 'usuarios', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser(authUser);
          setRole(userDoc.data().rol_id);
        } else {
          // Maneja el caso donde el documento del usuario no existe
          setUser(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return { user, role, logout };
};
