import { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';

interface ShippingCalculatorProps {
  cep: string;
  cartItems: Array<{
    size: string;
    quantity: number;
  }>;
  onShippingCalculated: (cost: number, serviceName: string) => void;
}

interface ShippingService {
  id: string;
  name: string;
  company: string;
  price: string;
  delivery_time: number;
  currency: string;
}

const SIZE_DIMENSIONS = {
  P: { height: 10, width: 10, length: 15, weight: 0.3 },
  M: { height: 15, width: 15, length: 30, weight: 0.8 },
  G: { height: 20, width: 20, length: 40, weight: 1.5 }
};

export default function ShippingCalculatorSimple({ cep, cartItems, onShippingCalculated }: ShippingCalculatorProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [services, setServices] = useState<ShippingService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLargestSize = (): 'P' | 'M' | 'G' => {
    const sizes = cartItems.map(item => item.size);
    if (sizes.includes('G')) return 'G';
    if (sizes.includes('M')) return 'M';
    return 'P';
  };

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setServices([]);
      return;
    }

    const fetchShipping = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const largestSize = getLargestSize();
        const dimensions = SIZE_DIMENSIONS[largestSize];

        const response = await fetch('/api/calculate-shipping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to_postal_code: cleanCep,
            packages: [{
              height: dimensions.height,
              width: dimensions.width,
              length: dimensions.length,
              weight: dimensions.weight
            }]
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao calcular frete');
        }

        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error('Erro ao calcular frete:', err);
        setError('Erro ao calcular frete. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipping();
  }, [cep, cartItems]);

  const handleSelectService = (serviceId: string, price: string, name: string) => {
    setSelectedService(serviceId);
    onShippingCalculated(parseFloat(price), name);
  };

  if (cep.replace(/\D/g, '').length !== 8) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Calculando frete...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 text-gray-700 font-medium">
        <Package className="w-5 h-5" />
        <span>Opções de entrega:</span>
      </div>

      {services.map((service) => (
        <div
          key={service.id}
          onClick={() => handleSelectService(service.id, service.price, service.name)}
          className={`
            p-4 rounded-lg border-2 cursor-pointer transition-all
            ${selectedService === service.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">{service.name}</div>
              <div className="text-sm text-gray-600">{service.company}</div>
              {service.delivery_time > 0 && (
                <div className="text-sm text-gray-500 mt-1">
                  Entrega em até {service.delivery_time} dias úteis
                </div>
              )}
              {service.delivery_time === 0 && (
                <div className="text-sm text-green-600 mt-1">
                  Disponível para retirada imediata
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {service.currency} {parseFloat(service.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
