// Vercel Serverless Function - Webhook do Mercado Pago
import { query, cors, runMigration } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(200).json({ received: true });
  }

  try {
    await runMigration();

    const { action, data } = req.body || {};

    if (action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data?.id;

      if (!paymentId) {
        console.error('[Webhook] No payment ID in webhook data');
        return res.status(200).json({ received: true });
      }

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const paymentDetails = await response.json();

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

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Webhook Error]', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
