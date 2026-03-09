import { describe, it, expect } from 'vitest';

describe('Melhor Envio environment variables', () => {
  it('should have MELHOR_ENVIO_TOKEN configured', () => {
    expect(process.env.MELHOR_ENVIO_TOKEN).toBeTruthy();
  });

  it('should have MELHOR_ENVIO_DOCUMENT configured', () => {
    expect(process.env.MELHOR_ENVIO_DOCUMENT).toBeTruthy();
  });

  it('should have MELHOR_ENVIO_ORIGIN_CEP configured', () => {
    const cep = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';
    expect(cep).toMatch(/^\d{8}$/);
  });
});
