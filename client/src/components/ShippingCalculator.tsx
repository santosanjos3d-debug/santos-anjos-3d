import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Truck, AlertCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ShippingCalculatorProps {
  onShippingCalculated: (shippingCost: number, cep: string) => void;
  sizeType?: 'P' | 'M' | 'G';
}

export default function ShippingCalculator({ onShippingCalculated, sizeType = 'P' }: ShippingCalculatorProps) {
  const [cep, setCep] = useState('');
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);

  const calculateShippingMutation = trpc.shipping.calculateMelhorEnvio.useQuery(
    {
      destinationCEP: cep.replace(/\D/g, ''),
      sizeType: sizeType,
    },
    {
      enabled: false,
    }
  );

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCEP(e.target.value));
    setError('');
    setSelectedService(null);
  };

  const calculateShipping = async () => {
    const cleanedCEP = cep.replace(/\D/g, '');

    if (cleanedCEP.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return;
    }

    setError('');
    
    try {
      const result = await calculateShippingMutation.refetch();
      
      if (!result.data?.success || !result.data?.services || result.data.services.length === 0) {
        setError(result.data?.error || 'Nenhuma opção de frete disponível para este CEP');
        return;
      }

      // Auto-select first service
      if (result.data.services.length > 0) {
        const firstService = result.data.services[0];
        setSelectedService(firstService.id);
        onShippingCalculated(firstService.price, cleanedCEP);
      }
    } catch (err: any) {
      setError('Erro ao calcular frete. Tente novamente.');
      console.error('[ShippingCalculator] Error:', err);
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service.id);
    onShippingCalculated(service.price, cep.replace(/\D/g, ''));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateShipping();
    }
  };

  const services = calculateShippingMutation.data?.services || [];
  const isLoading = calculateShippingMutation.isLoading;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Truck size={20} className="text-amber-600" />
        <h3 className="font-semibold text-gray-800">Calcular Frete</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          CEP de Entrega
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cep}
            onChange={handleCEPChange}
            onKeyPress={handleKeyPress}
            placeholder="00000-000"
            maxLength={9}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          />
          <Button
            onClick={calculateShipping}
            disabled={isLoading || cep.replace(/\D/g, '').length !== 8}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              'Calcular'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {services.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Opções de Frete:</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {services.map((service: any) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`w-full p-3 border rounded-lg text-left transition ${
                  selectedService === service.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{service.name}</p>
                    <p className="text-xs text-gray-600">{service.company}</p>
                    <p className="text-xs text-gray-500">
                      Entrega em {service.deliveryTime} dia(s)
                    </p>
                  </div>
                  <p className="font-bold text-amber-600">
                    R$ {service.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedService && services.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-sm text-gray-600">Frete selecionado:</p>
          <p className="text-lg font-bold text-green-600">
            R${' '}
            {services
              .find((s: any) => s.id === selectedService)
              ?.price.toFixed(2)
              .replace('.', ',')}
          </p>
        </div>
      )}
    </div>
  );
}
