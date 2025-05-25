// Servicio para interactuar con Firebase Realtime Database.
import { equalTo, get, limitToFirst, orderByChild, push, query, ref, set } from 'firebase/database';
import { database, serverTimestamp } from './firebase';

export const getCategories = async () => {
  try {
    const categoriesRef = ref(database, 'categories');
    const snapshot = await get(categoriesRef);
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      return Object.keys(categoriesData).map(key => ({
        id: key,
        ...categoriesData[key],
      }));
    } else {
      console.log("No hay categorías disponibles");
      return [];
    }
  } catch (error) {
    console.error("Error obteniendo categorías: ", error);
    throw error; 
  }
};

export const getProducts = async (categoryId, limit) => {
  try {
    let productsQuery = ref(database, 'products');

    if (categoryId) {
      productsQuery = query(productsQuery, orderByChild('category'), equalTo(categoryId));
    } else if (limit) {
      productsQuery = query(ref(database, 'products'), limitToFirst(limit));
    }
    
    const snapshot = await get(productsQuery);
    if (snapshot.exists()) {
      const productsData = snapshot.val();
      let productsArray = Object.keys(productsData).map(key => ({
        id: key,
        ...productsData[key],
      }));
      return productsArray;
    } else {
      console.log("No hay productos disponibles" + (categoryId ? ` para la categoría ${categoryId}` : ""));
      return [];
    }
  } catch (error) {
    console.error("Error obteniendo productos: ", error);
    throw error;
  }
};


export const getProductById = async (productId) => {
  try {
    const productRef = ref(database, `products/${productId}`);
    const snapshot = await get(productRef);
    if (snapshot.exists()) {
      return { id: snapshot.key, ...snapshot.val() };
    } else {
      console.log(`Producto con ID ${productId} no encontrado.`);
      return null;
    }
  } catch (error) {
    console.error(`Error obteniendo producto por ID ${productId}: `, error);
    throw error;
  }
};

export const createOrderInDB = async (orderData) => {
  try {
    if (!orderData.userId) {
      throw new Error("El ID del usuario es requerido para crear una orden.");
    }
    const userOrdersRef = ref(database, `users/${orderData.userId}/orders`);
    const newOrderRef = push(userOrdersRef); 
    
    const orderWithTimestamp = {
      ...orderData,
      id: newOrderRef.key, 
      timestamp: serverTimestamp(), 
    };
    
    await set(newOrderRef, orderWithTimestamp);
    return { ...orderWithTimestamp, timestamp: Date.now() }; 
  } catch (error) {
    console.error("Error creando la orden en la BD: ", error);
    throw error;
  }
};

export const getUserOrdersFromDB = async (userId) => {
  try {
    if (!userId) {
      console.log("ID de usuario no proporcionado para obtener órdenes.");
      return [];
    }
    const userOrdersRef = ref(database, `users/${userId}/orders`);
    const ordersQuery = query(userOrdersRef, orderByChild('timestamp')); 
    
    const snapshot = await get(ordersQuery);
    if (snapshot.exists()) {
      const ordersData = snapshot.val();
      const ordersArray = Object.keys(ordersData).map(key => ({
        id: key, 
        ...ordersData[key],
      }));
      return ordersArray.reverse(); 
    } else {
      console.log(`No hay órdenes disponibles para el usuario ${userId}`);
      return [];
    }
  } catch (error) {
    console.error(`Error obteniendo órdenes para el usuario ${userId}: `, error);
    throw error;
  }
};
