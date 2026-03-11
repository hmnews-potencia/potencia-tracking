import { describe, it, expect } from 'vitest';
import { sanitizeUtmParam } from './utm';

describe('sanitizeUtmParam', () => {
  it('should allow alphanumeric characters', () => {
    expect(sanitizeUtmParam('instagram')).toBe('instagram');
    expect(sanitizeUtmParam('Campaign2026')).toBe('Campaign2026');
  });

  it('should allow underscores and hyphens', () => {
    expect(sanitizeUtmParam('launch_2026')).toBe('launch_2026');
    expect(sanitizeUtmParam('social-media')).toBe('social-media');
  });

  it('should remove special characters', () => {
    expect(sanitizeUtmParam('hello@world!')).toBe('helloworld');
    expect(sanitizeUtmParam('test#value$')).toBe('testvalue');
  });

  it('should remove spaces', () => {
    expect(sanitizeUtmParam('my campaign')).toBe('mycampaign');
  });

  it('should truncate to 200 characters', () => {
    const longString = 'a'.repeat(300);
    const result = sanitizeUtmParam(longString);
    expect(result).toHaveLength(200);
  });

  it('should handle empty string', () => {
    expect(sanitizeUtmParam('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(sanitizeUtmParam('!@#$%^&*()')).toBe('');
  });

  it('should truncate before sanitizing', () => {
    // 200 'a' + 100 special chars = truncated to 200 'a' then sanitized
    const input = 'a'.repeat(200) + '!'.repeat(100);
    expect(sanitizeUtmParam(input)).toBe('a'.repeat(200));
  });
});
