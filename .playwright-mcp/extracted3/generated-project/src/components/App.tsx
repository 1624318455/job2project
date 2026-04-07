import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/services/productsService';
import { selectProducts, fetchProductsAction } from '@/store/products';
import ProductList from '@/components/ProductList';
import { Loader } from '@/components/Loader';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const isLoading = useSelector((state) => state.products.isLoading);

  useEffect(() => {
    dispatch(fetchProductsAction());
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
  }

  return <ProductList products={products} />;
};

export default App;