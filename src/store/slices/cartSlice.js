// src/store/slices/cartSlice.js
// Slice para manejar el estado del carrito de compras.
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [], 
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart: (state, action) => {
      const newItem = action.payload; 
      const existingItem = state.items.find(item => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.items.push({ ...newItem, quantity: 1 });
      }
    },
    removeItemFromCart: (state, action) => {
      const itemIdToRemove = action.payload; 
      state.items = state.items.filter(item => item.id !== itemIdToRemove);
    },
    incrementItemQuantity: (state, action) => {
      const itemIdToIncrement = action.payload; 
      const item = state.items.find(item => item.id === itemIdToIncrement);
      if (item) {
        item.quantity++;
      }
    },
    decrementItemQuantity: (state, action) => {
      const itemIdToDecrement = action.payload; 
      const item = state.items.find(item => item.id === itemIdToDecrement);
      if (item) {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          state.items = state.items.filter(i => i.id !== itemIdToDecrement);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { 
    addItemToCart, 
    removeItemFromCart, 
    incrementItemQuantity, 
    decrementItemQuantity, 
    clearCart 
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalAmount = (state) => 
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
export const selectTotalCartItems = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);


export default cartSlice.reducer;