import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreferenceService } from './PreferenceService';
import { dbManager } from './database';

vi.mock('./database', () => ({
  dbManager: {
    connection: {
      query: vi.fn(),
      run: vi.fn(),
    }
  }
}));

describe('PreferenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('returns empty object if no prefs', async () => {
      vi.mocked(dbManager.connection.query).mockResolvedValueOnce({ values: [] });
      const prefs = await PreferenceService.getPreferences();
      expect(prefs).toEqual({});
    });

    it('parses booleans, numbers, and strings correctly', async () => {
      vi.mocked(dbManager.connection.query).mockResolvedValueOnce({
        values: [
          { key: 'hapticEnabled', value: 'true' },
          { key: 'theme', value: 'dark' },
          { key: 'volume', value: '50' }
        ]
      });
      const prefs = await PreferenceService.getPreferences();
      expect((prefs as any).hapticEnabled).toBe(true);
      expect(prefs.theme).toBe('dark');
      expect((prefs as any).volume).toBe(50);
    });
  });

  describe('updatePreference', () => {
    it('runs UPSERT correctly and stringifies values', async () => {
      await PreferenceService.updatePreference('soundEnabled', false);
      expect(dbManager.connection.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO preferences (key, value, updated_at) VALUES (?, ?, ?)'),
        expect.arrayContaining(['soundEnabled', 'false'])
      );
    });
  });

  describe('saveAll', () => {
    it('updates all entries passed', async () => {
      const prefs = {
        theme: 'light',
        hapticEnabled: true,
      };
      await PreferenceService.saveAll(prefs as any);
      expect(dbManager.connection.run).toHaveBeenCalledTimes(2);
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.arrayContaining(['theme', 'light'])
      );
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.arrayContaining(['hapticEnabled', 'true'])
      );
    });
  });
});
