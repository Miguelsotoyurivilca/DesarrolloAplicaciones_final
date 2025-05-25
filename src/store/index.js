// src/store/index.js
// Configuración principal del store de Redux.
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import productReducer from './slices/productSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer, 
    categories: categoryReducer, 
    cart: cartReducer, 
    orders: orderReducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;