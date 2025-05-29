// App.js
// Punto de entrada principal de la aplicación.
// Aquí se configura el proveedor de Redux y el navegador principal.

import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { initDB } from './src/database/sqlite'; // Importar initDB
import AppNavigator from './src/navigation/AppNavigator';
import { auth as firebaseAuth } from './src/services/firebase';
import store from './src/store';
import { setLoading, setUser } from './src/store/slices/authSlice';
import { loadCart } from './src/store/slices/cartSlice'; // Importar thunk para cargar carrito

// Inicializar la base de datos SQLite al arrancar la app
initDB()
  .then(() => {
    console.log('[App.js] Base de datos SQLite inicializada exitosamente.');
    // Despachar la carga del carrito desde SQLite después de inicializar la BD
    // Esto se podría hacer aquí o dentro de un useEffect en un componente raíz
    // Para asegurar que el store está disponible, lo haremos en AuthGate.
  })
  .catch(err => {
    console.error('[App.js] Error al inicializar SQLite:', err);
  });

// Componente para manejar el listener de autenticación y la carga inicial de datos
const AuthGate = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Cargar carrito desde SQLite al montar este componente raíz
    dispatch(loadCart());

    dispatch(setLoading(true)); 
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL, 
        }));
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe(); 
  }, [dispatch]);

  return <AppNavigator />;
};


export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AuthGate />
      </NavigationContainer>
    </Provider>
  );
}