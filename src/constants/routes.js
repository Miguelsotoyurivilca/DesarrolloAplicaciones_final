// src/constants/routes.js
// Define los nombres de las rutas para evitar errores tipográficos y facilitar las refactorizaciones.
export const ROUTES = {
  // Auth Stack
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  WELCOME: 'Welcome', // Pantalla de bienvenida opcional

  // Main Tab Navigator
  HOME_TAB: 'HomeTab', // Nombre para el grupo de Tabs
  PRODUCTS_TAB: 'ProductosTab', // Nombre para el grupo de Tabs de Productos
  CART_TAB: 'CarritoTab', // Nombre para el grupo de Tabs de Carrito
  PROFILE_TAB: 'PerfilTab', // Nombre para el grupo de Tabs de Perfil


  HOME: 'Home',
  PRODUCTS: 'Products',
  PRODUCT_DETAIL: 'ProductDetail',
  PRODUCTS_BY_CATEGORY: 'ProductsByCategory', // Nueva ruta para productos filtrados
  CATEGORIES: 'Categories', // Si tienes una pantalla específica para categorías
  CART: 'Cart',
  CHECKOUT: 'Checkout', // Pantalla para el proceso de pago
  PROFILE: 'Profile',
  ORDERS: 'Orders',
  ORDER_DETAIL: 'OrderDetail', // Pantalla para el detalle de una orden
  EDIT_PROFILE: 'EditProfile',

  // Otros
  SETTINGS: 'Settings',
};
