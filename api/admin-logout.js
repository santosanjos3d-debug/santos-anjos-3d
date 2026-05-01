// Vercel Serverless Function - Admin Logout
import { cors } from './_lib/db.js';
import { ADMIN_COOKIE } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );

  return res.status(200).json({ success: true });
}
