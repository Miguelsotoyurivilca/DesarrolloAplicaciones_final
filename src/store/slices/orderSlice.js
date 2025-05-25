// src/store/slices/orderSlice.js
// Nuevo slice para manejar el estado de las órdenes.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createOrderInDB, getUserOrdersFromDB } from '../../services/databaseService';

const initialState = {
  orders: [], 
  isLoading: false,
  error: null,
};

export const processOrder = createAsyncThunk(
  'orders/processOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const newOrder = await createOrderInDB(orderData);
      return newOrder; 
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const ordersArray = await getUserOrdersFromDB(userId);
      return ordersArray;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearUserOrders: (state) => {
        state.orders = [];
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(processOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processOrder.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(processOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserOrders } = orderSlice.actions;

export const selectUserOrders = (state) => state.orders.orders;
export const selectOrdersLoading = (state) => state.orders.isLoading;
export const selectOrdersError = (state) => state.orders.error;


export default orderSlice.reducer;