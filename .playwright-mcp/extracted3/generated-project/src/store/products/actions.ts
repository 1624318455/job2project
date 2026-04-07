import { ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Product } from '@/types';
import { fetchProducts } from '@/services/productsService';

export const fetchProductsAction = (): ActionCreator<Promise<void>> => async (dispatch) => {
  try {
    const products = await fetchProducts();
    dispatch({
      type: 'FETCH_PRODUCTS_SUCCESS',
      payload: products,
    });
  } catch (error) {
    dispatch({
      type: 'FETCH_PRODUCTS_FAILURE',
      payload: error.message,
    });
  }
};

// === src/store/products/reducer.ts ===
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@/types';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsAction.fulfilled, (state, action) => {
        state.setProducts(action.payload);
      })
      .addCase(fetchProductsAction.rejected, (state, action) => {
        state.setError(action.payload);
      });
  },
});

export const { setProducts, setLoading, setError } = productsSlice.actions;
export default productsSlice.reducer;