import { useCartWithSync } from '@/_core/hooks/useCartWithSync';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import ShippingCalculatorSimple from './ShippingCalculatorSimple';
import CheckoutModal from './CheckoutModal';

interface ShippingOption {
  id: number | string;
  name: string;
  company: string;
  price: string;
  delivery_time: number;
}

export default function Cart() {
  const { cart, totalItems, totalPriceFormatted, removeItem, updateQuantity, clearCart } = useCartWithSync();
  const [isOpen, setIsOpen] = useState(false);
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingService, setShippingService] = useState<ShippingOption | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Listen for external open-cart event
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, []);

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const handleShippingCalculated = (cost: number, serviceName: string, service?: ShippingOption) => {
    setShippingCost(cost);
    setShippingService(service || null);
  };

  const subtotalValue = parseFloat(totalPriceFormatted.replace('R$ ', '').replace(',', '.')) || 0;
  const totalWithShipping = subtotalValue + shippingCost;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      alert('Por favor, informe um CEP válido');
      return;
    }
    if (shippingCost === 0 && shippingService?.id !== 'retirada-local') {
      alert('Por favor, selecione uma opção de frete');
      return;
    }
    setShowCheckout(true);
  };

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center gap-2"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="flex-1 bg-black/50" onClick={() => setIsOpen(false)} />

          {/* Cart Panel */}
          <div className="w-full max-w-md bg-white shadow-lg flex flex-col max-h-screen overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Carrinho</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Seu carrinho está vazio</p>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item: any, index: number) => (
                      <div key={index} className="flex gap-4 border rounded-lg p-4">
                        <div className="flex-1">
                          <p className="font-semibold">{item.productName}</p>
                          <p className="text-sm text-gray-600">{item.color} • {item.sizeLabel}</p>
                          <p className="text-sm font-medium mt-2">R$ {String(item.price).replace('R$', '').trim().replace(',', '.').replace(/\.(\d{2})$/, ',$1')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded">
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded">
                            <Plus size={16} />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-100 rounded ml-2">
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CEP Input */}
                  <div className="mb-6 border-t pt-6">
                    <label className="block text-sm font-medium mb-2">CEP de Entrega</label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(formatCEP(e.target.value))}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Shipping Calculator */}
                  {cep.replace(/\D/g, '').length === 8 && (
                    <ShippingCalculatorSimple
                      cep={cep}
                      cartItems={cart.map((item: any) => ({ size: item.size, quantity: item.quantity }))}
                      onShippingCalculated={handleShippingCalculated}
                    />
                  )}

                  {/* Totals */}
                  <div className="border-t pt-4 space-y-2 mt-6">
                    <div className="flex justify-between text-base">
                      <span>Subtotal:</span>
                      <span>{totalPriceFormatted}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between text-base">
                        <span>Frete ({shippingService?.name}):</span>
                        <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    {shippingService?.id === 'retirada-local' && (
                      <div className="flex justify-between text-base text-green-700">
                        <span>Retirada no Local:</span>
                        <span>Grátis</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {totalWithShipping.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t p-6 space-y-3">
                <Button
                  onClick={handleCheckout}
                  disabled={!cep || cep.replace(/\D/g, '').length !== 8 || (shippingCost === 0 && shippingService?.id !== 'retirada-local')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Finalizar Pedido
                </Button>
                <Button onClick={clearCart} variant="outline" className="w-full">
                  Limpar Carrinho
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotalValue}
          shippingCost={shippingCost}
          shippingService={shippingService}
          cep={cep}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            clearCart();
            setIsOpen(false);
            setCep('');
            setShippingCost(0);
            setShippingService(null);
          }}
        />
      )}
    </>
  );
}
