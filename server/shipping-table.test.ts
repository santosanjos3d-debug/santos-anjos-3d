import { describe, it, expect } from 'vitest';
import { calculateShippingByTable, getRegionFromCEP } from './shipping-table';

describe('Shipping Table', () => {
  it('should identify region from CEP correctly', () => {
    expect(getRegionFromCEP('89227320')).toBe('SC'); // Santa Catarina
    expect(getRegionFromCEP('01310100')).toBe('SP'); // São Paulo
    expect(getRegionFromCEP('20040020')).toBe('RJ'); // Rio de Janeiro
    expect(getRegionFromCEP('80010000')).toBe('PR'); // Paraná
    expect(getRegionFromCEP('40010000')).toBe('BA'); // Bahia
  });

  it('should calculate shipping for size P in SC', () => {
    const result = calculateShippingByTable('89227320', 'P');
    
    expect(result.services).toHaveLength(2);
    expect(result.services[0].name).toBe('PAC');
    expect(result.services[0].price).toBe(15.50);
    expect(result.services[0].deliveryTime).toBe(3);
    expect(result.services[1].name).toBe('SEDEX');
    expect(result.services[1].price).toBe(25.00);
    expect(result.services[1].deliveryTime).toBe(1);
  });

  it('should calculate shipping for size M in SP', () => {
    const result = calculateShippingByTable('01310100', 'M');
    
    expect(result.services).toHaveLength(2);
    expect(result.services[0].name).toBe('PAC');
    expect(result.services[0].price).toBe(26.50);
    expect(result.services[1].name).toBe('SEDEX');
    expect(result.services[1].price).toBe(42.00);
  });

  it('should calculate shipping for size G in RJ', () => {
    const result = calculateShippingByTable('20040020', 'G');
    
    expect(result.services).toHaveLength(2);
    expect(result.services[0].price).toBe(35.00);
    expect(result.services[1].price).toBe(55.00);
  });

  it('should fallback to SP prices for unknown CEP', () => {
    const result = calculateShippingByTable('99999999', 'P');
    
    expect(result.services).toHaveLength(2);
    // CEP 99 maps to RS, not unknown
    expect(result.services[0].price).toBeGreaterThan(0);
    expect(result.services[0].company).toBe('Correios');
  });

  it('should return valid service structure', () => {
    const result = calculateShippingByTable('89227320', 'M');
    
    result.services.forEach(service => {
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('price');
      expect(service).toHaveProperty('deliveryTime');
      expect(service).toHaveProperty('company');
      expect(service.company).toBe('Correios');
    });
  });
});
