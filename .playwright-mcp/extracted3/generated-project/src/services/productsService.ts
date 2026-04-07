import { Product } from '@/types';
import { productsMock } from '@/api/productsMock';

export const fetchProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(productsMock);
    }, 1000);
  });
};