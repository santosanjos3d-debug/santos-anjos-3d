import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Package, MapPin, User, Phone } from 'lucide-react';

interface CartItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  sizeLabel: string;
  price: string;
  quantity: number;
}

interface ShippingOption {
  id: number | string;
  name: string;
  company: string;
  price: string;
  delivery_time: number;
}

interface CheckoutModalProps {
  cart: CartItem[];
  subtotal: number;
  shippingCost: number;
  shippingService: ShippingOption | null;
  cep: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface AddressData {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export default function CheckoutModal({
  cart,
  subtotal,
  shippingCost,
  shippingService,
  cep,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<'address' | 'confirm' | 'success'>('address');
  const [orderNumber, setOrderNumber] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  // Dados do cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDocument, setCustomerDocument] = useState('');

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const totalPrice = subtotal + shippingCost;

  const createOrderMutation = trpc.orders.createFull.useMutation();

  // Buscar endereço pelo CEP ao abrir (já temos o CEP do carrinho)
  const fetchAddress = async (postalCode: string) => {
    const clean = postalCode.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data: AddressData & { erro?: boolean } = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setDistrict(data.bairro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch {
      // silently fail
    } finally {
      setLoadingCep(false);
    }
  };

  // Buscar endereço quando o modal abre
  useEffect(() => {
    if (cep) fetchAddress(cep);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemsSummary = cart.map(item => ({
        name: item.productName,
        color: item.color,
        size: item.sizeLabel,
        qty: item.quantity,
        price: item.price,
      }));

      const result = await createOrderMutation.mutateAsync({
        customerName,
        customerPhone,
        customerDocument: customerDocument || undefined,
        addressPostalCode: cep.replace(/\D/g, ''),
        addressStreet: street,
        addressNumber: number,
        addressComplement: complement || undefined,
        addressDistrict: district,
        addressCity: city,
        addressState: state,
        shippingServiceId: typeof shippingService?.id === 'number' ? shippingService.id : undefined,
        shippingServiceName: shippingService?.name || 'Retirada no Local',
        shippingCompany: shippingService?.company || '',
        subtotal: subtotal.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
        itemsSummary: JSON.stringify(itemsSummary),
      });

      setOrderNumber(result.orderNumber);
      setStep('confirm');
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      alert('Erro ao registrar pedido. Tente novamente.');
    }
  };

  const handleWhatsApp = () => {
    const itemsText = cart
      .map(i => `• ${i.productName} (${i.color}, ${i.sizeLabel}) x${i.quantity} — ${i.price}`)
      .join('\n');

    const shippingText = shippingService?.id === 'retirada-local'
      ? 'Retirada no Local (R$ 0,00)'
      : `${shippingService?.company} ${shippingService?.name} — R$ ${shippingCost.toFixed(2).replace('.', ',')}`;

    const msg =
      `🛍️ *Novo Pedido Santos Anjos 3D*\n` +
      `Pedido: *${orderNumber}*\n\n` +
      `*Itens:*\n${itemsText}\n\n` +
      `*Entrega:* ${shippingText}\n` +
      `*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n` +
      `*Total:* R$ ${totalPrice.toFixed(2).replace('.', ',')}\n\n` +
      `*Endereço de entrega:*\n` +
      `${street}, ${number}${complement ? ` - ${complement}` : ''}\n` +
      `${district} — ${city}/${state}\n` +
      `CEP: ${cep}\n\n` +
      `Aguardo informações para pagamento via PIX. Obrigado! 🙏`;

    window.open(`https://wa.me/5547996641959?text=${encodeURIComponent(msg)}`, '_blank');
    setStep('success');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* STEP: Endereço */}
        {step === 'address' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin size={20} className="text-amber-600" />
                Dados de Entrega
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Resumo do pedido */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="font-semibold text-amber-800 mb-2 flex items-center gap-1">
                  <Package size={16} /> Resumo do Pedido
                </p>
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-700">
                    <span>{item.productName} ({item.sizeLabel}) x{item.quantity}</span>
                    <span>{item.price}</span>
                  </div>
                ))}
                <div className="border-t border-amber-200 mt-2 pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Frete ({shippingService?.name}):</span>
                    <span>{shippingCost === 0 ? 'Grátis' : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>Total:</span>
                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>

              {/* Dados pessoais */}
              <div className="space-y-3">
                <p className="font-semibold text-sm flex items-center gap-1 text-gray-700">
                  <User size={16} /> Dados Pessoais
                </p>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Nome Completo *</label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="João da Silva" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    <Phone size={12} className="inline mr-1" />WhatsApp *
                  </label>
                  <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(47) 99999-9999" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">CPF (opcional, para nota fiscal)</label>
                  <Input value={customerDocument} onChange={e => setCustomerDocument(e.target.value)} placeholder="000.000.000-00" />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-3">
                <p className="font-semibold text-sm flex items-center gap-1 text-gray-700">
                  <MapPin size={16} /> Endereço de Entrega
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-gray-600">CEP</label>
                    <Input value={cep} readOnly className="bg-gray-50" />
                  </div>
                  {loadingCep && <Loader2 size={20} className="animate-spin text-amber-600 mt-5" />}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Rua / Logradouro *</label>
                  <Input value={street} onChange={e => setStreet(e.target.value)} placeholder="Rua das Flores" required />
                </div>
                <div className="flex gap-3">
                  <div className="w-28">
                    <label className="block text-xs font-medium mb-1 text-gray-600">Número *</label>
                    <Input value={number} onChange={e => setNumber(e.target.value)} placeholder="123" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-gray-600">Complemento</label>
                    <Input value={complement} onChange={e => setComplement(e.target.value)} placeholder="Apto 4" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">Bairro *</label>
                  <Input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Centro" required />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-gray-600">Cidade *</label>
                    <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Joinville" required />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs font-medium mb-1 text-gray-600">UF *</label>
                    <Input value={state} onChange={e => setState(e.target.value.toUpperCase())} placeholder="SC" maxLength={2} required />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin mr-2" /> Registrando Pedido...</>
                ) : (
                  'Confirmar Pedido'
                )}
              </Button>
            </form>
          </>
        )}

        {/* STEP: Confirmação / WhatsApp */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600" />
                Pedido Registrado!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">Número do Pedido</p>
                <p className="text-2xl font-bold text-green-800">{orderNumber}</p>
                <p className="text-lg font-semibold text-green-700 mt-1">
                  Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-2">
                <p className="font-semibold">📋 Próximos passos:</p>
                <p>1. Clique em <strong>"Enviar pelo WhatsApp"</strong> para confirmar seu pedido</p>
                <p>2. Você receberá a chave PIX para pagamento</p>
                <p>3. Após confirmação do pagamento, a etiqueta de envio será gerada automaticamente</p>
                <p>4. Você receberá o código de rastreio pelo WhatsApp</p>
              </div>

              <Button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-3"
              >
                📱 Enviar pelo WhatsApp
              </Button>
              <Button onClick={onClose} variant="outline" className="w-full">
                Fechar
              </Button>
            </div>
          </>
        )}

        {/* STEP: Sucesso */}
        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Pedido Enviado!</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4 mt-2">
              <CheckCircle2 size={56} className="mx-auto text-green-600" />
              <p className="text-lg font-semibold">Obrigado pela sua compra!</p>
              <p className="text-sm text-gray-600">
                Pedido <strong>{orderNumber}</strong> registrado com sucesso.<br />
                Em breve entraremos em contato pelo WhatsApp.
              </p>
              <Button onClick={() => { onSuccess(); onClose(); }} className="w-full bg-amber-600 hover:bg-amber-700">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
