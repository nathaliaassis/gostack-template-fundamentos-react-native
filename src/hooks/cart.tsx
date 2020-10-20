import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketPlace:products'
      );

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
      console.log('carrinho', products);

    }

    loadProducts();
  }, [products]);

  const addToCart = useCallback(async product => {
    const cartHasProduct = products.findIndex(item => item.id === product.id);

    if (cartHasProduct >= 0) {
      console.log('retorno ok ', product.id);

      return setProducts(
        products.map(p =>
          p.id === product.id ?
            { ...product, quantity: p.quantity + 1 } : p
        ))
    }
    else {
      return setProducts([...products, { ...product, quantity: 1 }]);
    }
    // return setProducts([...products, product]);
  }, [products]);

  const increment = useCallback(async id => {
    return setProducts(
      products.map(p =>
        p.id === id ?
          { ...p, quantity: p.quantity += 1 } : p
      ))
  }, [products]);

  const decrement = useCallback(async id => {
    return setProducts(
      products.map(p =>
        p.id === id ?
          { ...p, quantity: p.quantity -= 1 } : p
      ))
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
