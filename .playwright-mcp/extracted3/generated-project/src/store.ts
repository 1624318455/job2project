import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '@/store/products/reducer';

export const store = configureStore({
  reducer: {
    products: productsReducer,
  },
});