// App.js
// Punto de entrada principal de la aplicación.
// Aquí se configura el proveedor de Redux y el navegador principal.

import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth'; // Importar onAuthStateChanged
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator'; // Importa el navegador principal
import { auth as firebaseAuth } from './src/services/firebase'; // Importar auth de Firebase
import store from './src/store'; // Importa la configuración del store de Redux
import { setLoading, setUser } from './src/store/slices/authSlice'; // Importar acciones de authSlice
// import { initDB } from './src/database/sqlite'; // Descomentar cuando se configure SQLite

// (Opcional) Inicializar la base de datos SQLite al arrancar la app
// initDB()
//   .then(() => {
//     console.log('Base de datos SQLite inicializada');
//   })
//   .catch(err => {
//     console.log('Error al inicializar SQLite:', err);
//   });

// Componente para manejar el listener de autenticación
const AuthGate = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true)); // Indicar que estamos verificando el estado de auth
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        // Usuario está logueado
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL, // Añadir photoURL
        }));
      } else {
        // Usuario no está logueado
        dispatch(setUser(null));
      }
      // setLoading(false) se maneja dentro de setUser en authSlice
    });

    return () => unsubscribe(); // Limpiar la suscripción al desmontar
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