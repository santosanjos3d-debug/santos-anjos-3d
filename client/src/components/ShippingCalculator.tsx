import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2, Package } from 'lucide-react';

interface ShippingCalculatorProps {
  cep: string;
  cartItems: Array<{
    size: string;
    quantity: number;
  }>;
  onShippingCalculated: (cost: number, serviceName: string) => void;
}

export default function ShippingCalculator({ cep, cartItems, onShippingCalculated }: ShippingCalculatorProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Determinar o maior tamanho no carrinho para calcular o frete
  const getLargestSize = (): 'P' | 'M' | 'G' => {
    const sizes = cartItems.map(item => item.size);
    if (sizes.includes('G')) return 'G';
    if (sizes.includes('M')) return 'M';
    return 'P';
  };

  const largestSize = getLargestSize();

  const { data, isLoading, error } = trpc.shipping.calculateMelhorEnvio.useQuery(
    {
      destinationCEP: cep.replace(/\D/g, ''),
      sizeType: largestSize,
    },
    {
      enabled: cep.replace(/\D/g, '').length === 8,
      retry: 1,
    }
  );

  const handleSelectService = (serviceId: string, price: number, name: string) => {
    setSelectedService(serviceId);
    onShippingCalculated(price, name);
  };

  if (cep.replace(/\D/g, '').length !== 8) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" size={20} />
          <span>Calculando frete...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">
          Erro ao calcular frete. Tente novamente ou entre em contato via WhatsApp.
        </p>
      </div>
    );
  }

  if (!data?.success || data.services.length === 0) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800 text-sm">
          {data?.error || 'Nenhum serviço de frete disponível para este CEP. Entre em contato via WhatsApp.'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Package size={16} />
        Opções de Frete
      </h3>
      <div className="space-y-2">
        {data.services.map((service) => (
          <button
            key={service.id}
            onClick={() => handleSelectService(String(service.id), service.price, service.name)}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
              selectedService === String(service.id)
                ? 'border-[#8B4513] bg-[#8B4513]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{service.company}</p>
                <p className="text-sm text-gray-600">{service.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Entrega em até {service.deliveryTime} dias úteis
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#8B4513]">
                  R$ {service.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {!selectedService && (
        <p className="text-xs text-gray-500 mt-2">
          Selecione uma opção de frete para continuar
        </p>
      )}
    </div>
  );
}
