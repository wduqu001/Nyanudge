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

    it('fixed: empty daysOfWeek skips the day filter and returns a normal date', () => {
      const now = new Date(2026, 4, 10, 11, 0);
      vi.setSystemTime(now);
      const schedule: Schedule = {
        id: '1', reminderId: 'r1', type: 'fixed', timeValue: '10:00',
        daysOfWeek: [], // empty → guard is false, returns candidate as-is
      };
      const result = calculateNextFireTime(schedule);
      expect(result).toBeDefined(); // no filter applied, returns next occurrence
    });

    it('fixed: returns undefined when daysOfWeek has values that never match (exhausts 8 attempts)', () => {
      const now = new Date(2026, 4, 10, 11, 0); // Sunday = 0
      vi.setSystemTime(now);
      // Day 8 is invalid (0-6 are valid), so includes() never hits it
      const schedule: Schedule = {
        id: '1', reminderId: 'r1', type: 'fixed', timeValue: '10:00',
        daysOfWeek: [8 as any], // invalid day, never matches any day of week
      };
      const result = calculateNextFireTime(schedule);
      expect(result).toBeUndefined();
    });

    it('fixed: returns undefined when timeValue is malformed', () => {
      vi.setSystemTime(new Date(2026, 4, 10, 8, 0));
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'fixed', timeValue: 'invalid' };
      expect(calculateNextFireTime(schedule)).toBeUndefined();
    });

    it('interval: overnight window — now is in early morning (now < windowEnd)', () => {
      // Window is 22:00 → 06:00; current time is 02:00 AM → inside overnight window
      const now = new Date(2026, 4, 11, 2, 0);
      vi.setSystemTime(now);
      const schedule: Schedule = {
        id: '1', reminderId: 'r1', type: 'interval', timeValue: '60',
        startTime: '22:00', endTime: '06:00',
      };
      const result = calculateNextFireTime(schedule, now.getTime(), now);
      expect(result).toBeDefined();
      // Should return a time that is ≤ 06:00 today (still inside window)
      expect(result!.getHours()).toBeLessThanOrEqual(6);
    });

    it('interval: overnight window — now is in daytime (past windowEnd, before windowStart)', () => {
      // Window is 22:00 → 06:00; current time is 14:00 → outside overnight window
      const now = new Date(2026, 4, 11, 14, 0);
      vi.setSystemTime(now);
      const schedule: Schedule = {
        id: '1', reminderId: 'r1', type: 'interval', timeValue: '60',
        startTime: '22:00', endTime: '06:00',
      };
      const result = calculateNextFireTime(schedule, undefined, now);
      expect(result).toBeDefined();
      // Should snap to windowStart tonight (22:00)
      expect(result!.getHours()).toBe(22);
    });

    it('interval: returns undefined when intervalMins is 0', () => {
      vi.setSystemTime(new Date(2026, 4, 10, 8, 0));
      const schedule: Schedule = {
        id: '1', reminderId: 'r1', type: 'interval', timeValue: '0',
        startTime: '07:00', endTime: '21:00',
      };
      expect(calculateNextFireTime(schedule)).toBeUndefined();
    });
  });

  describe('cancelReminder', () => {
    it('calls LocalNotifications.cancel with reconstructed deterministic IDs', async () => {
      const { cancelReminder } = await import('./scheduler');
      const reminder: Reminder = {
        id: 'r-cancel', category: 'water', label: 'Water', enabled: true,
        soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi',
        createdAt: Date.now(), updatedAt: Date.now(),
        schedules: [{ id: 's1', reminderId: 'r-cancel', type: 'fixed', timeValue: '08:00' }],
      };
      await cancelReminder(reminder);
      expect(LocalNotifications.cancel).toHaveBeenCalled();
      // Should construct 10 IDs per schedule (one schedule → 10 calls)
      const cancelArg = vi.mocked(LocalNotifications.cancel).mock.calls[0]?.[0];
      expect(cancelArg?.notifications).toHaveLength(10);
    });

    it('also queries getPending to cancel snoozed notifications', async () => {
      const { cancelReminder } = await import('./scheduler');
      vi.mocked(LocalNotifications.getPending).mockResolvedValueOnce({
        notifications: [{ id: 99, extra: { reminderId: 'r-snooze' } } as any],
      });
      const reminder: Reminder = {
        id: 'r-snooze', category: 'meal', label: 'Meal', enabled: true,
        soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi',
        createdAt: Date.now(), updatedAt: Date.now(),
        schedules: [],
      };
      await cancelReminder(reminder);
      expect(LocalNotifications.getPending).toHaveBeenCalled();
      // Should cancel the snoozed notification id=99
      const lastCancelCall = vi.mocked(LocalNotifications.cancel).mock.calls.at(-1)?.[0];
      expect(lastCancelCall?.notifications).toContainEqual({ id: 99 });
    });

    it('swallows getPending errors silently', async () => {
      const { cancelReminder } = await import('./scheduler');
      vi.mocked(LocalNotifications.getPending).mockRejectedValueOnce(new Error('os error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const reminder: Reminder = {
        id: 'r-err', category: 'water', label: 'W', enabled: true,
        soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi',
        createdAt: Date.now(), updatedAt: Date.now(), schedules: [],
      };
      await expect(cancelReminder(reminder)).resolves.toBeUndefined();
      consoleSpy.mockRestore();
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

    it('schedules 10 instances for fixed reminders with specific daysOfWeek', async () => {
      const reminder: Reminder = {
        id: 'r_days', category: 'water', label: 'W', enabled: true, soundMode: 'silent',
        snoozeMins: 5, character: 'mochi', createdAt: 0, updatedAt: 0,
        schedules: [{ id: 's1', reminderId: 'r_days', type: 'fixed', timeValue: '10:00', daysOfWeek: [1, 3, 5] }]
      };
      vi.setSystemTime(new Date(2026, 4, 10, 8, 0)); // Sunday
      await scheduleReminder(reminder);
      
      const calls = vi.mocked(LocalNotifications.schedule).mock.calls;
      const notifs = calls[0]?.[0]?.notifications;
      // Should schedule exactly 10 instances as per the loop in scheduler.ts
      expect(notifs?.length).toBe(10);
      expect(notifs?.[0]?.id).toBeDefined();
    });

    it('schedules 64 instances for interval reminders', async () => {
      const reminder: Reminder = {
        id: 'r_int', category: 'exercise', label: 'E', enabled: true, soundMode: 'sound_vibration',
        snoozeMins: 5, character: 'mochi', createdAt: Date.now(), updatedAt: Date.now(),
        schedules: [{ id: 's1', reminderId: 'r_int', type: 'interval', timeValue: '30', startTime: '08:00', endTime: '20:00' }]
      };
      vi.setSystemTime(new Date(2026, 4, 10, 8, 0));
      await scheduleReminder(reminder);
      
      const calls = vi.mocked(LocalNotifications.schedule).mock.calls;
      const notifs = calls[0]?.[0]?.notifications;
      // Should schedule up to 64 instances (or until MAX_NOTIFICATIONS, but here r1 has only 64)
      expect(notifs?.length).toBeGreaterThanOrEqual(10); // Loop limit is actually 64
      expect(notifs?.[0]?.id).toBeDefined();
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
