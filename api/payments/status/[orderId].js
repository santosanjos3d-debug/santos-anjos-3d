// Vercel Serverless Function - Consultar status do pagamento
import { query, cors } from '../../_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Extrair orderId da URL: /api/payments/status/[orderId]
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId é obrigatório' });
    }

    // Buscar pedido
    const orders = await query(
      `SELECT id, orderNumber, paymentMethod, paymentStatus, status,
              pixQrCodeBase64, pixCopyPaste, cardBrand, cardInstallments,
              mercadopagoPaymentId, totalPrice
       FROM orders WHERE id = ? OR orderNumber = ?`,
      [orderId, orderId]
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = orders[0];

    return res.status(200).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      pixQrCode: order.pixQrCodeBase64,
      pixCopyPaste: order.pixCopyPaste,
      cardBrand: order.cardBrand,
      cardInstallments: order.cardInstallments,
      mercadopagoPaymentId: order.mercadopagoPaymentId,
      totalPrice: order.totalPrice,
    });
  } catch (err) {
    console.error('[Payments STATUS]', err);
    return res.status(500).json({ error: 'Erro ao consultar status do pagamento' });
  }
}
