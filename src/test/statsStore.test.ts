import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStatsStore } from '../core/store/statsStore';

describe('StatsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
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

  it('initially has empty stats and is not loaded', () => {
    const { stats, recentCompletions, isLoaded } = useStatsStore.getState();
    expect(stats).toEqual({});
    expect(recentCompletions).toEqual([]);
    expect(isLoaded).toBe(false);
  });

  it('setStats sets the stats and marks as loaded', () => {
    const mockStats = {
      water: { category: 'water' as const, currentStreak: 5, longestStreak: 10, lastCompletedDate: '2023-10-01', completionRateLast7Days: 0.8 }
    };
    useStatsStore.getState().setStats(mockStats);
    
    expect(useStatsStore.getState().stats).toEqual(mockStats);
    expect(useStatsStore.getState().isLoaded).toBe(true);
  });

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
    
    // Call again on the same day
    vi.setSystemTime(new Date('2023-10-05T15:00:00Z'));
    useStatsStore.getState().incrementStreak('water');
    
    const { stats } = useStatsStore.getState();
    expect(stats['water']!.currentStreak).toBe(1);
  });

  it('incrementStreak increments across multiple days', () => {
    // Day 1
    vi.setSystemTime(new Date('2023-10-05T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');
    
    // Day 2
    vi.setSystemTime(new Date('2023-10-06T12:00:00Z'));
    useStatsStore.getState().incrementStreak('water');
    
    const { stats } = useStatsStore.getState();
    expect(stats['water']!.currentStreak).toBe(2);
    expect(stats['water']!.longestStreak).toBe(2);
    expect(stats['water']!.lastCompletedDate).toBe('2023-10-06');
  });

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
    expect(stats['water']!.longestStreak).toBe(10); // Should be preserved
    expect(stats['water']!.lastCompletedDate).toBe('2023-10-05'); // Should be preserved
  });

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

    // Add 250 more
    for (let i = 0; i < 250; i++) {
      useStatsStore.getState().addCompletion({ ...entry, id: String(i) });
    }

    // Should only keep 200
    expect(useStatsStore.getState().recentCompletions.length).toBe(200);
    // The most recently added (id '249') should be at the front
    expect(useStatsStore.getState().recentCompletions[0]!.id).toBe('249');
  });
});
