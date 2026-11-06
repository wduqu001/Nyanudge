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

  describe('getCompletionDays', () => {
    it('returns distinct local days per category, skipping skipped entries', async () => {
      mockDb.query.mockResolvedValueOnce({ values: [{ category: 'water', day: '2026-11-06' }] });
      await expect(ReminderService.getCompletionDays()).resolves.toEqual([{ category: 'water', day: '2026-11-06' }]);
      const sql = mockDb.query.mock.calls.at(-1)![0] as string;
      expect(sql).toMatch(/DISTINCT category/);
      expect(sql).toMatch(/'localtime'/);
      expect(sql).toMatch(/was_skipped = 0/);
    });

    it('returns an empty list when the query has no values', async () => {
      mockDb.query.mockResolvedValueOnce({});
      await expect(ReminderService.getCompletionDays()).resolves.toEqual([]);
    });
  });

  describe('getAllReminders', () => {
    it('returns an empty array when no reminders exist', async () => {
      mockDb.query.mockResolvedValue({ values: [] });
      expect(await ReminderService.getAllReminders()).toEqual([]);
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM reminders WHERE archived = 0');
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
      expect(result[0]!.schedules).toHaveLength(1);
      expect(result[0]!.schedules[0]!.id).toBe('s1');
      expect(result[0]!.schedules[0]!.daysOfWeek).toEqual([1, 2, 3]);
    });

    it('reads a schedule saved without weekdays as every day (daysOfWeek undefined)', async () => {
      mockDb.query
        .mockResolvedValueOnce({ values: [{ id: 'r1', category: 'water', label: 'W', enabled: 1, archived: 0, created_at: 0, updated_at: 0 }] })
        .mockResolvedValueOnce({ values: [{ id: 's1', reminder_id: 'r1', type: 'interval', time_value: '120', days_of_week: null, start_time: '07:00', end_time: '21:00', notif_id: 2 }] });

      const [reminder] = await ReminderService.getAllReminders();
      expect(reminder!.schedules[0]).toEqual(expect.objectContaining({ type: 'interval', timeValue: '120', startTime: '07:00', endTime: '21:00' }));
      expect(reminder!.schedules[0]!.daysOfWeek).toBeUndefined();
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

    it('binds reminder and schedule values in insert order', async () => {
      await ReminderService.addReminder(makeReminder({
        id: 'rem-2', category: 'medicine', label: 'Meds', soundMode: 'silent', customMessage: 'Take meds',
        schedules: [{ id: 'sch-2', reminderId: 'rem-2', type: 'interval', timeValue: '60', startTime: '08:00', endTime: '20:00' }],
      }));
      expect(mockDb.run).toHaveBeenCalledTimes(2);
      expect(mockDb.run).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO reminders'),
        expect.arrayContaining(['rem-2', 'medicine', 'Meds', 1, Number(false)]),
      );
      expect(mockDb.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO schedules'),
        expect.arrayContaining(['sch-2', 'rem-2', 'interval', '60']),
      );
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

    it('updates all possible fields correctly', async () => {
      await ReminderService.updateReminder('rem-full', {
        label: 'Full Update',
        enabled: true,
        archived: true,
        soundMode: 'vibrate',
        snoozeMins: 15,
        character: 'sora',
        customMessage: 'Be awesome',
        schedules: [],
      } as any);
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reminders SET label = ?, enabled = ?, archived = ?, sound_mode = ?, snooze_mins = ?, character = ?, custom_message = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['Full Update', 1, 1, 'vibrate', 15, 'sora', 'Be awesome']),
      );
    });

    it('updates fields conditionally and recreates schedules', async () => {
      await ReminderService.updateReminder('rem-3', {
        label: 'New Meds',
        enabled: false,
        schedules: [{ id: 'sch-new', reminderId: 'rem-3', type: 'fixed', timeValue: '09:00', notifId: 999 }],
      });
      expect(mockDb.run).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('UPDATE reminders SET label = ?, enabled = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['New Meds', 0]),
      );
      expect(mockDb.run).toHaveBeenNthCalledWith(2, 'DELETE FROM schedules WHERE reminder_id = ?', ['rem-3']);
      expect(mockDb.run).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO schedules'),
        expect.arrayContaining(['sch-new', 'rem-3', 'fixed', '09:00']),
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

  describe('updateReminder — schedules without optional fields', () => {
    it('stores NULL weekdays and generates a notification id when none is given', async () => {
      await ReminderService.updateReminder('rem-4', {
        schedules: [{ id: 'sch-x', reminderId: 'rem-4', type: 'interval', timeValue: '60' }],
      });
      const insert = mockDb.run.mock.calls.find((call: any[]) => String(call[0]).includes('INSERT INTO schedules'))!;
      const [, , , , daysOfWeek, , , notifId] = insert[1] as unknown[];
      expect(daysOfWeek).toBeNull();
      expect(Number.isInteger(notifId)).toBe(true);
    });
  });

  // ── deleteReminder ──────────────────────────────────────────────────────

  describe('deleteReminder', () => {
    it('deletes from reminders by id', async () => {
      await ReminderService.deleteReminder('r-delete');
      expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM reminders WHERE id = ?', ['r-delete']);
    });
  });

  // ── addCompletion ───────────────────────────────────────────────────────

  describe('addCompletion', () => {
    it('inserts the completion with wasSkipped as 0/1', async () => {
      await ReminderService.addCompletion({ id: 'c-1', reminderId: 'r-1', category: 'water', completedAt: 5000, wasSkipped: true });
      expect(mockDb.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO completion_log'),
        ['c-1', 'r-1', 'water', 5000, 1],
      );
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
        expect.stringContaining('UPDATE streaks SET current_streak = 0'),
      );
    });
  });
});
