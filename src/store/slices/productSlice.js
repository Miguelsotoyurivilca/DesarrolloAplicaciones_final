// src/store/slices/productSlice.js
// Slice para manejar el estado de los productos.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProductById, getProducts } from '../../services/databaseService';

const initialState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ categoryId, limit } = {}, { rejectWithValue }) => { 
    try {
      const productsArray = await getProducts(categoryId, limit);
      return productsArray;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const product = await getProductById(productId);
      if (!product) {
        return rejectWithValue('Producto no encontrado.');
      }
      return product;
    } catch (error) {
      return rejectWithValue(error.toString());
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProducts: (state) => { 
        state.products = [];
        state.selectedProduct = null; 
        state.error = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = productSlice.actions;
export default productSlice.reducer;
