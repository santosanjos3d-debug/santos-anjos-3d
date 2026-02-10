import { useCartWithSync } from '@/_core/hooks/useCartWithSync';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

export default function Cart() {
  const { cart, totalItems, totalPriceFormatted, removeItem, updateQuantity, clearCart } = useCartWithSync();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Build message with all cart items
    const cartSummary = cart
      .map((item: any) =>
        `${item.productName} (${item.color}, ${item.sizeLabel}) - ${item.price} x ${item.quantity}`
      )
      .join('\n');

    const message = `Olá! Gostaria de fazer um pedido:\n\n${cartSummary}\n\n*Subtotal: ${totalPriceFormatted}*\n\nPor favor, confirme o frete para meu CEP e o valor total.`;
    const whatsappUrl = `https://wa.me/5547996641959?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Cart Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="bg-amber-500 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Carrinho ({totalItems})</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-amber-600 p-1 rounded transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingCart size={48} className="mb-4 opacity-50" />
                  <p>Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item: any) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{item.productName}</h3>
                          <p className="text-xs text-gray-600">
                            {item.color} • {item.sizeLabel}
                          </p>
                          <p className="text-sm font-bold text-amber-600 mt-1">
                            {item.price}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-3 justify-between">
                        <div className="flex items-center gap-2 border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="p-1 hover:bg-gray-100 transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-semibold text-sm">
                          {`R$ ${(parseFloat(item.price.replace('R$', '').replace(',', '.')) * item.quantity).toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg font-bold border-b pb-2">
                    <span>Subtotal:</span>
                    <span className="text-amber-600">{totalPriceFormatted}</span>
                  </div>
                  <p className="text-xs text-gray-600 italic">
                    O frete será calculado após você informar seu CEP no WhatsApp.
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
                >
                  Encomendar via WhatsApp
                </Button>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full"
                >
                  Limpar Carrinho
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
