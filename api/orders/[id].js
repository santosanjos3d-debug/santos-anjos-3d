// Vercel Serverless Function - Order by ID (PATCH, DELETE)
import { query } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  console.log('[Orders ID] Method:', req.method, 'Query:', JSON.stringify(req.query));

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://www.sa3d.vip');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('[Orders ID] OPTIONS - returning 200');
    return res.status(200).end();
  }

  const { id } = req.query;
  console.log('[Orders ID] Parsed id:', id);

  if (!id) {
    console.log('[Orders ID] No id provided');
    return res.status(400).json({ error: 'ID não fornecido' });
  }

  // Auth check
  let ok;
  try {
    ok = await requireAdmin(req, res);
    console.log('[Orders ID] Auth result:', ok);
  } catch (authErr) {
    console.error('[Orders ID] Auth error:', authErr);
    return res.status(500).json({ error: 'Erro de autenticação', details: authErr.message });
  }

  if (!ok) {
    console.log('[Orders ID] Not authenticated');
    return;
  }

  if (req.method === 'DELETE') {
    try {
      console.log('[Orders ID] DELETE - deleting order', id);
      await query('DELETE FROM orders WHERE id = ?', [id]);
      console.log('[Orders ID] DELETE - success');
      return res.status(200).json({ success: true });
    } catch (dbErr) {
      console.error('[Orders ID] DELETE error:', dbErr);
      return res.status(500).json({ error: dbErr.message || 'Erro ao excluir' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { status, trackingCode, labelUrl, melhorEnvioOrderId, melhorEnvioProtocol } = req.body || {};
      console.log('[Orders ID] PATCH - updating order', id, 'with', JSON.stringify(req.body));
      await query(
        `UPDATE orders SET status = COALESCE(?, status), trackingCode = COALESCE(?, trackingCode), labelUrl = COALESCE(?, labelUrl), melhorEnvioOrderId = COALESCE(?, melhorEnvioOrderId), melhorEnvioProtocol = COALESCE(?, melhorEnvioProtocol), updatedAt = NOW() WHERE id = ?`,
        [status || null, trackingCode || null, labelUrl || null, melhorEnvioOrderId || null, melhorEnvioProtocol || null, id]
      );
      console.log('[Orders ID] PATCH - success');
      return res.status(200).json({ success: true });
    } catch (dbErr) {
      console.error('[Orders ID] PATCH error:', dbErr);
      return res.status(500).json({ error: dbErr.message || 'Erro ao atualizar' });
    }
  }

  console.log('[Orders ID] Method not allowed:', req.method);
  return res.status(405).json({ error: 'Method not allowed' });
}
