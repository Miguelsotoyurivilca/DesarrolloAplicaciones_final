// src/store/slices/cartSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  clearAllCartItemsDB,
  deleteCartItemDB,
  getCartItemsDB,
  insertCartItemDB,
  updateCartItemQuantityDB // Asegúrate que esta también esté definida si la usas
} from '../../database/sqlite'; // Importa tus funciones de SQLite

const initialState = {
  items: [],
  isLoading: false, // Añadir estado de carga para el carrito
  error: null,     // Añadir estado de error para el carrito
};

// NUEVO THUNK ASÍNCRONO para cargar el carrito desde SQLite
export const loadCart = createAsyncThunk(
  'cart/loadCart',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[cartSlice/loadCart] Intentando cargar items desde SQLite...');
      const itemsFromDB = await getCartItemsDB();
      console.log('[cartSlice/loadCart] Items cargados desde DB:', itemsFromDB);
      return itemsFromDB;
    } catch (error) {
      console.error('[cartSlice/loadCart] Error cargando carrito desde SQLite:', error);
      return rejectWithValue(error.toString());
    }
  }
);

// Thunks para sincronizar con la base de datos (se llamarán desde los reducers o acciones)
// Nota: Redux Toolkit recomienda que los efectos secundarios (como llamadas a DB) se manejen en thunks
// o en el middleware, no directamente en los reducers. Vamos a crear thunks para las operaciones de DB.

export const addItemAndSync = createAsyncThunk(
  'cart/addItemAndSync',
  async (product, { dispatch, getState, rejectWithValue }) => {
    try {
      // Primero actualiza el estado de Redux síncronamente
      dispatch(cartSlice.actions.addItem(product)); // Usaremos un reducer interno 'addItem'
      // Luego, actualiza SQLite
      const updatedItem = getState().cart.items.find(item => item.id === product.id);
      if (updatedItem) { // Asegurarse que el item y su cantidad son los correctos del store
        await insertCartItemDB(updatedItem); // insertOrReplace en SQLite
      }
      return getState().cart.items; // O el item añadido/actualizado
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const removeItemAndSync = createAsyncThunk(
  'cart/removeItemAndSync',
  async (itemId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(cartSlice.actions.removeItem(itemId));
      await deleteCartItemDB(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const incrementQuantityAndSync = createAsyncThunk(
  'cart/incrementQuantityAndSync',
  async (itemId, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(cartSlice.actions.incrementQuantity(itemId));
      const item = getState().cart.items.find(i => i.id === itemId);
      if (item) {
        await updateCartItemQuantityDB(itemId, item.quantity);
      }
      return { itemId, quantity: item?.quantity };
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const decrementQuantityAndSync = createAsyncThunk(
  'cart/decrementQuantityAndSync',
  async (itemId, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(cartSlice.actions.decrementQuantity(itemId)); // Esta se encarga de eliminar si quantity < 1
      const item = getState().cart.items.find(i => i.id === itemId);
      if (item) { // Si el item aún existe (cantidad > 0)
        await updateCartItemQuantityDB(itemId, item.quantity);
      } else { // Si el item fue eliminado (cantidad llegó a 0)
        await deleteCartItemDB(itemId);
      }
      return { itemId, quantity: item?.quantity };
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const clearCartAndSync = createAsyncThunk(
  'cart/clearCartAndSync',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(cartSlice.actions.clearLocalCart());
      await clearAllCartItemsDB();
      return;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Reducers síncronos para actualizar el estado inmediatamente
    // Estos serán llamados por los thunks después de que la operación de DB sea exitosa (o antes para UI optimista)
    addItem: (state, action) => { // Renombrado de addItemToCart para uso interno
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        // Asegurarse que los items tengan la misma estructura que en la BD (ej. productId si es diferente de id)
        state.items.push({ ...newItem, quantity: 1 });
      }
    },
    removeItem: (state, action) => { // Renombrado
      const itemIdToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== itemIdToRemove);
    },
    incrementQuantity: (state, action) => { // Renombrado
      const itemIdToIncrement = action.payload;
      const item = state.items.find(item => item.id === itemIdToIncrement);
      if (item) {
        item.quantity++;
      }
    },
    decrementQuantity: (state, action) => { // Renombrado
      const itemIdToDecrement = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemIdToDecrement); // Necesitamos el índice para splice
      if (itemIndex !== -1) {
        if (state.items[itemIndex].quantity > 1) {
          state.items[itemIndex].quantity--;
        } else {
          state.items.splice(itemIndex, 1); // Eliminar el ítem si la cantidad es 1 y se decrementa
        }
      }
    },
    clearLocalCart: (state) => { // Renombrado
      state.items = [];
    },
    setCartItems: (state, action) => { // Para establecer el carrito (ej. al cargar desde DB)
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.items = action.payload; // Reemplazar items con los de la BD
        state.isLoading = false;
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Podrías añadir casos para los otros thunks si necesitas manejar isLoading/error específicamente para ellos
      // Por ejemplo, para addItemAndSync:
      .addCase(addItemAndSync.pending, (state) => {
        // Opcional: state.isLoading = true; si quieres un feedback visual
      })
      .addCase(addItemAndSync.fulfilled, (state, action) => {
        // El estado ya fue actualizado por el dispatch síncrono dentro del thunk
      })
      .addCase(addItemAndSync.rejected, (state, action) => {
        state.error = action.payload; // Manejar error de sincronización
        // Podrías necesitar lógica para revertir el cambio optimista en Redux si la DB falla
      })
      // ... casos similares para removeItemAndSync, etc.
      .addCase(clearCartAndSync.fulfilled, (state) => {
          // El estado ya fue limpiado por el dispatch síncrono.
      });
  },
});

// Exportar los reducers síncronos si se necesitan fuera del slice (no es común)
// export const { addItem, removeItem, incrementQuantity, decrementQuantity, clearLocalCart, setCartItems } = cartSlice.actions;

// Los thunks ya se exportan arriba.
// Las acciones que se despacharán desde los componentes serán los thunks:
// addItemAndSync, removeItemAndSync, incrementQuantityAndSync, decrementQuantityAndSync, clearCartAndSync, loadCart

// Selectores
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalAmount = (state) =>
  state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectTotalCartItems = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);


export default cartSlice.reducer;