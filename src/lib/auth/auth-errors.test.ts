import { describe, it, expect } from 'vitest';
import { formatAuthError } from './auth-errors';

describe('formatAuthError', () => {
  it('should return "Credenciais inválidas" for invalid credentials', () => {
    expect(formatAuthError('Invalid login credentials')).toBe(
      'Credenciais inválidas',
    );
  });

  it('should return email not confirmed message', () => {
    expect(formatAuthError('Email not confirmed')).toBe(
      'Email não confirmado. Verifique sua caixa de entrada.',
    );
  });

  it('should return connection error for network issues', () => {
    expect(formatAuthError('network error')).toBe(
      'Erro de conexão. Verifique sua internet e tente novamente.',
    );
  });

  it('should return connection error for fetch failures', () => {
    expect(formatAuthError('Failed to fetch')).toBe(
      'Erro de conexão. Verifique sua internet e tente novamente.',
    );
  });

  it('should return generic error for unknown messages', () => {
    expect(formatAuthError('something unknown')).toBe(
      'Erro de conexão. Tente novamente.',
    );
  });

  it('should return generic error for empty string', () => {
    expect(formatAuthError('')).toBe('Erro de conexão. Tente novamente.');
  });
});
