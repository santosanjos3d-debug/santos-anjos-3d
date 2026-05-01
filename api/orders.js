// Vercel Serverless Function - Orders CRUD
import { query, cors } from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'SA-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST - criar pedido (público)
  if (req.method === 'POST') {
    try {
      const {
        customerName, customerPhone, customerDocument,
        addressPostalCode, addressStreet, addressNumber, addressComplement,
        addressDistrict, addressCity, addressState,
        shippingServiceId, shippingServiceName, shippingCompany,
        subtotal, shippingCost, totalPrice, itemsSummary
      } = req.body || {};

      if (!customerName || !customerPhone || !customerDocument || !addressPostalCode) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const orderNumber = generateOrderNumber();

      const result = await query(
        `INSERT INTO orders (
          orderNumber, customerName, customerPhone, customerDocument,
          addressPostalCode, addressStreet, addressNumber, addressComplement,
          addressDistrict, addressCity, addressState,
          shippingServiceId, shippingServiceName, shippingCompany,
          subtotal, shippingCost, totalPrice, itemsSummary, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderNumber, customerName, customerPhone, customerDocument,
          addressPostalCode, addressStreet || null, addressNumber || null, addressComplement || null,
          addressDistrict || null, addressCity || null, addressState || null,
          shippingServiceId || null, shippingServiceName || null, shippingCompany || null,
          subtotal || 0, shippingCost || 0, totalPrice || 0,
          itemsSummary ? JSON.stringify(itemsSummary) : null
        ]
      );

      return res.status(201).json({ id: result.insertId, orderNumber, success: true });
    } catch (err) {
      console.error('[Orders POST]', err);
      return res.status(500).json({ error: 'Erro ao criar pedido: ' + err.message });
    }
  }

  // GET - listar pedidos (admin)
  if (req.method === 'GET') {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    try {
      const orders = await query(
        `SELECT * FROM orders ORDER BY createdAt DESC LIMIT 200`
      );

      const parsed = orders.map(o => ({
        ...o,
        itemsSummary: o.itemsSummary ? JSON.parse(o.itemsSummary) : [],
      }));

      return res.status(200).json(parsed);
    } catch (err) {
      console.error('[Orders GET]', err);
      return res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
