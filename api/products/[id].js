// Vercel Serverless Function - Product by ID (PUT, DELETE)
import { query, cors } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  // PUT - atualizar produto (admin)
  if (req.method === 'PUT') {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    try {
      const {
        name, description, details, category, image, price,
        widthCm, heightCm, lengthCm, weightGrams, sizes, colors, active, sortOrder
      } = req.body || {};

      await query(
        `UPDATE products SET
          name = COALESCE(?, name),
          description = ?,
          details = ?,
          category = ?,
          image = COALESCE(?, image),
          price = COALESCE(?, price),
          widthCm = ?,
          heightCm = ?,
          lengthCm = ?,
          weightGrams = ?,
          sizes = ?,
          colors = ?,
          active = COALESCE(?, active),
          sortOrder = COALESCE(?, sortOrder),
          updatedAt = NOW()
         WHERE id = ?`,
        [
          name || null,
          description || null,
          details || null,
          category || null,
          image || null,
          price || null,
          widthCm || null,
          heightCm || null,
          lengthCm || null,
          weightGrams || null,
          sizes ? JSON.stringify(sizes) : null,
          colors ? JSON.stringify(colors) : null,
          active !== undefined ? (active ? 1 : 0) : null,
          sortOrder !== undefined ? sortOrder : null,
          id
        ]
      );

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[Products PUT]', err);
      return res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  // DELETE - excluir produto (admin)
  if (req.method === 'DELETE') {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    try {
      await query('DELETE FROM products WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('[Products DELETE]', err);
      return res.status(500).json({ error: 'Erro ao excluir produto' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
