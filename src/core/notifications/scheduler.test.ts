import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalNotifications } from '@capacitor/local-notifications';
import { calculateNextFireTime, scheduleReminder, snoozeReminder } from './scheduler';

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  }
}));

vi.mock('../i18n', () => ({
  default: {
    t: vi.fn((key) => key),
  },
  pickMessage: vi.fn(() => 'Mock Message'),
}));

describe('scheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  describe('calculateNextFireTime', () => {
    it('fixed: schedules for later today if time has not passed', () => {
      const now = new Date(2026, 4, 10, 8, 0); 
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'fixed', timeValue: '10:00' };
      const result = calculateNextFireTime(schedule);
      expect(result?.getHours()).toBe(10);
      expect(result?.getDate()).toBe(10);
    });

    it('fixed: schedules for tomorrow if time has already passed today', () => {
      const now = new Date(2026, 4, 10, 11, 0); 
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'fixed', timeValue: '10:00' };
      const result = calculateNextFireTime(schedule);
      expect(result?.getDate()).toBe(11);
    });

    it('fixed: respects daysOfWeek', () => {
      const now = new Date(2026, 4, 10, 11, 0); // Sunday (0)
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'fixed', timeValue: '10:00', daysOfWeek: [1] }; // Mon
      const result = calculateNextFireTime(schedule);
      expect(result?.getDay()).toBe(1);
    });

    it('interval: schedules next slot within today window (anchored)', () => {
      const now = new Date(2026, 4, 10, 8, 30); 
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'interval', timeValue: '60', startTime: '07:00', endTime: '21:00' };
      const result = calculateNextFireTime(schedule, now.getTime());
      // Anchored at 08:30 + 60 mins = 09:30
      expect(result?.getHours()).toBe(9);
      expect(result?.getMinutes()).toBe(30);
    });

    it('interval: pushes tomorrow if now is past end window', () => {
      const now = new Date(2026, 4, 10, 22, 0); 
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'interval', timeValue: '60', startTime: '07:00', endTime: '21:00' };
      const result = calculateNextFireTime(schedule);
      expect(result?.getDate()).toBe(11);
      expect(result?.getHours()).toBe(7);
    });

    it('interval: snaps to the next clean slot when no anchor is provided', () => {
      // Current time is 17:18
      vi.setSystemTime(new Date(2023, 9, 10, 17, 18, 0));
      
      const fireTime = calculateNextFireTime({
        id: 'med-1', reminderId: 'r1', type: 'interval', timeValue: '10',
        startTime: '08:00', endTime: '22:00'
      });
      
      expect(fireTime).toBeDefined();
      // Snap to 17:20 (00:00 + n * 10m)
      expect(fireTime?.getMinutes()).toBe(20);
    });

    it('returns undefined if required fields are missing', () => {
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'interval'
        // Missing timeValue
      } as any);
      expect(fireTime).toBeUndefined();
    });
  });

  describe('scheduleReminder', () => {
    it('calls LocalNotifications.schedule with correct parameters', async () => {
      const reminder: Reminder = {
        id: 'r1', category: 'water', label: 'Water', enabled: true, soundMode: 'sound_vibration',
        snoozeMins: 5, character: 'mochi', createdAt: Date.now(), updatedAt: Date.now(),
        schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '14:00', notifId: 999 }]
      };
      vi.setSystemTime(new Date(2026, 4, 10, 12, 0));
      await scheduleReminder(reminder);
      const calls = vi.mocked(LocalNotifications.schedule).mock.calls;
      const notif = calls[0]?.[0]?.notifications?.[0];
      expect(notif?.id).toBeDefined();
      expect(typeof notif?.id).toBe('number');
      expect(notif?.title).toBe('categories.water.name');
    });

    it('does not schedule if disabled', async () => {
      const reminder: Reminder = {
        id: 'r1', category: 'water', label: 'Water', enabled: false, soundMode: 'sound_vibration',
        snoozeMins: 5, character: 'mochi', createdAt: Date.now(), updatedAt: Date.now(), schedules: []
      };
      await scheduleReminder(reminder);
      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it('catches and logs error if LocalNotifications.schedule throws (e.g. permission denied or limit reached)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(LocalNotifications.schedule).mockRejectedValueOnce(new Error('Permission Denied'));
      
      const reminder: Reminder = {
        id: 'r_err', category: 'water', label: 'W', enabled: true, soundMode: 'silent', snoozeMins: 5, character: 'mochi', createdAt: 0, updatedAt: 0, schedules: [{ id: 's1', reminderId: 'r_err', type: 'fixed', timeValue: '10:00', notifId: 22 }]
      };
      
      // Should not throw an unhandled promise rejection
      await expect(scheduleReminder(reminder)).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(`Failed to schedule reminder r_err`, expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('snoozeReminder', () => {
    it('schedules a one-shot notification in the future', async () => {
      const reminder: Reminder = {
        id: 'r1', category: 'medicine', label: 'Meds', enabled: true, soundMode: 'sound_vibration',
        snoozeMins: 15, character: 'mochi', createdAt: Date.now(), updatedAt: Date.now(), schedules: []
      };
      const now = new Date(2026, 4, 10, 10, 0);
      vi.setSystemTime(now);
      await snoozeReminder(123, reminder);
      const calls = vi.mocked(LocalNotifications.schedule).mock.calls;
      const notif = calls[0]?.[0]?.notifications?.[0];
      expect(notif?.id).toBe(123);
      expect(notif?.extra?.isSnoozed).toBe(true);
      expect(notif?.schedule?.at?.getTime()).toBe(now.getTime() + 15 * 60_000);
    });
  });
});
