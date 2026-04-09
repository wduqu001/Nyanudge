import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStatsStore } from '../core/store/statsStore';

describe('StatsStore', () => {
  beforeEach(() => {
    useStatsStore.setState({
      stats: {},
      recentCompletions: [],
      isLoaded: false
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  it('initially has empty stats and is not loaded', () => {
    const { stats, recentCompletions, isLoaded } = useStatsStore.getState();
    expect(stats).toEqual({});
    expect(recentCompletions).toEqual([]);
    expect(isLoaded).toBe(false);
  });

  // ── setStats ───────────────────────────────────────────────────────────────

  it('setStats sets the stats and marks as loaded', () => {
    const mockStats = {
      water: {
        category: 'water' as const,
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: '2023-10-01',
        completionRateLast7Days: 0.8
      }
    };
    useStatsStore.getState().setStats(mockStats);

    expect(useStatsStore.getState().stats).toEqual(mockStats);
    expect(useStatsStore.getState().isLoaded).toBe(true);
  });

  it('setStats overwrites the previous stats entirely', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 3,
          longestStreak: 5,
          lastCompletedDate: '2023-01-01',
          completionRateLast7Days: 0.5
        }
      }
    });

    const newStats = {
      meal: {
        category: 'meal' as const,
        currentStreak: 1,
        longestStreak: 2,
        lastCompletedDate: '2023-10-01',
        completionRateLast7Days: 0.7
      }
    };
    useStatsStore.getState().setStats(newStats);

    expect(useStatsStore.getState().stats).toEqual(newStats);
    expect(useStatsStore.getState().stats['water']).toBeUndefined();
  });

  // ── setLoaded ──────────────────────────────────────────────────────────────

  it('setLoaded updates the isLoaded flag', () => {
    useStatsStore.getState().setLoaded(true);
    expect(useStatsStore.getState().isLoaded).toBe(true);

    useStatsStore.getState().setLoaded(false);
    expect(useStatsStore.getState().isLoaded).toBe(false);
  });

  // ── updateCategoryStats ────────────────────────────────────────────────────

  it('updateCategoryStats creates a new entry if category is missing', () => {
    useStatsStore.getState().updateCategoryStats('exercise', {
      completionRateLast7Days: 0.6
    });

    const stats = useStatsStore.getState().stats;
    expect(stats['exercise']).toBeDefined();
    expect(stats['exercise']!.completionRateLast7Days).toBe(0.6);
    expect(stats['exercise']!.currentStreak).toBe(0);
    expect(stats['exercise']!.longestStreak).toBe(0);
    expect(stats['exercise']!.lastCompletedDate).toBeNull();
  });

  it('updateCategoryStats merges partial changes without losing existing data', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 5,
          longestStreak: 10,
          lastCompletedDate: '2023-10-05',
          completionRateLast7Days: 0.8
        }
      }
    });

    useStatsStore.getState().updateCategoryStats('water', { completionRateLast7Days: 0.57 });

    const stats = useStatsStore.getState().stats;
    expect(stats['water']!.completionRateLast7Days).toBe(0.57);
    expect(stats['water']!.currentStreak).toBe(5);   // unchanged
    expect(stats['water']!.longestStreak).toBe(10);  // unchanged
  });

  it('updateCategoryStats does not affect other categories', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 3,
          longestStreak: 5,
          lastCompletedDate: '2023-10-05',
          completionRateLast7Days: 0.8
        },
        meal: {
          category: 'meal',
          currentStreak: 1,
          longestStreak: 2,
          lastCompletedDate: '2023-10-05',
          completionRateLast7Days: 0.5
        }
      }
    });

    useStatsStore.getState().updateCategoryStats('water', { currentStreak: 10 });

    expect(useStatsStore.getState().stats['meal']!.currentStreak).toBe(1);
  });

  // ── incrementStreak ────────────────────────────────────────────────────────

  it('incrementStreak increments streak for a new category', () => {
    vi.setSystemTime(new Date('2023-10-05T12:00:00Z'));

    useStatsStore.getState().incrementStreak('water');
    const { stats } = useStatsStore.getState();

    expect(stats['water']).toBeDefined();
    expect(stats['water']!.currentStreak).toBe(1);
    expect(stats['water']!.longestStreak).toBe(1);
    expect(stats['water']!.lastCompletedDate).toBe('2023-10-05');
  });

  it('incrementStreak does not increment again on the same day', () => {
    vi.setSystemTime(new Date('2023-10-05T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    vi.setSystemTime(new Date('2023-10-05T23:59:00Z'));
    useStatsStore.getState().incrementStreak('water');

    expect(useStatsStore.getState().stats['water']!.currentStreak).toBe(1);
  });

  it('incrementStreak increments across multiple days', () => {
    vi.setSystemTime(new Date('2023-10-05T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    vi.setSystemTime(new Date('2023-10-06T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    const { stats } = useStatsStore.getState();
    expect(stats['water']!.currentStreak).toBe(2);
    expect(stats['water']!.longestStreak).toBe(2);
    expect(stats['water']!.lastCompletedDate).toBe('2023-10-06');
  });

  it('incrementStreak updates longestStreak when currentStreak exceeds it', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 9,
          longestStreak: 9,
          lastCompletedDate: '2023-10-04',
          completionRateLast7Days: 1
        }
      }
    });

    vi.setSystemTime(new Date('2023-10-05T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    const stats = useStatsStore.getState().stats;
    expect(stats['water']!.currentStreak).toBe(10);
    expect(stats['water']!.longestStreak).toBe(10);
  });

  it('incrementStreak does not lower longestStreak when new streak is smaller', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 0,  // just reset
          longestStreak: 15,
          lastCompletedDate: '2023-09-01',
          completionRateLast7Days: 0
        }
      }
    });

    vi.setSystemTime(new Date('2023-10-05T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    const stats = useStatsStore.getState().stats;
    expect(stats['water']!.currentStreak).toBe(1);
    expect(stats['water']!.longestStreak).toBe(15); // must stay at 15
  });

  it('incrementStreak tracks separate categories independently', () => {
    vi.setSystemTime(new Date('2023-10-05T08:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    vi.setSystemTime(new Date('2023-10-05T09:00:00Z'));
    useStatsStore.getState().incrementStreak('meal');

    const { stats } = useStatsStore.getState();
    expect(stats['water']!.currentStreak).toBe(1);
    expect(stats['meal']!.currentStreak).toBe(1);

    vi.setSystemTime(new Date('2023-10-06T08:00:00Z'));
    useStatsStore.getState().incrementStreak('water');

    expect(useStatsStore.getState().stats['water']!.currentStreak).toBe(2);
    expect(useStatsStore.getState().stats['meal']!.currentStreak).toBe(1); // unchanged
  });

  // ── resetStreak ────────────────────────────────────────────────────────────

  it('resetStreak resets the current streak but keeps the longest streak', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 5,
          longestStreak: 10,
          lastCompletedDate: '2023-10-05',
          completionRateLast7Days: 0.8
        }
      }
    });

    useStatsStore.getState().resetStreak('water');
    const { stats } = useStatsStore.getState();

    expect(stats['water']!.currentStreak).toBe(0);
    expect(stats['water']!.longestStreak).toBe(10);       // preserved
    expect(stats['water']!.lastCompletedDate).toBe('2023-10-05'); // preserved
  });

  it('resetStreak on a non-existent category creates it with zero streak', () => {
    useStatsStore.getState().resetStreak('exercise');

    const { stats } = useStatsStore.getState();
    expect(stats['exercise']).toBeDefined();
    expect(stats['exercise']!.currentStreak).toBe(0);
  });

  it('resetStreak does not affect other categories', () => {
    useStatsStore.setState({
      stats: {
        water: {
          category: 'water',
          currentStreak: 5,
          longestStreak: 10,
          lastCompletedDate: '2023-10-05',
          completionRateLast7Days: 0.8
        },
        meal: {
          category: 'meal',
          currentStreak: 3,
          longestStreak: 3,
          lastCompletedDate: '2023-10-05',
          completionRateLast7Days: 0.5
        }
      }
    });

    useStatsStore.getState().resetStreak('water');

    expect(useStatsStore.getState().stats['meal']!.currentStreak).toBe(3); // untouched
  });

  // ── addCompletion ──────────────────────────────────────────────────────────

  it('addCompletion adds to recentCompletions and keeps up to 200 entries', () => {
    const entry = {
      id: 'abc',
      reminderId: 'def',
      category: 'water' as const,
      completedAt: Date.now(),
      wasSkipped: false
    };

    useStatsStore.getState().addCompletion(entry);
    expect(useStatsStore.getState().recentCompletions).toEqual([entry]);

    for (let i = 0; i < 250; i++) {
      useStatsStore.getState().addCompletion({ ...entry, id: String(i) });
    }

    expect(useStatsStore.getState().recentCompletions.length).toBe(200);
    expect(useStatsStore.getState().recentCompletions[0]!.id).toBe('249');
  });

  it('addCompletion prepends the newest entry to the front', () => {
    const first = { id: 'first', reminderId: 'r1', category: 'water' as const, completedAt: 1000, wasSkipped: false };
    const second = { id: 'second', reminderId: 'r1', category: 'water' as const, completedAt: 2000, wasSkipped: false };

    useStatsStore.getState().addCompletion(first);
    useStatsStore.getState().addCompletion(second);

    const completions = useStatsStore.getState().recentCompletions;
    expect(completions[0]!.id).toBe('second');
    expect(completions[1]!.id).toBe('first');
  });

  // ── setRecentCompletions ───────────────────────────────────────────────────

  it('setRecentCompletions replaces the completions list entirely', () => {
    const existing = { id: 'old', reminderId: 'r1', category: 'water' as const, completedAt: 100, wasSkipped: false };
    useStatsStore.setState({ recentCompletions: [existing] });

    const newEntries = [
      { id: 'new1', reminderId: 'r2', category: 'meal' as const, completedAt: 200, wasSkipped: false },
      { id: 'new2', reminderId: 'r3', category: 'exercise' as const, completedAt: 300, wasSkipped: true },
    ];
    useStatsStore.getState().setRecentCompletions(newEntries);

    const completions = useStatsStore.getState().recentCompletions;
    expect(completions).toEqual(newEntries);
    expect(completions.find(c => c.id === 'old')).toBeUndefined();
  });

  it('setRecentCompletions with an empty array clears all completions', () => {
    useStatsStore.setState({
      recentCompletions: [
        { id: 'a', reminderId: 'r1', category: 'water' as const, completedAt: 100, wasSkipped: false }
      ]
    });

    useStatsStore.getState().setRecentCompletions([]);
    expect(useStatsStore.getState().recentCompletions).toEqual([]);
  });
});
