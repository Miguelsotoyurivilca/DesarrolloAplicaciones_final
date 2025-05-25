// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc2yOKOnnxF8eVMX3awYI9hRoRypp_-Kk",
  authDomain: "miappmascotasecommerce.firebaseapp.com",
  projectId: "miappmascotasecommerce",
  storageBucket: "miappmascotasecommerce.firebasestorage.app",
  messagingSenderId: "176505676905",
  appId: "1:176505676905:web:1ccb8b9debf6de5ef1eef8",
  measurementId: "G-55GKDVFQQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
