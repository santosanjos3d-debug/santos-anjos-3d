import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CreditCard, QrCode, Copy, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

interface PaymentStepProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

type PaymentMethod = 'pix' | 'card';

interface PixData {
  qrCode: string;
  copyPaste: string;
  expiration: string;
}

export default function PaymentStep({
  orderId,
  orderNumber,
  totalAmount,
  onSuccess,
  onError,
}: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);

  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardholderName: '',
    cardExpirationMonth: '',
    cardExpirationYear: '',
    securityCode: '',
    installments: 1,
  });

  // CPF for card payment
  const [cpf, setCpf] = useState('');

  // Polling for PIX payment confirmation
  useEffect(() => {
    if (!pixData || paymentMethod !== 'pix') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status/${orderId}`);
        const data = await res.json();
        if (data.paymentStatus === 'approved' || data.orderStatus === 'paid') {
          setPaymentStatus('approved');
          onSuccess();
        } else if (data.paymentStatus === 'rejected') {
          setPaymentStatus('rejected');
          onError('Pagamento rejeitado. Tente novamente.');
        }
      } catch {
        // Silently fail
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pixData, orderId, paymentMethod, onSuccess, onError]);

  const handleCreatePixPayment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'pix',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pagamento PIX');

      setPixData({
        qrCode: data.pixQrCode,
        copyPaste: data.pixCopyPaste,
        expiration: data.pixExpiration,
      });
    } catch (err: any) {
      onError(err.message || 'Erro ao criar pagamento PIX');
    } finally {
      setLoading(false);
    }
  }, [orderId, onError]);

  const handleCreateCardPayment = useCallback(async () => {
    setLoading(true);
    setCardError(null);

    try {
      // Validate card data
      if (!cardData.cardNumber || !cardData.cardholderName || !cardData.securityCode) {
        throw new Error('Preencha todos os dados do cartão');
      }

      if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
        throw new Error('CPF inválido');
      }

      // Tokenize card using MercadoPago SDK
      if (!window.MercadoPago) {
        throw new Error('SDK do Mercado Pago não carregado. Recarregue a página.');
      }

      const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Chave pública do Mercado Pago não configurada.');
      }

      const mp = new window.MercadoPago(publicKey);
      const cardNumber = cardData.cardNumber.replace(/\s/g, '');
      const expMonth = parseInt(cardData.cardExpirationMonth);
      const expYear = parseInt(`20${cardData.cardExpirationYear}`);

      console.log('[CardToken] Creating token with:', {
        cardNumber: cardNumber.substring(0, 6) + '...',
        cardholderName: cardData.cardholderName,
        securityCode: cardData.securityCode,
        identificationNumber: cpf.replace(/\D/g, ''),
        expirationMonth: expMonth,
        expirationYear: expYear,
      });

      const cardToken = await mp.createCardToken({
        cardNumber: cardNumber,
        cardholderName: cardData.cardholderName,
        securityCode: cardData.securityCode,
        identificationType: 'CPF',
        identificationNumber: cpf.replace(/\D/g, ''),
        expirationMonth: expMonth,
        expirationYear: expYear,
      });

      console.log('[CardToken] Token created:', JSON.stringify(cardToken));

      if (!cardToken || !cardToken.id) {
        throw new Error('Erro ao processar cartão. Verifique os dados e tente novamente.');
      }

      // Lookup card brand from BIN via backend
      const binRes = await fetch('/api/payments/binlookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bin: cardNumber.substring(0, 6) }),
      });
      const binData = await binRes.json();
      console.log('[CardToken] BIN lookup result:', binData);

      if (!binData.paymentMethodId) {
        throw new Error('Bandeira do cartão não identificada. Verifique o número.');
      }

      // Create payment with card token
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'card',
          cardToken: cardToken.id,
          paymentMethodId: binData.paymentMethodId,
          installments: cardData.installments,
          identification: {
            type: 'CPF',
            number: cpf.replace(/\D/g, ''),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar pagamento');

      if (data.status === 'approved') {
        setPaymentStatus('approved');
        onSuccess();
      } else if (data.status === 'rejected') {
        setPaymentStatus('rejected');
        throw new Error('Pagamento rejeitado pelo cartão. Verifique os dados ou tente outro cartão.');
      } else {
        setPaymentStatus('pending');
        onError('Pagamento pendente de confirmação.');
      }
    } catch (err: any) {
      setCardError(err.message || 'Erro ao processar pagamento');
      onError(err.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  }, [orderId, cardData, cpf, onSuccess, onError]);

  const handleCopyPix = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '');
    const matches = v.match(/.{1,4}/g);
    return matches ? matches.join(' ') : '';
  };

  const formatCPF = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9, 11)}`;
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <CreditCard size={18} />
          Forma de Pagamento
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('pix')}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'pix'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <QrCode size={24} />
            <div className="text-left">
              <p className="font-semibold">PIX</p>
              <p className="text-xs opacity-75">Aprovação instantânea</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <CreditCard size={24} />
            <div className="text-left">
              <p className="font-semibold">Cartão</p>
              <p className="text-xs opacity-75">Até 12x sem juros</p>
            </div>
          </button>
        </div>
      </div>

      {/* PIX Payment */}
      {paymentMethod === 'pix' && (
        <div className="space-y-4">
          {!pixData ? (
            <Button
              onClick={handleCreatePixPayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Gerando QR Code...</>
              ) : (
                <>Gerar QR Code PIX — R$ {totalAmount.toFixed(2).replace('.', ',')}</>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              {/* QR Code Image */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                  <img
                    src={pixData.qrCode?.startsWith('data:') ? pixData.qrCode : `data:image/png;base64,${pixData.qrCode}`}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Copy and Paste */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">Ou copie o código PIX:</p>
                <div className="flex gap-2">
                  <Input
                    value={pixData.copyPaste}
                    readOnly
                    className="font-mono text-xs bg-gray-50"
                  />
                  <Button
                    onClick={handleCopyPix}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              {/* Status */}
              {paymentStatus === 'approved' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 size={20} />
                  <span className="font-medium">Pagamento aprovado!</span>
                </div>
              )}

              {paymentStatus === 'rejected' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={20} />
                  <span className="font-medium">Pagamento rejeitado. Tente novamente.</span>
                </div>
              )}

              {!paymentStatus && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <Clock size={20} />
                  <span className="text-sm">Aguardando pagamento... O QR Code expira em 30 minutos.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Card Payment */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          {/* CPF */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">CPF do titular *</label>
            <Input
              value={cpf}
              onChange={e => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Número do cartão *</label>
            <Input
              value={cardData.cardNumber}
              onChange={e => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              required
            />
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Nome no cartão *</label>
            <Input
              value={cardData.cardholderName}
              onChange={e => setCardData({ ...cardData, cardholderName: e.target.value.toUpperCase() })}
              placeholder="NOME COMO ESTÁ NO CARTÃO"
              required
            />
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Validade *</label>
              <div className="flex gap-2">
                <Input
                  value={cardData.cardExpirationMonth}
                  onChange={e => setCardData({ ...cardData, cardExpirationMonth: e.target.value.replace(/\D/g, '') })}
                  placeholder="MM"
                  maxLength={2}
                  required
                />
                <Input
                  value={cardData.cardExpirationYear}
                  onChange={e => setCardData({ ...cardData, cardExpirationYear: e.target.value.replace(/\D/g, '') })}
                  placeholder="AA"
                  maxLength={2}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">CVV *</label>
              <Input
                value={cardData.securityCode}
                onChange={e => setCardData({ ...cardData, securityCode: e.target.value.replace(/\D/g, '') })}
                placeholder="000"
                maxLength={4}
                type="password"
                required
              />
            </div>
          </div>

          {/* Installments */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Parcelas</label>
            <select
              value={cardData.installments}
              onChange={e => setCardData({ ...cardData, installments: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <option key={n} value={n}>
                  {n}x {n === 1 ? 'sem juros' : `de R$ ${(totalAmount / n).toFixed(2).replace('.', ',')}`}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {cardError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              <span className="text-sm">{cardError}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleCreateCardPayment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin mr-2" /> Processando...</>
            ) : (
              <>Pagar R$ {totalAmount.toFixed(2).replace('.', ',')}</>
            )}
          </Button>
        </div>
      )}

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        🔒 Pagamento seguro processado pelo Mercado Pago
      </p>
    </div>
  );
}
