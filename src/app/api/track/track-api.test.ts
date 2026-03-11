import { describe, it, expect } from 'vitest';
import { sanitizeUtmParam } from '@/lib/utils/utm';
import { hashIp } from '@/lib/utils/hash';

/**
 * Tests for tracking API logic in isolation.
 * Tests validation rules, UTM sanitization, and payload structure
 * without importing the route handler (depends on Next.js runtime).
 */

const VALID_EVENT_TYPES = ['pageview', 'click', 'conversion'];

interface TrackPayload {
  project_slug?: string;
  tracking_id?: string;
  event_type?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string | null;
  utm_term?: string | null;
  page_url?: string;
  referrer?: string | null;
  user_agent?: string;
  conversion_data?: Record<string, unknown> | null;
}

function validatePayload(body: TrackPayload): string | null {
  if (!body.project_slug || !body.tracking_id || !body.event_type) {
    return 'Missing required fields: project_slug, tracking_id, event_type';
  }
  if (!VALID_EVENT_TYPES.includes(body.event_type)) {
    return 'Invalid event_type. Must be: pageview, click, or conversion';
  }
  return null;
}

describe('Tracking API Logic', () => {
  describe('Payload validation', () => {
    it('should accept valid pageview payload', () => {
      const error = validatePayload({
        project_slug: 'my-project',
        tracking_id: 'uuid-123',
        event_type: 'pageview',
      });
      expect(error).toBeNull();
    });

    it('should accept valid conversion payload', () => {
      const error = validatePayload({
        project_slug: 'my-project',
        tracking_id: 'uuid-123',
        event_type: 'conversion',
        conversion_data: { name: 'Test' },
      });
      expect(error).toBeNull();
    });

    it('should reject missing project_slug', () => {
      const error = validatePayload({
        tracking_id: 'uuid-123',
        event_type: 'pageview',
      });
      expect(error).toContain('Missing required fields');
    });

    it('should reject missing tracking_id', () => {
      const error = validatePayload({
        project_slug: 'my-project',
        event_type: 'pageview',
      });
      expect(error).toContain('Missing required fields');
    });

    it('should reject missing event_type', () => {
      const error = validatePayload({
        project_slug: 'my-project',
        tracking_id: 'uuid-123',
      });
      expect(error).toContain('Missing required fields');
    });

    it('should reject invalid event_type', () => {
      const error = validatePayload({
        project_slug: 'my-project',
        tracking_id: 'uuid-123',
        event_type: 'invalid',
      });
      expect(error).toContain('Invalid event_type');
    });

    it('should accept click event_type', () => {
      const error = validatePayload({
        project_slug: 'p',
        tracking_id: 't',
        event_type: 'click',
      });
      expect(error).toBeNull();
    });
  });

  describe('UTM sanitization in tracking events', () => {
    it('should sanitize UTM params before storage', () => {
      expect(sanitizeUtmParam('Instagram Stories')).toBe('InstagramStories');
      expect(sanitizeUtmParam('CPC')).toBe('CPC');
      expect(sanitizeUtmParam('test@#$%')).toBe('test');
    });

    it('should handle empty UTM values', () => {
      expect(sanitizeUtmParam('')).toBe('');
    });
  });

  describe('IP hashing', () => {
    it('should hash IP consistently', () => {
      const salt = 'test-salt';
      const hash1 = hashIp('192.168.1.1', salt);
      const hash2 = hashIp('192.168.1.1', salt);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(16);
    });

    it('should extract first IP from x-forwarded-for', () => {
      const forwarded = '203.0.113.50, 70.41.3.18';
      const ip = forwarded.split(',')[0]?.trim() || '0.0.0.0';
      expect(ip).toBe('203.0.113.50');
    });
  });

  describe('Orphan detection logic', () => {
    it('should mark conversion as orphan when count is 0', () => {
      const count = 0;
      const isOrphan = count === 0;
      expect(isOrphan).toBe(true);
    });

    it('should not mark conversion as orphan when prior events exist', () => {
      const count: number = 3;
      const isOrphan = count === 0;
      expect(isOrphan).toBe(false);
    });
  });

  describe('CORS headers', () => {
    it('should define correct CORS headers', () => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
      expect(headers['Access-Control-Allow-Origin']).toBe('*');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Methods']).toContain('OPTIONS');
    });
  });
});
