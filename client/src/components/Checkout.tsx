import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Copy } from 'lucide-react';
import QRCode from 'qrcode';

interface CheckoutProps {
  productId: number;
  productName: string;
  productPrice: string;
  onClose: () => void;
}

export default function Checkout({ productId, productName, productPrice, onClose }: CheckoutProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCep, setCustomerCep] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [pixKey] = useState('47996641959');
  const [qrCodeData, setQrCodeData] = useState('');
  const [copied, setCopied] = useState(false);
  const [shippingCost, setShippingCost] = useState('0');
  const [shippingRegion, setShippingRegion] = useState('');
  const [shippingPrazo, setShippingPrazo] = useState('');
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createOrderMutation = trpc.orders.create.useMutation();
  const calculateShippingQuery = trpc.shipping.calculateCost.useQuery(
    { cep: '', weight: 100 },
    { enabled: false }
  );

  const subtotal = (parseFloat(productPrice) * quantity).toFixed(2);
  const totalPrice = (parseFloat(subtotal) + parseFloat(shippingCost)).toFixed(2);

  // Calcular frete quando CEP mudar
  const handleCepChange = async (cep: string) => {
    setCustomerCep(cep);
    
    if (cep.replace(/\D/g, '').length === 8) {
      setCalculatingShipping(true);
      try {
        const result = await calculateShippingQuery.refetch();
        if (result.data) {
        
          setShippingCost(result.data.cost);
          setShippingRegion(result.data.region);
          setShippingPrazo(result.data.prazo);
        } else {
          setShippingCost('0');
          setShippingRegion('');
          setShippingPrazo('');
        }
      } catch (error) {
        console.error('Erro ao calcular frete:', error);
        setShippingCost('0');
      } finally {
        setCalculatingShipping(false);
      }
    }
  };

  // Gerar QR Code quando o passo mudar para payment
  useEffect(() => {
    if (step === 'payment' && qrCodeData && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrCodeData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((err: unknown) => console.error('Erro ao gerar QR Code:', err));
    }
  }, [step, qrCodeData]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const order = await createOrderMutation.mutateAsync({
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        customerCep: customerCep || undefined,
        productId,
        quantity,
        subtotal: subtotal,
        shippingCost: shippingCost,
        totalPrice,
        pixKey,
      });

      if (order) {
        setOrderNumber(order.orderNumber);
        // Gerar dados para QR Code PIX (formato simplificado)
        // Em produção, você usaria a API do Nubank para gerar o QR Code dinâmico
        const pixData = `00020126580014br.gov.bcb.pix0136${pixKey}520400005303986540510.${totalPrice}5802BR5913SANTOS ANJOS6009SAO PAULO62410503***63041D3D`;
        setQrCodeData(pixData);
        setStep('payment');
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Finalizar Compra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Resumo do Produto */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Produto</p>
                <p className="font-semibold">{productName}</p>
                <p className="text-sm text-gray-600 mt-2">Quantidade: {quantity}</p>
                <p className="text-sm text-gray-600">Preço unitário: R$ {productPrice}</p>
                <p className="font-semibold text-lg mt-2">Subtotal: R$ {subtotal}</p>
              </div>

              {/* Dados do Cliente */}
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="João Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="joao@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp *</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(47) 99664-1959"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CEP para Frete</label>
                <Input
                  value={customerCep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="01310-100"
                  maxLength={9}
                />
                {calculatingShipping && <p className="text-xs text-blue-600 mt-1">Calculando frete...</p>}
                {shippingRegion && (
                  <div className="text-xs text-gray-600 mt-2">
                    <p>Região: {shippingRegion}</p>
                    <p>Prazo: {shippingPrazo}</p>
                    <p className="font-semibold">Frete: R$ {parseFloat(shippingCost).toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Resumo com Frete */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Frete:</span>
                  <span>R$ {parseFloat(shippingCost).toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>R$ {totalPrice}</span>
                </div>
              </div>

              <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">
                Prosseguir para Pagamento
              </Button>
            </form>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle>Pagamento via PIX</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-semibold">Pedido: {orderNumber}</p>
                <p className="text-2xl font-bold text-green-700 mt-2">R$ {totalPrice}</p>
              </div>

              <div className="flex justify-center">
                <canvas ref={canvasRef} />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Ou copie a chave PIX:</p>
                <div className="flex gap-2">
                  <Input value={pixKey} readOnly className="bg-gray-100" />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Copy size={16} />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                <p>1. Abra seu app bancário</p>
                <p>2. Escaneie o QR Code ou copie a chave PIX</p>
                <p>3. Confirme o pagamento de R$ {totalPrice}</p>
              </div>

              <Button
                onClick={() => setStep('success')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Já Paguei
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Pedido Confirmado!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              <CheckCircle2 size={48} className="mx-auto text-green-600" />
              <div>
                <p className="text-lg font-semibold">Obrigado pela compra!</p>
                <p className="text-sm text-gray-600 mt-2">Número do pedido: {orderNumber}</p>
                <p className="text-sm text-gray-600">Valor: R$ {totalPrice}</p>
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm">
                <p className="text-gray-700">
                  Você receberá uma confirmação por email. Em caso de dúvidas, entre em contato pelo WhatsApp.
                </p>
              </div>

              <a
                href={`https://wa.me/5547996641959?text=Olá! Tenho uma dúvida sobre o pedido ${orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Falar no WhatsApp
                </Button>
              </a>

              <Button onClick={onClose} variant="outline" className="w-full">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
