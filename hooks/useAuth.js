// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null); // Nuevo estado para almacenar los datos completos del usuario

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Obtener el documento de usuario desde la colección 'usuarios'
        const userDocRef = doc(db, 'usuarios', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userInfo = userDoc.data();
          setUser(authUser);
          setRole(userInfo.rol_id);
          setUserData(userInfo); // Guardar la información completa del usuario
        } else {
          // Maneja el caso donde el documento del usuario no existe
          setUser(null);
          setRole(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
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

  return { user, role, userData, logout }; // Retornar también los datos completos del usuario
};
