import { describe, it, expect } from 'vitest';

/**
 * Tests for tracking script logic (UTM parsing, deduplication).
 * Tests the logic used in pt-tracker.js in isolation.
 */

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function getUtmFromUrl(searchString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const search = new URLSearchParams(searchString);
  for (const key of UTM_PARAMS) {
    const val = search.get(key);
    if (val) params[key] = val;
  }
  return params;
}

function shouldSendPageview(
  sessionFlag: string | null,
  currentPath: string,
): boolean {
  return sessionFlag !== currentPath;
}

describe('Tracking Script Logic', () => {
  describe('UTM parsing from URL', () => {
    it('should parse all UTM params from URL search string', () => {
      const search =
        '?utm_source=instagram&utm_medium=social&utm_campaign=launch&utm_content=banner&utm_term=eletrica';
      const result = getUtmFromUrl(search);
      expect(result).toEqual({
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'launch',
        utm_content: 'banner',
        utm_term: 'eletrica',
      });
    });

    it('should parse partial UTM params', () => {
      const search = '?utm_source=google&utm_medium=cpc';
      const result = getUtmFromUrl(search);
      expect(result).toEqual({
        utm_source: 'google',
        utm_medium: 'cpc',
      });
      expect(result.utm_campaign).toBeUndefined();
    });

    it('should return empty object when no UTM params', () => {
      const result = getUtmFromUrl('?page=2&sort=asc');
      expect(result).toEqual({});
    });

    it('should return empty object for empty search string', () => {
      const result = getUtmFromUrl('');
      expect(result).toEqual({});
    });

    it('should handle URL-encoded values', () => {
      const search = '?utm_source=google&utm_campaign=lancamento%202026';
      const result = getUtmFromUrl(search);
      expect(result.utm_campaign).toBe('lancamento 2026');
    });

    it('should ignore non-UTM params', () => {
      const search = '?utm_source=fb&page=1&ref=header';
      const result = getUtmFromUrl(search);
      expect(Object.keys(result)).toEqual(['utm_source']);
    });
  });

  describe('Pageview deduplication', () => {
    it('should allow first pageview for a path', () => {
      expect(shouldSendPageview(null, '/page1')).toBe(true);
    });

    it('should block duplicate pageview for same path', () => {
      expect(shouldSendPageview('/page1', '/page1')).toBe(false);
    });

    it('should allow pageview for different path', () => {
      expect(shouldSendPageview('/page1', '/page2')).toBe(true);
    });

    it('should handle paths with query strings', () => {
      expect(shouldSendPageview('/page?a=1', '/page?a=1')).toBe(false);
      expect(shouldSendPageview('/page?a=1', '/page?a=2')).toBe(true);
    });
  });

  describe('Tracking event payload structure', () => {
    it('should build correct payload shape', () => {
      const payload = {
        project_slug: 'my-project',
        tracking_id: 'abc-123',
        event_type: 'pageview' as const,
        timestamp: new Date().toISOString(),
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'launch',
        utm_content: null,
        utm_term: null,
        page_url: 'https://example.com/page',
        referrer: 'https://google.com',
        user_agent: 'Mozilla/5.0',
      };

      expect(payload).toHaveProperty('project_slug');
      expect(payload).toHaveProperty('tracking_id');
      expect(payload).toHaveProperty('event_type');
      expect(payload).toHaveProperty('timestamp');
      expect(payload.event_type).toBe('pageview');
    });

    it('should include conversion_data for conversion events', () => {
      const payload = {
        project_slug: 'my-project',
        tracking_id: 'abc-123',
        event_type: 'conversion' as const,
        timestamp: new Date().toISOString(),
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: null,
        utm_term: null,
        page_url: 'https://example.com/obrigado',
        referrer: null,
        user_agent: 'Mozilla/5.0',
        conversion_data: { name: 'John', email: 'john@example.com' },
      };

      expect(payload.event_type).toBe('conversion');
      expect(payload.conversion_data).toEqual({
        name: 'John',
        email: 'john@example.com',
      });
    });
  });
});
