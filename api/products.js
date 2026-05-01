// Vercel Serverless Function - Products CRUD
import { query, cors } from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET - listar produtos (público)
  if (req.method === 'GET') {
    try {
      const products = await query(
        `SELECT id, name, description, details, category, image, price,
                widthCm, heightCm, lengthCm, weightGrams, sizes, colors,
                active, sortOrder, createdAt, updatedAt
         FROM products
         WHERE active = 1
         ORDER BY sortOrder ASC, name ASC`
      );

      const parsed = products.map(p => ({
        ...p,
        sizes: p.sizes ? JSON.parse(p.sizes) : [],
        colors: p.colors ? JSON.parse(p.colors) : [],
      }));

      return res.status(200).json(parsed);
    } catch (err) {
      console.error('[Products GET]', err);
      return res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }

  // POST - criar produto (admin)
  if (req.method === 'POST') {
    const ok = await requireAdmin(req, res);
    if (!ok) return;

    try {
      const {
        name, description, details, category, image, price,
        widthCm, heightCm, lengthCm, weightGrams, sizes, colors, sortOrder
      } = req.body || {};

      if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }

      const result = await query(
        `INSERT INTO products (name, description, details, category, image, price,
          widthCm, heightCm, lengthCm, weightGrams, sizes, colors, active, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          name,
          description || null,
          details || null,
          category || null,
          image || null,
          price,
          widthCm || null,
          heightCm || null,
          lengthCm || null,
          weightGrams || null,
          sizes ? JSON.stringify(sizes) : null,
          colors ? JSON.stringify(colors) : null,
          sortOrder || 0
        ]
      );

      return res.status(201).json({ id: result.insertId, success: true });
    } catch (err) {
      console.error('[Products POST]', err);
      return res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
