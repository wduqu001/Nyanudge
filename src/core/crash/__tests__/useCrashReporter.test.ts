import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CRASH_LOGS_KEY,
  CRASH_OPT_IN_KEY,
  isCrashReporterEnabled,
  setCrashReporterEnabled,
  getCrashLogs,
  appendCrashLog,
  clearCrashLogs,
  exportCrashLogs,
  type CrashLog,
} from '../useCrashReporter';

describe('useCrashReporter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── isCrashReporterEnabled ────────────────────────────────────────────────

  describe('isCrashReporterEnabled', () => {
    it('returns false when nothing is stored', () => {
      expect(isCrashReporterEnabled()).toBe(false);
    });

    it('returns true when opt-in key is "true"', () => {
      localStorage.setItem(CRASH_OPT_IN_KEY, 'true');
      expect(isCrashReporterEnabled()).toBe(true);
    });

    it('returns false when opt-in key is "false"', () => {
      localStorage.setItem(CRASH_OPT_IN_KEY, 'false');
      expect(isCrashReporterEnabled()).toBe(false);
    });
  });

  // ── setCrashReporterEnabled ───────────────────────────────────────────────

  describe('setCrashReporterEnabled', () => {
    it('persists "true" to localStorage', () => {
      setCrashReporterEnabled(true);
      expect(localStorage.getItem(CRASH_OPT_IN_KEY)).toBe('true');
    });

    it('persists "false" to localStorage', () => {
      setCrashReporterEnabled(false);
      expect(localStorage.getItem(CRASH_OPT_IN_KEY)).toBe('false');
    });

    it('round-trips: set then read', () => {
      setCrashReporterEnabled(true);
      expect(isCrashReporterEnabled()).toBe(true);
      setCrashReporterEnabled(false);
      expect(isCrashReporterEnabled()).toBe(false);
    });
  });

  // ── getCrashLogs ─────────────────────────────────────────────────────────

  describe('getCrashLogs', () => {
    it('returns an empty array when nothing is stored', () => {
      expect(getCrashLogs()).toEqual([]);
    });

    it('returns parsed array when valid JSON is stored', () => {
      const logs: CrashLog[] = [{ timestamp: '2024-01-01T00:00:00Z', error: 'Oops' }];
      localStorage.setItem(CRASH_LOGS_KEY, JSON.stringify(logs));
      expect(getCrashLogs()).toEqual(logs);
    });

    it('returns empty array when stored JSON is malformed', () => {
      localStorage.setItem(CRASH_LOGS_KEY, 'not valid json {{{');
      expect(getCrashLogs()).toEqual([]);
    });
  });

  // ── appendCrashLog ────────────────────────────────────────────────────────

  describe('appendCrashLog', () => {
    it('is a no-op when crash reporter is disabled', () => {
      setCrashReporterEnabled(false);
      appendCrashLog({ timestamp: 'T1', error: 'e1' });
      expect(getCrashLogs()).toEqual([]);
    });

    it('prepends a new entry when enabled', () => {
      setCrashReporterEnabled(true);
      const entry: CrashLog = { timestamp: 'T1', error: 'test error', stack: 'stack' };
      appendCrashLog(entry);
      const logs = getCrashLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toEqual(entry);
    });

    it('prepends (most recent first)', () => {
      setCrashReporterEnabled(true);
      appendCrashLog({ timestamp: 'T1', error: 'first' });
      appendCrashLog({ timestamp: 'T2', error: 'second' });
      const logs = getCrashLogs();
      expect(logs[0]!.error).toBe('second');
      expect(logs[1]!.error).toBe('first');
    });

    it('caps stored logs at 10 entries', () => {
      setCrashReporterEnabled(true);
      for (let i = 0; i < 15; i++) {
        appendCrashLog({ timestamp: `T${i}`, error: `error ${i}` });
      }
      expect(getCrashLogs()).toHaveLength(10);
    });

    it('does not throw when localStorage throws during write', () => {
      setCrashReporterEnabled(true);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
        throw new Error('storage full');
      });
      // The function swallows the error via console.error
      expect(() => appendCrashLog({ timestamp: 'T', error: 'e' })).not.toThrow();
    });
  });

  // ── clearCrashLogs ────────────────────────────────────────────────────────

  describe('clearCrashLogs', () => {
    it('removes the crash logs key from localStorage', () => {
      setCrashReporterEnabled(true);
      appendCrashLog({ timestamp: 'T1', error: 'err' });
      expect(getCrashLogs()).toHaveLength(1);

      clearCrashLogs();

      expect(localStorage.getItem(CRASH_LOGS_KEY)).toBeNull();
      expect(getCrashLogs()).toEqual([]);
    });
  });

  // ── exportCrashLogs ───────────────────────────────────────────────────────

  describe('exportCrashLogs', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('creates an anchor and programmatically clicks it', () => {
      const fakeUrl = 'blob:fake-url';
      const createObjectURL = vi.fn().mockReturnValue(fakeUrl);
      const revokeObjectURL = vi.fn();
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;

      const clickSpy = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: clickSpy,
      } as unknown as HTMLAnchorElement);

      exportCrashLogs();

      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(clickSpy).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith(fakeUrl);

      createElementSpy.mockRestore();
    });

    it('exports all current crash logs as JSON', () => {
      setCrashReporterEnabled(true);
      appendCrashLog({ timestamp: 'T1', error: 'err1' });

      let capturedBlob: Blob | null = null;
      global.URL.createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:test';
      });
      global.URL.revokeObjectURL = vi.fn();
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLAnchorElement);

      exportCrashLogs();

      // The blob should be parseable JSON containing our log
      return capturedBlob!.text().then((text) => {
        const parsed = JSON.parse(text);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].error).toBe('err1');
      });
    });
  });
});
