// Vercel Serverless Function - Order by ID (PATCH, DELETE)
import { query, cors } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  try {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do pedido não fornecido' });
    }

    // PATCH - atualizar status do pedido (admin)
    if (req.method === 'PATCH') {
      const ok = await requireAdmin(req, res);
      if (!ok) return;

      const { status, trackingCode, labelUrl, melhorEnvioOrderId, melhorEnvioProtocol } = req.body || {};

      await query(
        `UPDATE orders SET
          status = COALESCE(?, status),
          trackingCode = COALESCE(?, trackingCode),
          labelUrl = COALESCE(?, labelUrl),
          melhorEnvioOrderId = COALESCE(?, melhorEnvioOrderId),
          melhorEnvioProtocol = COALESCE(?, melhorEnvioProtocol),
          updatedAt = NOW()
         WHERE id = ?`,
        [
          status || null,
          trackingCode || null,
          labelUrl || null,
          melhorEnvioOrderId || null,
          melhorEnvioProtocol || null,
          id
        ]
      );

      return res.status(200).json({ success: true });
    }

    // DELETE - excluir pedido (admin)
    if (req.method === 'DELETE') {
      const ok = await requireAdmin(req, res);
      if (!ok) return;

      console.log('[Orders DELETE] Attempting to delete order id:', id);
      const result = await query('DELETE FROM orders WHERE id = ?', [id]);
      console.log('[Orders DELETE] Result:', JSON.stringify(result));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Orders ID] Unhandled error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Erro interno do servidor', details: err.message || String(err) });
    }
  }
}
