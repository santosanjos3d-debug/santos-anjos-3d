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
  const [orderNumber, setOrderNumber] = useState('');
  const [pixKey] = useState('47996641959');
  const [qrCodeData, setQrCodeData] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createOrderMutation = trpc.orders.create.useMutation();

  const totalPrice = (parseFloat(productPrice) * quantity).toFixed(2);

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
        productId,
        quantity,
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

  const copyPixKey = () => {
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
              <DialogTitle>Checkout - {productName}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="bg-accent/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Produto</p>
                <p className="font-semibold">{productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Preço Unitário</label>
                  <Input
                    type="text"
                    value={`R$ ${productPrice}`}
                    disabled
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="bg-foreground/5 p-3 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-accent">R$ {totalPrice}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Telefone/WhatsApp</label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(47) 99664-1959"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90"
                disabled={createOrderMutation.isPending || !customerName}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Prosseguir para Pagamento'
                )}
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-900">Pedido Criado!</p>
                <p className="text-sm text-green-800">Número: {orderNumber}</p>
              </div>

              <div className="bg-foreground/5 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-3">Escaneie o QR Code abaixo com seu celular</p>
                <div className="flex justify-center bg-white p-3 rounded-lg border border-border">
                  <canvas ref={canvasRef} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Ou copie a chave PIX:</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={pixKey}
                    disabled
                    className="text-sm"
                  />
                  <Button
                    onClick={copyPixKey}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {copied ? 'Copiado!' : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Valor:</strong> R$ {totalPrice}
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  Após confirmar o pagamento, você receberá uma confirmação por email.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('success')}
                  className="flex-1 bg-accent hover:bg-accent/90"
                >
                  Já Paguei
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Pagamento Confirmado!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <p className="font-semibold text-lg">Obrigado pela compra!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu pedido foi recebido com sucesso.
                </p>
              </div>

              <div className="bg-foreground/5 p-4 rounded-lg space-y-2">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Número do Pedido</p>
                  <p className="font-mono font-semibold">{orderNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="font-semibold">R$ {totalPrice}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Você receberá um email de confirmação em breve. Em caso de dúvidas, entre em contato conosco pelo WhatsApp.
              </p>

              <a
                href="https://wa.me/5547996641959?text=Olá! Tenho dúvidas sobre meu pedido."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-green-600 hover:bg-green-700">
                  Falar no WhatsApp
                </Button>
              </a>

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
