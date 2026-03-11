import { describe, it, expect } from 'vitest';
import { buildUtmUrl } from './url-preview';

describe('buildUtmUrl', () => {
  it('should build URL with all UTM params', () => {
    const url = buildUtmUrl('https://example.com', {
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'launch',
      utm_content: 'hero-banner',
      utm_term: 'eletrica',
    });

    expect(url).toContain('utm_source=instagram');
    expect(url).toContain('utm_medium=social');
    expect(url).toContain('utm_campaign=launch');
    expect(url).toContain('utm_content=hero-banner');
    expect(url).toContain('utm_term=eletrica');
  });

  it('should skip empty UTM params', () => {
    const url = buildUtmUrl('https://example.com', {
      utm_source: 'instagram',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
      utm_term: '',
    });

    expect(url).toContain('utm_source=instagram');
    expect(url).not.toContain('utm_medium');
    expect(url).not.toContain('utm_campaign');
  });

  it('should return empty string for empty base URL', () => {
    expect(
      buildUtmUrl('', {
        utm_source: 'test',
        utm_medium: '',
        utm_campaign: '',
        utm_content: '',
        utm_term: '',
      }),
    ).toBe('');
  });

  it('should handle base URL with existing query params', () => {
    const url = buildUtmUrl('https://example.com?page=1', {
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: '',
      utm_content: '',
      utm_term: '',
    });

    expect(url).toContain('page=1');
    expect(url).toContain('utm_source=facebook');
    expect(url).toContain('utm_medium=cpc');
  });

  it('should handle invalid URL gracefully', () => {
    const url = buildUtmUrl('not-a-url', {
      utm_source: 'test',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
      utm_term: '',
    });

    expect(url).toBe('not-a-url');
  });
});
