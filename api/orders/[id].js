// Vercel Serverless Function - Order by ID (PATCH, DELETE)
import { query, cors } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  // PATCH - atualizar status do pedido (admin)
  if (req.method === 'PATCH') {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    try {
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
    } catch (err) {
      console.error('[Orders PATCH]', err);
      return res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  }

  // DELETE - excluir pedido (admin)
  if (req.method === 'DELETE') {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    try {
      await query('DELETE FROM orders WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[Orders DELETE]', err);
      return res.status(500).json({ error: 'Erro ao excluir pedido' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
