import { describe, it, expect } from 'vitest';
import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('should convert to lowercase', () => {
    expect(generateSlug('Expo Eletrica')).toBe('expo-eletrica');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('my project name')).toBe('my-project-name');
  });

  it('should remove diacritics', () => {
    expect(generateSlug('Pós-Graduação')).toBe('pos-graduacao');
    expect(generateSlug('Potência Educação')).toBe('potencia-educacao');
  });

  it('should remove special characters', () => {
    expect(generateSlug('hello@world!')).toBe('helloworld');
    expect(generateSlug('test#value$')).toBe('testvalue');
  });

  it('should collapse multiple hyphens', () => {
    expect(generateSlug('hello---world')).toBe('hello-world');
    expect(generateSlug('a  b   c')).toBe('a-b-c');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug('-hello-')).toBe('hello');
    expect(generateSlug('  hello  ')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle string with only special characters', () => {
    expect(generateSlug('!@#$%')).toBe('');
  });

  it('should preserve numbers', () => {
    expect(generateSlug('Expo 2026')).toBe('expo-2026');
  });
});
