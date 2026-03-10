import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Admin Login Credentials', () => {
  it('deve ter ADMIN_EMAIL configurado', () => {
    const email = process.env.ADMIN_EMAIL;
    expect(email).toBeTruthy();
    expect(email).toBe('santos.anjos3d@gmail.com');
  });

  it('deve ter ADMIN_PASSWORD_HASH configurado', () => {
    const hash = process.env.ADMIN_PASSWORD_HASH;
    expect(hash).toBeTruthy();
    expect(hash!.length).toBeGreaterThan(0);
  });

  it('deve validar a senha santos3d (texto simples ou bcrypt)', async () => {
    const stored = process.env.ADMIN_PASSWORD_HASH!;
    expect(stored).toBeTruthy();
    let valid = false;
    if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
      valid = await bcrypt.compare('santos3d', stored);
    } else {
      valid = 'santos3d' === stored;
    }
    expect(valid).toBe(true);
  });

  it('deve rejeitar senha incorreta', async () => {
    const stored = process.env.ADMIN_PASSWORD_HASH!;
    expect(stored).toBeTruthy();
    let valid = false;
    if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
      valid = await bcrypt.compare('senhaerrada', stored);
    } else {
      valid = 'senhaerrada' === stored;
    }
    expect(valid).toBe(false);
  });
});
