import { describe, it, expect } from 'vitest';
import type { Tables, InsertTables, UpdateTables } from './database';

describe('Database Types', () => {
  it('should create a valid Profile row', () => {
    const profile: Tables<'profiles'> = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@potencia.edu.br',
      full_name: 'Test User',
      role: 'member',
      created_at: '2026-03-10T00:00:00Z',
    };
    expect(profile.role).toBe('member');
    expect(profile.email).toContain('@');
  });

  it('should create a valid Project insert', () => {
    const project: InsertTables<'projects'> = {
      name: 'Test Project',
      slug: 'test-project',
      base_url: 'https://example.com',
    };
    expect(project.name).toBe('Test Project');
    expect(project.id).toBeUndefined();
  });

  it('should create a valid ProjectPage row', () => {
    const page: Tables<'project_pages'> = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      project_id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Landing Page',
      url: 'https://example.com/landing',
      is_default: true,
      created_at: '2026-03-10T00:00:00Z',
    };
    expect(page.is_default).toBe(true);
  });

  it('should create a valid UtmLink insert with required fields only', () => {
    const link: InsertTables<'utm_links'> = {
      project_id: '550e8400-e29b-41d4-a716-446655440000',
      label: 'Instagram Bio',
      base_url: 'https://example.com',
      utm_source: 'instagram',
      short_slug: 'abc123',
      full_url: 'https://example.com?utm_source=instagram',
    };
    expect(link.utm_source).toBe('instagram');
    expect(link.utm_content).toBeUndefined();
  });

  it('should create a valid TrackingEvent row', () => {
    const event: Tables<'tracking_events'> = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      project_id: '550e8400-e29b-41d4-a716-446655440000',
      link_id: null,
      tracking_id: 'trk_abc123',
      event_type: 'click',
      timestamp: '2026-03-10T12:00:00Z',
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'launch-2026',
      utm_content: null,
      utm_term: null,
      page_url: 'https://example.com',
      referrer: null,
      user_agent: 'Mozilla/5.0',
      ip_hash: 'abcdef0123456789',
      conversion_data: null,
      is_orphan: false,
      created_at: '2026-03-10T12:00:00Z',
    };
    expect(event.event_type).toBe('click');
    expect(event.is_orphan).toBe(false);
  });

  it('should allow partial updates', () => {
    const update: UpdateTables<'projects'> = {
      name: 'Updated Name',
    };
    expect(update.name).toBe('Updated Name');
    expect(update.slug).toBeUndefined();
  });

  it('should allow conversion_data as JSON', () => {
    const event: InsertTables<'tracking_events'> = {
      project_id: '550e8400-e29b-41d4-a716-446655440000',
      tracking_id: 'trk_conv1',
      event_type: 'conversion',
      conversion_data: {
        form_id: 'signup',
        value: 99.90,
        currency: 'BRL',
      },
    };
    expect(event.conversion_data).toBeDefined();
    expect(event.event_type).toBe('conversion');
  });
});
