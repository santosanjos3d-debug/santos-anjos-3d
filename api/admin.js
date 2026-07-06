// Vercel Serverless Function - Admin (login/logout/check)
import { cors } from './_lib/db.js';
import { signAdminToken, requireAdmin, ADMIN_COOKIE } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extrair action da query string: /api/admin?action=login|logout|check
  const { action = 'check' } = req.query || {};

  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { email, password } = req.body || {};
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD_HASH;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = await signAdminToken();
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`
    );
    return res.status(200).json({ success: true });
  }

  if (action === 'logout') {
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
    );
    return res.status(200).json({ success: true });
  }

  // action === 'check'
  const ok = await requireAdmin(req, res);
  if (!ok) return;
  return res.status(200).json({ authenticated: true });
}
