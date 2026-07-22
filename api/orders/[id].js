// Vercel Serverless Function - Order by ID (PATCH, DELETE)
import { query } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://www.sa3d.vip');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID do pedido não fornecido' });

    if (req.method === 'PATCH') {
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
        [status || null, trackingCode || null, labelUrl || null, melhorEnvioOrderId || null, melhorEnvioProtocol || null, id]
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      console.log('[Orders DELETE] id:', id);
      await query('DELETE FROM orders WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Orders ID] Error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message || 'Erro interno' });
    }
  }
}
