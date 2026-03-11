import { describe, it, expect } from 'vitest';
import { hashIp } from './hash';

describe('hashIp', () => {
  it('should return a 16-character hex string', () => {
    const result = hashIp('192.168.1.1', 'test-salt');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[a-f0-9]{16}$/);
  });

  it('should produce consistent results for same input', () => {
    const result1 = hashIp('10.0.0.1', 'salt');
    const result2 = hashIp('10.0.0.1', 'salt');
    expect(result1).toBe(result2);
  });

  it('should produce different results for different IPs', () => {
    const result1 = hashIp('192.168.1.1', 'salt');
    const result2 = hashIp('192.168.1.2', 'salt');
    expect(result1).not.toBe(result2);
  });

  it('should produce different results for different salts', () => {
    const result1 = hashIp('192.168.1.1', 'salt-a');
    const result2 = hashIp('192.168.1.1', 'salt-b');
    expect(result1).not.toBe(result2);
  });

  it('should handle empty IP string', () => {
    const result = hashIp('', 'salt');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[a-f0-9]{16}$/);
  });

  it('should handle IPv6 addresses', () => {
    const result = hashIp('::1', 'salt');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[a-f0-9]{16}$/);
  });
});
