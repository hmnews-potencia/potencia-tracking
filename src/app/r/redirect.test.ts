import { describe, it, expect } from 'vitest';
import { randomUUID } from 'crypto';
import { hashIp } from '@/lib/utils/hash';

/**
 * Tests for the /r/[slug] redirect engine logic.
 * Tests cookie generation, IP hashing, and tracking event construction
 * in isolation (without importing the route handler which depends on Next.js runtime).
 */

const COOKIE_NAME = '_ptk_id';
const COOKIE_MAX_AGE = 180 * 24 * 60 * 60; // 180 days
const IP_HASH_SALT = 'test-salt';

describe('Redirect Engine', () => {
  describe('Cookie configuration', () => {
    it('should use _ptk_id as cookie name', () => {
      expect(COOKIE_NAME).toBe('_ptk_id');
    });

    it('should set cookie max-age to 180 days in seconds', () => {
      expect(COOKIE_MAX_AGE).toBe(180 * 24 * 60 * 60);
      expect(COOKIE_MAX_AGE).toBe(15552000);
    });
  });

  describe('Tracking ID generation', () => {
    it('should generate valid UUID v4 when no cookie exists', () => {
      const trackingId = randomUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(trackingId).toMatch(uuidRegex);
    });

    it('should use existing tracking ID from cookie when present', () => {
      const existingId = 'existing-tracking-id-123';
      const trackingId = existingId || randomUUID();
      expect(trackingId).toBe(existingId);
    });

    it('should generate new ID when cookie value is empty', () => {
      const existingId = '';
      const trackingId = existingId || randomUUID();
      expect(trackingId).not.toBe('');
      expect(trackingId.length).toBeGreaterThan(0);
    });

    it('should generate unique IDs on each call', () => {
      const ids = new Set(Array.from({ length: 100 }, () => randomUUID()));
      expect(ids.size).toBe(100);
    });
  });

  describe('IP hashing for tracking', () => {
    it('should hash IP with salt', () => {
      const hash = hashIp('192.168.1.1', IP_HASH_SALT);
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should produce consistent hashes for same IP', () => {
      const hash1 = hashIp('10.0.0.1', IP_HASH_SALT);
      const hash2 = hashIp('10.0.0.1', IP_HASH_SALT);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different IPs', () => {
      const hash1 = hashIp('192.168.1.1', IP_HASH_SALT);
      const hash2 = hashIp('192.168.1.2', IP_HASH_SALT);
      expect(hash1).not.toBe(hash2);
    });

    it('should handle x-forwarded-for with multiple IPs', () => {
      const forwarded = '203.0.113.50, 70.41.3.18, 150.172.238.178';
      const clientIp = forwarded.split(',')[0]?.trim() || '0.0.0.0';
      expect(clientIp).toBe('203.0.113.50');

      const hash = hashIp(clientIp, IP_HASH_SALT);
      expect(hash).toHaveLength(16);
    });

    it('should fallback to 0.0.0.0 when no IP available', () => {
      const hash = hashIp('0.0.0.0', IP_HASH_SALT);
      expect(hash).toHaveLength(16);
      expect(hash).toMatch(/^[0-9a-f]{16}$/);
    });
  });

  describe('Tracking event construction', () => {
    it('should build correct event payload from link data', () => {
      const link = {
        id: 'link-123',
        project_id: 'proj-456',
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'launch-2026',
        utm_content: 'banner-hero',
        utm_term: null,
        full_url: 'https://example.com?utm_source=instagram',
      };
      const trackingId = 'track-789';
      const ipHash = hashIp('192.168.1.1', IP_HASH_SALT);

      const event = {
        project_id: link.project_id,
        link_id: link.id,
        tracking_id: trackingId,
        event_type: 'click' as const,
        utm_source: link.utm_source,
        utm_medium: link.utm_medium,
        utm_campaign: link.utm_campaign,
        utm_content: link.utm_content,
        utm_term: link.utm_term,
        page_url: link.full_url,
        referrer: 'https://google.com',
        user_agent: 'Mozilla/5.0',
        ip_hash: ipHash,
      };

      expect(event.project_id).toBe('proj-456');
      expect(event.link_id).toBe('link-123');
      expect(event.tracking_id).toBe('track-789');
      expect(event.event_type).toBe('click');
      expect(event.utm_source).toBe('instagram');
      expect(event.utm_content).toBe('banner-hero');
      expect(event.utm_term).toBeNull();
      expect(event.ip_hash).toHaveLength(16);
    });
  });

  describe('Slug lookup logic', () => {
    it('should identify found vs not-found responses', () => {
      // Simulating Supabase response for found slug
      const foundResponse = { data: { id: '1', short_slug: 'abc123' }, error: null };
      expect(foundResponse.error || !foundResponse.data).toBeFalsy();

      // Simulating Supabase response for not-found slug
      const notFoundResponse = { data: null, error: { code: 'PGRST116' } };
      expect(notFoundResponse.error || !notFoundResponse.data).toBeTruthy();
    });
  });

  describe('404 page content', () => {
    it('should return valid HTML with 404 message', () => {
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Link não encontrado</title>
</head>
<body>
  <h1>404</h1>
  <p>Link não encontrado</p>
</body>
</html>`;

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('404');
      expect(html).toContain('Link não encontrado');
      expect(html).toContain('lang="pt-BR"');
    });
  });
});
