import { describe, it, expect } from 'vitest';
import { computeStats, localDay, type CompletionDay } from './streaks';

const days = (category: Category, ...list: string[]): CompletionDay[] => list.map((day) => ({ category, day }));

describe('computeStats', () => {
  it('counts consecutive days ending today, ignoring repeat completions on one day', () => {
    const stats = computeStats([...days('water', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-06')], '2026-11-06');
    expect(stats.water!.currentStreak).toBe(3);
    expect(stats.water!.longestStreak).toBe(3);
    expect(stats.water!.lastCompletedDate).toBe('2026-11-06');
  });

  it('keeps the streak alive until the day after the last completion ends', () => {
    expect(computeStats(days('meal', '2026-11-04', '2026-11-05'), '2026-11-06').meal!.currentStreak).toBe(2);
    expect(computeStats(days('meal', '2026-11-04', '2026-11-05'), '2026-11-07').meal!.currentStreak).toBe(0);
  });

  it('remembers the longest past run after a gap', () => {
    const stats = computeStats(days('exercise', '2026-10-01', '2026-10-02', '2026-10-03', '2026-11-06'), '2026-11-06');
    expect(stats.exercise!.currentStreak).toBe(1);
    expect(stats.exercise!.longestStreak).toBe(3);
  });

  it('counts runs across month and DST boundaries', () => {
    const stats = computeStats(days('water', '2026-10-31', '2026-11-01', '2026-11-02'), '2026-11-02');
    expect(stats.water!.currentStreak).toBe(3);
  });

  it('reports the share of the last 7 days with a completion', () => {
    const stats = computeStats(days('medicine', '2026-10-30', '2026-11-01', '2026-11-06'), '2026-11-06');
    expect(stats.medicine!.completionRateLast7Days).toBeCloseTo(2 / 7);
  });

  it('uses the device-local calendar day', () => {
    expect(localDay(new Date(2026, 10, 6, 23, 30).getTime())).toBe('2026-11-06');
  });
});
