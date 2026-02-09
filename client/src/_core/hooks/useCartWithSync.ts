import { useEffect, useState, useCallback } from 'react';

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

const CART_KEY = 'santos-anjos-cart-v3';
const CART_EVENT = 'cart-updated';

// Helper to dispatch custom event
function dispatchCartUpdate(cart: CartItem[]) {
  window.dispatchEvent(
    new CustomEvent(CART_EVENT, { detail: { cart } })
  );
}

// Helper to get cart from localStorage
function getCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('[useCartWithSync] Error reading from localStorage:', e);
    return [];
  }
}

// Helper to save cart to localStorage
function saveCartToStorage(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('[useCartWithSync] Error writing to localStorage:', e);
  }
}

export function useCartWithSync() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Initialize cart from localStorage and listen for updates
  useEffect(() => {
    // Load initial cart
    const initialCart = getCartFromStorage();
    setCart(initialCart);
    console.log('[useCartWithSync] Initialized with:', initialCart);

    // Listen for cart updates from other components
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newCart = customEvent.detail.cart;
      console.log('[useCartWithSync] Received cart update:', newCart);
      setCart(newCart);
    };

    window.addEventListener(CART_EVENT, handleCartUpdate);
    return () => window.removeEventListener(CART_EVENT, handleCartUpdate);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    console.log('[useCartWithSync] addItem called with:', item);
    
    const itemId = `${item.productId}-${item.color}-${item.size}`;
    
    setCart(prevCart => {
      console.log('[useCartWithSync] Current cart before add:', prevCart);
      
      const existingIndex = prevCart.findIndex(i => i.id === itemId);
      let newCart;
      
      if (existingIndex >= 0) {
        // Update quantity if item exists
        newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + item.quantity,
        };
        console.log('[useCartWithSync] Updated existing item');
      } else {
        // Add new item
        newCart = [...prevCart, { ...item, id: itemId }];
        console.log('[useCartWithSync] Added new item');
      }
      
      console.log('[useCartWithSync] New cart:', newCart);
      
      // Save to localStorage and dispatch event
      saveCartToStorage(newCart);
      dispatchCartUpdate(newCart);
      
      return newCart;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(i => i.id !== itemId);
      saveCartToStorage(newCart);
      dispatchCartUpdate(newCart);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCart(prevCart => {
        const newCart = prevCart.map(i => 
          i.id === itemId ? { ...i, quantity } : i
        );
        saveCartToStorage(newCart);
        dispatchCartUpdate(newCart);
        return newCart;
      });
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    const emptyCart: CartItem[] = [];
    saveCartToStorage(emptyCart);
    dispatchCartUpdate(emptyCart);
    setCart(emptyCart);
  }, []);

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
