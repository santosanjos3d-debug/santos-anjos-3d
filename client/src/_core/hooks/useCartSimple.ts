import { useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage: string;
  color: string;
  size: string;
  sizeLabel: string;
  price: string;
  quantity: number;
}

const CART_KEY = 'santos-anjos-cart-v2';

export function useCartSimple() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[useCartSimple] Loaded from localStorage:', parsed);
        setCart(parsed);
      }
    } catch (e) {
      console.error('[useCartSimple] Error loading from localStorage:', e);
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever cart changes (only after mount)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      console.log('[useCartSimple] Saved to localStorage:', cart);
    } catch (e) {
      console.error('[useCartSimple] Error saving to localStorage:', e);
    }
  }, [cart, mounted]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    console.log('[useCartSimple] addItem called with:', item);
    
    const itemId = `${item.productId}-${item.color}-${item.size}`;
    
    setCart(prevCart => {
      console.log('[useCartSimple] Current cart before add:', prevCart);
      
      const existingIndex = prevCart.findIndex(i => i.id === itemId);
      let newCart;
      
      if (existingIndex >= 0) {
        // Update quantity if item exists
        newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + item.quantity,
        };
        console.log('[useCartSimple] Updated existing item');
      } else {
        // Add new item
        newCart = [...prevCart, { ...item, id: itemId }];
        console.log('[useCartSimple] Added new item');
      }
      
      console.log('[useCartSimple] New cart:', newCart);
      return newCart;
    });
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(i => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('R$', '').replace(',', '.'));
    return sum + price * item.quantity;
  }, 0);

  const totalPriceFormatted = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

  return {
    cart,
    totalItems,
    totalPrice,
    totalPriceFormatted,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
