// src/services/firebase.js
// Configuración e inicialización de Firebase.
// ¡¡¡REEMPLAZA ESTO CON TUS PROPIAS CREDENCIALES DE FIREBASE!!!
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, serverTimestamp } from "firebase/database";
import { getStorage } from "firebase/storage"; // Importar getStorage

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI", 
  authDomain: "TU_AUTH_DOMAIN_AQUI.firebaseapp.com", 
  databaseURL: "https://TU_DATABASE_URL_AQUI.firebaseio.com", 
  projectId: "TU_PROJECT_ID_AQUI", 
  storageBucket: "TU_STORAGE_BUCKET_AQUI.appspot.com", 
  messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI", 
  appId: "TU_APP_ID_AQUI" 
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


const auth = getAuth(app);
const database = getDatabase(app); 
const storage = getStorage(app); // Inicializar Firebase Storage

export { auth, database, serverTimestamp, storage }; // Exportar storage y serverTimestamp
export default app; 