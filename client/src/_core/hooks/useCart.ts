import { useCallback, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  id: string; // unique identifier for this cart item (productId-color-size)
  productId: number;
  productName: string;
  productImage: string;
  color: 'Branco' | 'Marrom' | 'Verde';
  size: 'P' | 'M' | 'G';
  sizeLabel: string;
  price: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'santos-anjos-cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cart, isLoaded]);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    const itemId = `${item.productId}-${item.color}-${item.size}`;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === itemId);
      
      if (existingItem) {
        // If item already exists, increase quantity
        return prevCart.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        // Add new item
        return [...prevCart, { ...item, id: itemId }];
      }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('R$', '').replace(',', '.'));
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const totalPriceFormatted = useMemo(() => {
    return `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
  }, [totalPrice]);

  return {
    cart,
    totalItems,
    totalPrice,
    totalPriceFormatted,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoaded,
  };
}
