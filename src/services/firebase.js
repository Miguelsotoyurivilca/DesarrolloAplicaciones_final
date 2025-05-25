// src/services/firebase.js
// Configuración e inicialización de Firebase.
// ¡¡¡REEMPLAZA ESTO CON TUS PROPIAS CREDENCIALES DE FIREBASE!!!
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, serverTimestamp } from "firebase/database";
import { getStorage } from "firebase/storage"; // Importar getStorage

const firebaseConfig = {
  apiKey: "AIzaSyDc2yOKOnnxF8eVMX3awYI9hRoRypp_-Kk",
  authDomain: "miappmascotasecommerce.firebaseapp.com",
  projectId: "miappmascotasecommerce",
  storageBucket: "miappmascotasecommerce.firebasestorage.app",
  messagingSenderId: "176505676905",
  appId: "1:176505676905:web:1ccb8b9debf6de5ef1eef8",
  measurementId: "G-55GKDVFQQS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


const auth = getAuth(app);
const database = getDatabase(app); 
const storage = getStorage(app); // Inicializar Firebase Storage

export { auth, database, serverTimestamp, storage }; // Exportar storage y serverTimestamp
export default app; 