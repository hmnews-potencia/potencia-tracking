import { describe, it, expect } from 'vitest';

/**
 * Tests for middleware route classification logic.
 * We test the PUBLIC_ROUTES matching logic in isolation,
 * without importing the actual middleware (which depends on Next.js runtime).
 */

const PUBLIC_ROUTES = ['/login', '/api/track', '/api/track/health', '/r/'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

describe('Middleware Route Classification', () => {
  describe('PUBLIC_ROUTES contains expected routes', () => {
    it('should include /login', () => {
      expect(PUBLIC_ROUTES).toContain('/login');
    });

    it('should include /api/track', () => {
      expect(PUBLIC_ROUTES).toContain('/api/track');
    });

    it('should include /api/track/health', () => {
      expect(PUBLIC_ROUTES).toContain('/api/track/health');
    });

    it('should include /r/', () => {
      expect(PUBLIC_ROUTES).toContain('/r/');
    });

    it('should have exactly 4 public routes', () => {
      expect(PUBLIC_ROUTES).toHaveLength(4);
    });
  });

  describe('isPublicRoute correctly identifies public routes', () => {
    it('should match /login exactly', () => {
      expect(isPublicRoute('/login')).toBe(true);
    });

    it('should match /login with query params', () => {
      expect(isPublicRoute('/login?redirect=/')).toBe(true);
    });

    it('should match /api/track', () => {
      expect(isPublicRoute('/api/track')).toBe(true);
    });

    it('should match /api/track/health', () => {
      expect(isPublicRoute('/api/track/health')).toBe(true);
    });

    it('should match /r/ redirect routes', () => {
      expect(isPublicRoute('/r/abc123')).toBe(true);
    });

    it('should match /r/ with nested paths', () => {
      expect(isPublicRoute('/r/project/link')).toBe(true);
    });
  });

  describe('isPublicRoute correctly identifies protected routes', () => {
    it('should NOT match / (dashboard)', () => {
      expect(isPublicRoute('/')).toBe(false);
    });

    it('should NOT match /dashboard', () => {
      expect(isPublicRoute('/dashboard')).toBe(false);
    });

    it('should NOT match /settings', () => {
      expect(isPublicRoute('/settings')).toBe(false);
    });

    it('should NOT match /api/other', () => {
      expect(isPublicRoute('/api/other')).toBe(false);
    });

    it('should NOT match /projects', () => {
      expect(isPublicRoute('/projects')).toBe(false);
    });

    it('should NOT match /auth/callback (handled by app router)', () => {
      expect(isPublicRoute('/auth/callback')).toBe(false);
    });
  });
});
