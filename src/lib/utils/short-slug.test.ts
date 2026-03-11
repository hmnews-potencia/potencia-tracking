import { describe, it, expect } from 'vitest';
import { generateShortSlug } from './short-slug';

describe('generateShortSlug', () => {
  it('should generate a 6-character slug by default', () => {
    const slug = generateShortSlug();
    expect(slug).toHaveLength(6);
  });

  it('should generate only alphanumeric characters', () => {
    for (let i = 0; i < 20; i++) {
      const slug = generateShortSlug();
      expect(slug).toMatch(/^[a-zA-Z0-9]+$/);
    }
  });

  it('should generate unique slugs', () => {
    const slugs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      slugs.add(generateShortSlug());
    }
    expect(slugs.size).toBe(100);
  });

  it('should accept custom length', () => {
    const slug = generateShortSlug(10);
    expect(slug).toHaveLength(10);
  });
});
