import React from 'react';
import { Product } from '@/types';
import { fetchProducts } from '@/services/productsService';
import { Card } from '@/components/Card';

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  return (
    <div className="product-list">
      {products.map((product) => (
        <Card key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;