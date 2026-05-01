// Helper de autenticação JWT para funções serverless
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_COOKIE = 'sa3d_admin_token';
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');

export async function signAdminToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export function getAdminCookie(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  return cookies[ADMIN_COOKIE] || null;
}

export async function requireAdmin(req, res) {
  const token = getAdminCookie(req);
  if (!token) {
    res.status(401).json({ error: 'Não autorizado' });
    return false;
  }
  const valid = await verifyAdminToken(token);
  if (!valid) {
    res.status(401).json({ error: 'Token inválido' });
    return false;
  }
  return true;
}

export { ADMIN_COOKIE };
