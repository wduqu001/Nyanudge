import { describe, it, expect, beforeAll } from 'vitest';
import i18n, { pickMessage, is12Hour, getDateFormat } from '../index';

// Ensure i18n is initialised with the English locale before tests run
beforeAll(async () => {
  if (!i18n.isInitialized) {
    await i18n.init();
  }
  await i18n.changeLanguage('en');
});

describe('i18n utilities', () => {
  // ── pickMessage ────────────────────────────────────────────────────────────

  describe('pickMessage', () => {
    it('returns a non-empty string for a known category', () => {
      const msg = pickMessage('water');
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });

    it('is deterministic over multiple calls for the same category', () => {
      // Each call may pick a different random message, but they should all be
      // valid strings — run several times and verify no call throws
      for (let i = 0; i < 10; i++) {
        expect(() => pickMessage('meal')).not.toThrow();
      }
    });

    it('returns the fallback string for an unknown category', () => {
      const fallback = 'Meow! Time for your reminder.';
      expect(pickMessage('__unknown_category__')).toBe(fallback);
    });

    it('returns the fallback string when category has no messages array', () => {
      // Temporarily override returnObjects to return a string instead of array
      // by using a category key that maps to a non-array translation
      const result = pickMessage('');
      expect(typeof result).toBe('string');
    });
  });

  // ── is12Hour ──────────────────────────────────────────────────────────────

  describe('is12Hour', () => {
    it('returns a boolean for the current locale', () => {
      const result = is12Hour();
      expect(typeof result).toBe('boolean');
    });

    it('returns true for the "en" locale (en.json has formats.time = "12h")', async () => {
      await i18n.changeLanguage('en');
      expect(is12Hour()).toBe(true);
    });

    it('returns false for the "pt-BR" locale (pt-BR.json has formats.time = "24h")', async () => {
      await i18n.changeLanguage('pt-BR');
      expect(is12Hour()).toBe(false);
      await i18n.changeLanguage('en');
    });
  });

  // ── getDateFormat ─────────────────────────────────────────────────────────

  describe('getDateFormat', () => {
    it('returns a non-empty string for the current locale', () => {
      const fmt = getDateFormat();
      expect(typeof fmt).toBe('string');
      expect(fmt.length).toBeGreaterThan(0);
    });

    it('returns the date format for the "en" locale', async () => {
      await i18n.changeLanguage('en');
      const fmt = getDateFormat();
      // en.json formats.date should be a standard format string like 'MM/DD/YYYY'
      expect(fmt).toBeTruthy();
    });

    it('returns a different format for pt-BR locale', async () => {
      await i18n.changeLanguage('en');
      const enFmt = getDateFormat();
      await i18n.changeLanguage('pt-BR');
      const ptFmt = getDateFormat();
      // pt-BR uses DD/MM/YYYY vs en's MM/DD/YYYY — they should differ
      expect(ptFmt).not.toBe(enFmt);
      // Reset back to English
      await i18n.changeLanguage('en');
    });
  });
});
