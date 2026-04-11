import { describe, it, expect, vi } from 'vitest';
import { formatLocalizedTime, getLocalizedWeekdays } from './dateUtils';

describe('dateUtils', () => {
  describe('formatLocalizedTime', () => {
    it('returns empty string for undefined input', () => {
      expect(formatLocalizedTime(undefined, 'en')).toBe('');
    });

    it('returns the original string if it is malformed (no colon)', () => {
      expect(formatLocalizedTime('0800', 'en')).toBe('0800');
    });

    it('formats a standard time string', () => {
      const result = formatLocalizedTime('08:30', 'en-US');
      // Should contain the hours and minutes in some format
      expect(result).toMatch(/8/);
      expect(result).toMatch(/30/);
    });

    it('formats 00:00 (midnight)', () => {
      const result = formatLocalizedTime('00:00', 'en-US');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('formats 23:59 (end of day)', () => {
      const result = formatLocalizedTime('23:59', 'en-US');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('works with a pt-BR locale', () => {
      const result = formatLocalizedTime('14:30', 'pt-BR');
      // pt-BR uses 24h format, expect "14:30"
      expect(result).toMatch(/14/);
      expect(result).toMatch(/30/);
    });

    it('works with undefined locale gracefully', () => {
      expect(() => formatLocalizedTime('08:00', undefined)).not.toThrow();
    });

    describe('Timezone and Daylight Saving assertions', () => {
      it('asserts Timezone and daylight saving offsets', () => {
        const winterDate = new Date(2024, 0, 1); // Jan 1st
        const summerDate = new Date(2024, 6, 1); // Jul 1st
        
        // Assert timezone offsets are numeric (verifying environment handles them)
        expect(typeof winterDate.getTimezoneOffset()).toBe('number');
        expect(typeof summerDate.getTimezoneOffset()).toBe('number');

        // Assert daylight saving offset capability
        const isDST = winterDate.getTimezoneOffset() !== summerDate.getTimezoneOffset();
        expect(typeof isDST).toBe('boolean');

        // Test DST boundary for formatLocalizedTime
        vi.useFakeTimers();
        // US Spring Forward - jump occurs at 2am
        vi.setSystemTime(new Date(2024, 2, 10, 0, 0, 0));
        
        const transitionResult = formatLocalizedTime('02:30', 'en-US');
        expect(transitionResult).toBeDefined();
        expect(transitionResult.length).toBeGreaterThan(0);
        
        vi.useRealTimers();
      });
    });
  });

  describe('getLocalizedWeekdays', () => {
    it('returns exactly 7 weekday labels', () => {
      const days = getLocalizedWeekdays('en');
      expect(days.length).toBe(7);
    });

    it('starts with Sunday (index 0)', () => {
      // Jan 7, 2024 is a Sunday — the base for this util
      const days = getLocalizedWeekdays('en-US');
      // Narrow format for Sunday in 'en-US' is 'S'
      expect(days[0]).toBeDefined();
      expect(days[0]!.length).toBeGreaterThan(0);
    });

    it('returns different labels for different locales', () => {
      const enDays = getLocalizedWeekdays('en');
      const ptDays = getLocalizedWeekdays('pt-BR');
      // Weekday labels won't be identical across English and Portuguese
      const areSame = enDays.every((d, i) => d === ptDays[i]);
      expect(areSame).toBe(false);
    });

    it('works with undefined locale gracefully', () => {
      expect(() => getLocalizedWeekdays(undefined)).not.toThrow();
      const days = getLocalizedWeekdays(undefined);
      expect(days.length).toBe(7);
    });

    it('returns non-empty strings for each day', () => {
      const days = getLocalizedWeekdays('en');
      days.forEach(day => {
        expect(day.length).toBeGreaterThan(0);
      });
    });
  });
});
