// Vercel Serverless Function - Webhook do Mercado Pago
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { query, cors } from '../_lib/db.js';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Mercado Pago envia POST para webhooks
  if (req.method !== 'POST') {
    return res.status(200).json({ received: true });
  }

  try {
    const { action, data } = req.body || {};

    // Mercado Pago envia: { action: "payment.created", data: { id: "123456" } }
    if (action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data?.id;

      if (!paymentId) {
        console.error('[Webhook] No payment ID in webhook data');
        return res.status(200).json({ received: true });
      }

      // Buscar detalhes do pagamento no Mercado Pago
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: paymentId });

      // Encontrar pedido pelo external_reference (orderId)
      const orderId = paymentDetails.external_reference;
      if (!orderId) {
        console.error('[Webhook] No external_reference in payment');
        return res.status(200).json({ received: true });
      }

      const orders = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!orders || orders.length === 0) {
        console.error('[Webhook] Order not found:', orderId);
        return res.status(200).json({ received: true });
      }

      const order = orders[0];

      // Mapear status do Mercado Pago para nosso sistema
      const statusMap = {
        'approved': 'paid',
        'pending': 'pending',
        'authorized': 'pending',
        'in_process': 'pending',
        'in_detail': 'pending',
        'rejected': 'cancelled',
        'cancelled': 'cancelled',
        'refunded': 'cancelled',
        'charged_back': 'cancelled',
      };

      const newOrderStatus = statusMap[paymentDetails.status] || order.status;
      const newPaymentStatus = paymentDetails.status;

      // Atualizar pedido
      await query(
        `UPDATE orders SET
          paymentStatus = ?,
          status = ?,
          mercadopagoPaymentId = ?,
          paymentMethod = ?
        WHERE id = ?`,
        [
          newPaymentStatus,
          newOrderStatus,
          paymentDetails.id?.toString() || order.mercadopagoPaymentId,
          paymentDetails.payment_method_id || order.paymentMethod,
          order.id,
        ]
      );

      console.log(`[Webhook] Order ${order.orderNumber} updated: payment=${newPaymentStatus}, order=${newOrderStatus}`);
    }

    // Sempre retornar 200 para o Mercado Pago não reenviar
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook Error]', err);
    // Mesmo com erro, retornar 200 para evitar retry infinito
    return res.status(200).json({ received: true, error: err.message });
  }
}
