import { describe, it, expect } from 'vitest';
import { getDateRange, type PeriodPreset } from '@/stores/filter-store';

describe('Filter Store', () => {
  describe('getDateRange', () => {
    it('should return today for "today" preset', () => {
      const { from, to } = getDateRange('today');
      expect(from).toBe(to);
      expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return 7 day range for "7d" preset', () => {
      const { from, to } = getDateRange('7d');
      const diff = new Date(to).getTime() - new Date(from).getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      expect(days).toBeCloseTo(7, 0);
    });

    it('should return 30 day range for "30d" preset', () => {
      const { from, to } = getDateRange('30d');
      const diff = new Date(to).getTime() - new Date(from).getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      expect(days).toBeCloseTo(30, 0);
    });

    it('should return 90 day range for "90d" preset', () => {
      const { from, to } = getDateRange('90d');
      const diff = new Date(to).getTime() - new Date(from).getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      expect(days).toBeCloseTo(90, 0);
    });

    it('should default to 30d for "custom" preset', () => {
      const { from, to } = getDateRange('custom');
      const diff = new Date(to).getTime() - new Date(from).getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      expect(days).toBeCloseTo(30, 0);
    });

    it('should return valid date strings for all presets', () => {
      const presets: PeriodPreset[] = ['today', '7d', '30d', '90d', 'custom'];
      for (const preset of presets) {
        const { from, to } = getDateRange(preset);
        expect(from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(new Date(from).getTime()).toBeLessThanOrEqual(new Date(to).getTime());
      }
    });
  });
});
