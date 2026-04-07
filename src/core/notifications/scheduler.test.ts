import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalNotifications } from '@capacitor/local-notifications';
import { calculateNextFireTime, scheduleReminder, snoozeReminder } from './scheduler';

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn(),
    cancel: vi.fn(),
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

    it('interval: schedules next slot within today window', () => {
      const now = new Date(2026, 4, 10, 8, 30); 
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'interval', timeValue: '60', startTime: '07:00', endTime: '21:00' };
      const result = calculateNextFireTime(schedule);
      expect(result?.getHours()).toBe(9);
    });

    it('interval: pushes tomorrow if now is past end window', () => {
      const now = new Date(2026, 4, 10, 22, 0); 
      vi.setSystemTime(now);
      const schedule: Schedule = { id: '1', reminderId: 'r1', type: 'interval', timeValue: '60', startTime: '07:00', endTime: '21:00' };
      const result = calculateNextFireTime(schedule);
      expect(result?.getDate()).toBe(11);
      expect(result?.getHours()).toBe(7);
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
      const notif = vi.mocked(LocalNotifications.schedule).mock.calls[0][0].notifications[0];
      expect(notif.id).toBe(999);
      expect(notif.title).toBe('categories.water.name');
    });

    it('does not schedule if disabled', async () => {
      const reminder: Reminder = {
        id: 'r1', category: 'water', label: 'Water', enabled: false, soundMode: 'sound_vibration',
        snoozeMins: 5, character: 'mochi', createdAt: Date.now(), updatedAt: Date.now(), schedules: []
      };
      await scheduleReminder(reminder);
      expect(LocalNotifications.schedule).not.toHaveBeenCalled();
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
      const notif = vi.mocked(LocalNotifications.schedule).mock.calls[0][0].notifications[0];
      expect(notif.id).toBe(123);
      expect(notif.extra.isSnoozed).toBe(true);
      expect(notif.schedule.at.getTime()).toBe(now.getTime() + 15 * 60_000);
    });
  });
});
