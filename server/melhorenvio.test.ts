import { describe, it, expect } from 'vitest';
import { calculateShipping } from './melhorenvio';

describe('Melhor Envio Integration', () => {
  it('should calculate shipping cost with valid credentials', async () => {
    const result = await calculateShipping({
      destinationCEP: '01310100', // São Paulo
      weight: 100, // grams
      height: 8,
      width: 8,
      length: 15,
    });

    expect(result).toBeDefined();
    expect(result.services).toBeDefined();
    expect(Array.isArray(result.services)).toBe(true);
    
    if (result.services.length > 0) {
      expect(result.services[0]).toHaveProperty('price');
      expect(result.services[0]).toHaveProperty('name');
    }
  });

  it('should handle invalid CEP gracefully', async () => {
    const result = await calculateShipping({
      destinationCEP: '00000000',
      weight: 100,
      height: 8,
      width: 8,
      length: 15,
    });

    expect(result).toBeDefined();
  });
});
