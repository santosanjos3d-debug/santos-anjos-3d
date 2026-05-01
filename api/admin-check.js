// Vercel Serverless Function - Admin Check
import { cors } from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ok = await requireAdmin(req, res);
  if (!ok) return;

  return res.status(200).json({ authenticated: true });
}
