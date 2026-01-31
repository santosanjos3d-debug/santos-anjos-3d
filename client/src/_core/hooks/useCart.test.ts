import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from './useCart';

describe('useCart Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 1,
      });
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.cart[0].productName).toBe('Nossa Senhora de Lourdes');
  });

  it('should increase quantity when adding same item', () => {
    const { result } = renderHook(() => useCart());

    const item = {
      productId: 1,
      productName: 'Nossa Senhora de Lourdes',
      productImage: '/image.png',
      color: 'Branco' as const,
      size: 'P' as const,
      sizeLabel: 'Pequeno (144mm)',
      price: 'R$ 40,58',
      quantity: 1,
    };

    act(() => {
      result.current.addItem(item);
      result.current.addItem(item);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 1,
      });
    });

    expect(result.current.cart).toHaveLength(1);

    act(() => {
      result.current.removeItem('1-Branco-P');
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 1,
      });
    });

    act(() => {
      result.current.updateQuantity('1-Branco-P', 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
  });

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 1,
      });
    });

    act(() => {
      result.current.updateQuantity('1-Branco-P', 0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 1,
      });
      result.current.addItem({
        productId: 2,
        productName: 'Santa Hildegarda',
        productImage: '/image2.png',
        color: 'Verde',
        size: 'M',
        sizeLabel: 'Médio (216mm)',
        price: 'R$ 60,87',
        quantity: 1,
      });
    });

    expect(result.current.cart).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('should calculate total price correctly', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 2,
      });
      result.current.addItem({
        productId: 2,
        productName: 'Santa Hildegarda',
        productImage: '/image2.png',
        color: 'Verde',
        size: 'M',
        sizeLabel: 'Médio (216mm)',
        price: 'R$ 60,87',
        quantity: 1,
      });
    });

    const expectedTotal = 40.58 * 2 + 60.87;
    expect(result.current.totalPrice).toBeCloseTo(expectedTotal, 2);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        productId: 1,
        productName: 'Nossa Senhora de Lourdes',
        productImage: '/image.png',
        color: 'Branco',
        size: 'P',
        sizeLabel: 'Pequeno (144mm)',
        price: 'R$ 40,58',
        quantity: 1,
      });
    });

    const savedCart = localStorage.getItem('santos-anjos-cart');
    expect(savedCart).toBeTruthy();
    const parsed = JSON.parse(savedCart!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].productName).toBe('Nossa Senhora de Lourdes');
  });
});
