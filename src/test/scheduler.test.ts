import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateNextFireTime } from '../core/notifications/scheduler';

describe('Scheduler Logic: calculateNextFireTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Fixed Type', () => {
    it('schedules for later today if the time has not passed', () => {
      // Current time is 10:00 local
      vi.setSystemTime(new Date(2023, 9, 10, 10, 0, 0));
      
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'fixed', timeValue: '15:30'
      });
      
      expect(fireTime).toBeDefined();
      expect(fireTime?.getHours()).toBe(15);
      expect(fireTime?.getMinutes()).toBe(30);
      expect(fireTime?.getDate()).toBe(10); // Still the 10th
    });

    it('schedules for tomorrow if the time has already passed', () => {
      // Current time is 16:00 local
      vi.setSystemTime(new Date(2023, 9, 10, 16, 0, 0));
      
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'fixed', timeValue: '15:30'
      });
      
      expect(fireTime).toBeDefined();
      expect(fireTime?.getHours()).toBe(15);
      expect(fireTime?.getMinutes()).toBe(30);
      expect(fireTime?.getDate()).toBe(11); // Rolled over to the 11th
    });

    it('respects daysOfWeek and rolls to the next valid day', () => {
      // 2023-10-10 is a Tuesday (Day 2)
      vi.setSystemTime(new Date(2023, 9, 10, 10, 0, 0));
      
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'fixed', timeValue: '15:30',
        // Only run on Thursday (Day 4)
        daysOfWeek: [4]
      });
      
      expect(fireTime).toBeDefined();
      // Should roll over by 2 days
      expect(fireTime?.getDate()).toBe(12);
      expect(fireTime?.getDay()).toBe(4);
    });
  });

  describe('Interval Type', () => {
    it('schedules the next available slot within the window today', () => {
      // Current time is 10:45 local
      vi.setSystemTime(new Date(2023, 9, 10, 10, 45, 0));
      
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'interval', timeValue: '60', // every 60 mins
        startTime: '08:00', endTime: '20:00'
      });
      
      expect(fireTime).toBeDefined();
      // 08:00, 09:00, 10:00, 11:00... since 10:45 has passed, next is 11:00
      expect(fireTime?.getHours()).toBe(11);
      expect(fireTime?.getMinutes()).toBe(0);
      expect(fireTime?.getDate()).toBe(10);
    });

    it('schedules for the start of the window tomorrow if today window has passed', () => {
      // Current time is 21:00 local (past the end time)
      vi.setSystemTime(new Date(2023, 9, 10, 21, 0, 0));
      
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'interval', timeValue: '60',
        startTime: '08:00', endTime: '20:00'
      });
      
      expect(fireTime).toBeDefined();
      // Next day start time
      expect(fireTime?.getHours()).toBe(8);
      expect(fireTime?.getMinutes()).toBe(0);
      expect(fireTime?.getDate()).toBe(11); // Rolling over to the 11th
    });

    it('returns undefined if required fields are missing', () => {
      const fireTime = calculateNextFireTime({
        id: '1', reminderId: 'r1', type: 'interval'
        // Missing timeValue
      });
      expect(fireTime).toBeUndefined();
    });
  });
});
