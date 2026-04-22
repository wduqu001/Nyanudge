import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderService } from './ReminderService';
import { dbManager } from './database';

vi.mock('./database', () => {
  return {
    dbManager: {
      connection: {
        query: vi.fn(),
        run: vi.fn(),
      }
    }
  };
});

describe('ReminderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllReminders', () => {
    it('returns empty array if no reminders', async () => {
      vi.mocked(dbManager.connection.query).mockResolvedValueOnce({ values: [] });
      const result = await ReminderService.getAllReminders();
      expect(result).toEqual([]);
      expect(dbManager.connection.query).toHaveBeenCalledWith('SELECT * FROM reminders WHERE archived = 0');
    });

    it('maps reminder rows and fetches schedules', async () => {
      vi.mocked(dbManager.connection.query)
        .mockResolvedValueOnce({
          values: [
            { id: 'rem-1', category: 'water', label: 'Water', enabled: 1, sound_mode: 'sound_vibration', snooze_mins: 5, character: 'mochi', archived: 0, created_at: 1000, updated_at: 1000 }
          ]
        })
        .mockResolvedValueOnce({
          values: [
            { id: 'sch-1', reminder_id: 'rem-1', type: 'fixed', time_value: '08:00', notif_id: 1234 }
          ]
        });

      const result = await ReminderService.getAllReminders();
      expect(result.length).toBe(1);
      expect(result[0]!.id).toBe('rem-1');
      expect(result[0]!.schedules.length).toBe(1);
      expect(result[0]!.schedules[0]!.id).toBe('sch-1');
    });
  });

  describe('addReminder', () => {
    it('inserts reminder and its schedules', async () => {
      const mockReminder: Reminder = {
        id: 'rem-2', category: 'medicine', label: 'Meds', enabled: true, soundMode: 'silent', snoozeMins: 10, character: 'taro', createdAt: 2000, updatedAt: 2000, archives: false, customMessage: 'Take meds',
        schedules: [
          { id: 'sch-2', reminderId: 'rem-2', type: 'interval', timeValue: '60', startTime: '08:00', endTime: '20:00' }
        ]
      } as any;
      await ReminderService.addReminder(mockReminder);

      expect(dbManager.connection.run).toHaveBeenCalledTimes(2);
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO reminders'),
        expect.arrayContaining(['rem-2', 'medicine', 'Meds', 1, Number(false)])
      );
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO schedules'),
        expect.arrayContaining(['sch-2', 'rem-2', 'interval', '60'])
      );
    });
  });

  describe('updateReminder', () => {
    it('updates all possible fields correctly', async () => {
      const changes = {
        label: 'Full Update',
        enabled: true,
        archived: true,
        soundMode: 'vibrate',
        snoozeMins: 15,
        character: 'sora',
        customMessage: 'Be awesome',
        schedules: []
      };
      await ReminderService.updateReminder('rem-full', changes as any);

      expect(dbManager.connection.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reminders SET label = ?, enabled = ?, archived = ?, sound_mode = ?, snooze_mins = ?, character = ?, custom_message = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['Full Update', 1, 1, 'vibrate', 15, 'sora', 'Be awesome'])
      );
    });

    it('updates fields conditionally and recreates schedules', async () => {
      const changes = {
        label: 'New Meds',
        enabled: false,
        schedules: [
           { id: 'sch-new', reminderId: 'rem-3', type: 'fixed', timeValue: '09:00', notifId: 999 }
        ]
      };
      await ReminderService.updateReminder('rem-3', changes as any);

      // Check update reminder
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('UPDATE reminders SET label = ?, enabled = ?, updated_at = ? WHERE id = ?'),
        expect.arrayContaining(['New Meds', 0])
      );
      // Delete schedules
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        2,
        'DELETE FROM schedules WHERE reminder_id = ?',
        ['rem-3']
      );
      // Insert new schedule
      expect(dbManager.connection.run).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO schedules'),
        expect.arrayContaining(['sch-new', 'rem-3', 'fixed', '09:00'])
      );
    });
  });

  describe('deleteReminder', () => {
    it('deletes from reminders by id', async () => {
      await ReminderService.deleteReminder('r-delete');
      expect(dbManager.connection.run).toHaveBeenCalledWith('DELETE FROM reminders WHERE id = ?', ['r-delete']);
    });
  });

  describe('Completions', () => {
    it('addCompletion inserts correctly', async () => {
      await ReminderService.addCompletion({ id: 'c-1', reminderId: 'r-1', category: 'water', completedAt: 5000, wasSkipped: true });
      expect(dbManager.connection.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO completion_log'),
        ['c-1', 'r-1', 'water', 5000, 1]
      );
    });

    it('clearHistory purges completion log and resets streaks', async () => {
      await ReminderService.clearHistory();
      expect(dbManager.connection.run).toHaveBeenCalledWith('DELETE FROM completion_log');
      expect(dbManager.connection.run).toHaveBeenCalledWith(expect.stringContaining('UPDATE reminders SET current_streak = 0'));
    });
  });
});
