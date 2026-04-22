import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderService } from '../ReminderService';
import { dbManager } from '../database';

// ── Minimal SQLite connection fake ────────────────────────────────────────────

const mockDb = {
  execute: vi.fn().mockResolvedValue(undefined),
  run: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue({ values: [] }),
};

vi.mock('../database', () => ({
  dbManager: { connection: null as any },
}));

vi.mock('../seed', () => ({
  defaultReminders: [
    {
      id: 'seed-1',
      category: 'water',
      label: 'Drink Water',
      enabled: true,
      archived: false,
      soundMode: 'sound_vibration',
      snoozeMins: 10,
      character: 'mochi',
      customMessage: null,
      createdAt: 1000,
      updatedAt: 1000,
      schedules: [],
    },
  ],
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Inject fake db into dbManager.connection
  Object.defineProperty(dbManager, 'connection', {
    get: () => mockDb,
    configurable: true,
  });
});

// ── Helper to build a Reminder row ─────────────────────────────────────────

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'r-test',
  category: 'water',
  label: 'Test',
  enabled: true,
  archived: false,
  soundMode: 'sound_vibration',
  snoozeMins: 10,
  character: 'mochi',
  customMessage: undefined,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  schedules: [],
  ...overrides,
});

describe('ReminderService', () => {
  // ── getAllReminders ──────────────────────────────────────────────────────

  describe('getAllReminders', () => {
    it('returns an empty array when no reminders exist', async () => {
      mockDb.query.mockResolvedValue({ values: [] });
      expect(await ReminderService.getAllReminders()).toEqual([]);
    });

    it('maps DB rows into Reminder objects including schedules', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          values: [{
            id: 'r1', category: 'water', label: 'W', enabled: 1, archived: 0,
            sound_mode: 'silent', snooze_mins: 5, character: 'kuro',
            custom_message: null, created_at: 0, updated_at: 0,
          }],
        })
        .mockResolvedValueOnce({
          values: [{
            id: 's1', reminder_id: 'r1', type: 'fixed', time_value: '08:00',
            days_of_week: JSON.stringify([1, 2, 3]), start_time: null, end_time: null, notif_id: 1,
          }],
        });

      const result = await ReminderService.getAllReminders();
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('r1');
      expect(result[0]!.schedules[0]!.daysOfWeek).toEqual([1, 2, 3]);
    });
  });

  // ── seedIfEmpty ─────────────────────────────────────────────────────────

  describe('seedIfEmpty', () => {
    it('inserts default reminders when count is 0', async () => {
      mockDb.query.mockResolvedValue({ values: [{ count: 0 }] });
      await ReminderService.seedIfEmpty();
      expect(mockDb.run).toHaveBeenCalled();
    });

    it('skips insertion when count is > 0', async () => {
      mockDb.query.mockResolvedValue({ values: [{ count: 2 }] });
      await ReminderService.seedIfEmpty();
      expect(mockDb.run).not.toHaveBeenCalled();
    });
  });

  // ── addReminder ─────────────────────────────────────────────────────────

  describe('addReminder', () => {
    it('inserts into reminders table', async () => {
      await ReminderService.addReminder(makeReminder());
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reminders'),
        expect.any(Array),
      );
    });

    it('inserts each schedule entry', async () => {
      const reminder = makeReminder({
        schedules: [
          { id: 's1', reminderId: 'r-test', type: 'fixed', timeValue: '08:00', daysOfWeek: [1, 2] },
        ],
      });
      await ReminderService.addReminder(reminder);
      const scheduleCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('INSERT INTO schedules'),
      );
      expect(scheduleCalls).toHaveLength(1);
    });
  });

  // ── updateReminder ──────────────────────────────────────────────────────

  describe('updateReminder', () => {
    it('updates character field', async () => {
      await ReminderService.updateReminder('r1', { character: 'kuro' });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reminders'),
        expect.arrayContaining(['kuro']),
      );
    });

    it('updates customMessage field', async () => {
      await ReminderService.updateReminder('r1', { customMessage: 'My custom msg' });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reminders'),
        expect.arrayContaining(['My custom msg']),
      );
    });

    it('replaces schedules when schedules is in changes', async () => {
      await ReminderService.updateReminder('r1', {
        schedules: [{ id: 's-new', reminderId: 'r1', type: 'interval', timeValue: '60' }],
      });
      // First run: DELETE old schedules
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM schedules'),
        ['r1'],
      );
      // Second run: INSERT new schedule
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO schedules'),
        expect.any(Array),
      );
    });

    it('does nothing to the reminders table when changes object is empty', async () => {
      await ReminderService.updateReminder('r1', {});
      const updateCalls = mockDb.run.mock.calls.filter((call: any[]) =>
        typeof call[0] === 'string' && call[0].includes('UPDATE reminders'),
      );
      expect(updateCalls).toHaveLength(0);
    });
  });

  // ── getRecentCompletions ────────────────────────────────────────────────

  describe('getRecentCompletions', () => {
    it('returns mapped CompletionEntry objects', async () => {
      mockDb.query.mockResolvedValue({
        values: [{
          id: 'c1', reminder_id: 'r1', category: 'water',
          completed_at: 1000, was_skipped: 0,
        }],
      });
      const result = await ReminderService.getRecentCompletions();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'c1', reminderId: 'r1', category: 'water',
        completedAt: 1000, wasSkipped: false,
      });
    });

    it('returns empty array when no completions', async () => {
      mockDb.query.mockResolvedValue({ values: [] });
      expect(await ReminderService.getRecentCompletions()).toEqual([]);
    });
  });

  // ── clearHistory ────────────────────────────────────────────────────────

  describe('clearHistory', () => {
    it('deletes completion_log and resets streak columns', async () => {
      await ReminderService.clearHistory();
      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM completion_log');
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('current_streak = 0'),
      );
    });
  });
});
