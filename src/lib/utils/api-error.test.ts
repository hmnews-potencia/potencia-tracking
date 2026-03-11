import { describe, it, expect } from 'vitest';
import { formatApiError } from './api-error';

describe('formatApiError', () => {
  it('should create error with status and message', () => {
    const error = formatApiError(404, 'Not found');
    expect(error).toEqual({ status: 404, message: 'Not found' });
  });

  it('should include optional code when provided', () => {
    const error = formatApiError(400, 'Bad request', 'INVALID_INPUT');
    expect(error).toEqual({
      status: 400,
      message: 'Bad request',
      code: 'INVALID_INPUT',
    });
  });

  it('should not include code field when not provided', () => {
    const error = formatApiError(500, 'Internal server error');
    expect(error).not.toHaveProperty('code');
  });
});
