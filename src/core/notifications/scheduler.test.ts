import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalNotifications } from '@capacitor/local-notifications';
import {
  calculateNextFireTime, upcomingFireTimes, rescheduleAll, snoozeReminder, channelFor, setQuietHours, isInQuietHours,
} from './scheduler';

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    checkExactNotificationSetting: vi.fn().mockResolvedValue({ exact_alarm: 'granted' }),
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
    setQuietHours(null);
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

  const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
    id: 'r1', category: 'water', label: 'W', enabled: true, soundMode: 'sound_vibration',
    snoozeMins: 10, character: 'mochi', createdAt: 0, updatedAt: 0,
    schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '10:00' }],
    ...overrides,
  });

  const scheduled = () => vi.mocked(LocalNotifications.schedule).mock.calls.flatMap((c) => c[0].notifications);

  describe('upcomingFireTimes', () => {
    it('spreads specific-day reminders over distinct, increasing allowed days', () => {
      const reminder = makeReminder({ schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '10:00', daysOfWeek: [1, 3, 5] }] });
      const times = upcomingFireTimes(reminder, new Date(2026, 4, 10, 8, 0), 10); // Sunday
      expect(times).toHaveLength(10);
      times.slice(1).forEach((t, i) => expect(t.getTime()).toBeGreaterThan(times[i]!.getTime()));
      times.forEach((t) => expect([1, 3, 5]).toContain(t.getDay()));
    });

    it('interleaves several daily times across days in order', () => {
      const reminder = makeReminder({ schedules: ['09:00', '12:00', '15:00'].map((timeValue, i) => ({ id: `s${i}`, reminderId: 'r1', type: 'fixed' as const, timeValue })) });
      const times = upcomingFireTimes(reminder, new Date(2026, 4, 10, 10, 0), 6);
      expect(times.map((t) => `${t.getDate()} ${t.getHours()}`)).toEqual(['10 12', '10 15', '11 9', '11 12', '11 15', '12 9']);
    });

    it('keeps interval slots inside the daily window', () => {
      const reminder = makeReminder({ schedules: [{ id: 's1', reminderId: 'r1', type: 'interval', timeValue: '180', startTime: '08:00', endTime: '22:00' }] });
      const times = upcomingFireTimes(reminder, new Date(2026, 4, 10, 7, 0), 12);
      times.forEach((t) => {
        const mins = t.getHours() * 60 + t.getMinutes();
        expect(mins).toBeGreaterThanOrEqual(8 * 60);
        expect(mins).toBeLessThanOrEqual(22 * 60);
      });
      expect(new Set(times.map((t) => t.getDate())).size).toBeGreaterThan(1);
    });

    it('keeps the local wall-clock time across a DST change', () => {
      const previousTz = process.env.TZ;
      process.env.TZ = 'America/New_York'; // DST ends 2026-11-01
      try {
        const times = upcomingFireTimes(makeReminder({ schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '08:00' }] }), new Date(2026, 9, 30, 9, 0), 4);
        expect(times.map((t) => t.getHours())).toEqual([8, 8, 8, 8]);
      } finally {
        process.env.TZ = previousTz;
      }
    });

    it('skips quiet hours except for medicine', () => {
      setQuietHours({ start: '22:00', end: '07:00' });
      const late = [{ id: 's1', reminderId: 'r1', type: 'fixed' as const, timeValue: '23:00' }];
      expect(upcomingFireTimes(makeReminder({ schedules: late }), new Date(2026, 4, 10, 8, 0), 5)).toHaveLength(0);
      expect(upcomingFireTimes(makeReminder({ category: 'medicine', schedules: late }), new Date(2026, 4, 10, 8, 0), 5)).toHaveLength(5);
    });

    it('treats quiet hours that cross midnight as one window', () => {
      const hours = { start: '22:00', end: '07:00' };
      expect(isInQuietHours(new Date(2026, 4, 10, 23, 0), hours)).toBe(true);
      expect(isInQuietHours(new Date(2026, 4, 10, 6, 59), hours)).toBe(true);
      expect(isInQuietHours(new Date(2026, 4, 10, 7, 0), hours)).toBe(false);
    });
  });

  describe('rescheduleAll', () => {
    it('schedules every active reminder in one call with one-shot alarms only', async () => {
      vi.setSystemTime(new Date(2026, 4, 10, 8, 0));
      await rescheduleAll([makeReminder(), makeReminder({ id: 'r2', enabled: false }), makeReminder({ id: 'r3', archived: true })]);
      expect(LocalNotifications.schedule).toHaveBeenCalledOnce();
      const notifs = scheduled();
      expect(notifs.length).toBeGreaterThan(0);
      notifs.forEach((n) => {
        expect(n.extra.reminderId).toBe('r1');
        expect(n.schedule?.repeats).toBeUndefined();
        expect(n.schedule?.at!.getTime()).toBeGreaterThan(Date.now());
      });
    });

    it('cancels old slots but keeps pending snoozes of active reminders', async () => {
      vi.mocked(LocalNotifications.getPending).mockResolvedValueOnce({ notifications: [
        { id: 1, title: '', body: '', extra: { reminderId: 'r1' } },
        { id: 2, title: '', body: '', extra: { reminderId: 'r1', isSnoozed: true } },
        { id: 3, title: '', body: '', extra: { reminderId: 'gone', isSnoozed: true } },
      ] });
      await rescheduleAll([makeReminder()]);
      expect(LocalNotifications.cancel).toHaveBeenCalledWith({ notifications: [{ id: 1 }, { id: 3 }] });
    });

    it('requests inexact alarms when exact alarms are not allowed', async () => {
      vi.mocked(LocalNotifications.checkExactNotificationSetting).mockResolvedValueOnce({ exact_alarm: 'denied' });
      await rescheduleAll([makeReminder()]);
      scheduled().forEach((n) => expect(n.isExactNotification).toBe(false));
    });

    it('does nothing until notifications are allowed', async () => {
      vi.mocked(LocalNotifications.checkPermissions).mockResolvedValueOnce({ display: 'prompt' });
      await rescheduleAll([makeReminder()]);
      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
      expect(LocalNotifications.cancel).not.toHaveBeenCalled();
    });

    it('stays under the shared alarm budget with many reminders', async () => {
      const many = Array.from({ length: 10 }, (_, i) => makeReminder({
        id: `r${i}`,
        schedules: [{ id: 's', reminderId: `r${i}`, type: 'interval', timeValue: '30', startTime: '00:00', endTime: '23:59' }],
      }));
      await rescheduleAll(many);
      expect(scheduled().length).toBeLessThanOrEqual(400);
    });

    it('routes vibration-only reminders to the vibrate channel with the silent sound', async () => {
      await rescheduleAll([makeReminder({ soundMode: 'vibration_only' })]);
      expect(scheduled()[0]?.channelId).toBe('nyanudge_vibrate');
      expect(scheduled()[0]?.sound).toBe('silence');
    });
  });

  describe('snoozeReminder', () => {
    it('schedules a marked one-shot under a per-reminder snooze id', async () => {
      vi.setSystemTime(new Date(2026, 4, 10, 8, 0));
      await snoozeReminder(makeReminder());
      await snoozeReminder(makeReminder({ id: 'r2' }));
      const [first, second] = scheduled();
      expect(first?.extra.isSnoozed).toBe(true);
      expect(first?.schedule?.at!.getTime()).toBe(new Date(2026, 4, 10, 8, 10).getTime());
      expect(first?.id).not.toBe(second?.id);
    });
  });

  describe('sound modes', () => {
    it('routes each sound mode to a channel that carries that behaviour', () => {
      expect(channelFor('meal', 'sound_vibration')).toBe('nyanudge_bell_gentle');
      expect(channelFor('water', 'sound_vibration')).toBe('nyanudge_chime_soft');
      expect(channelFor('medicine', 'sound_vibration')).toBe('nyanudge_medication');
      expect(channelFor('medicine', 'vibration_only')).toBe('nyanudge_vibrate');
      expect(channelFor('water', 'silent')).toBe('nyanudge_silent');
    });
  });
});
