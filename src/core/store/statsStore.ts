import { create } from 'zustand';


export interface CategoryStats {
  category: Category;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // 'YYYY-MM-DD'
  completionRateLast7Days: number;  // 0.0 – 1.0
}

export interface CompletionEntry {
  id: string;
  reminderId: string;
  category: Category;
  completedAt: number; // Unix timestamp ms
  wasSkipped: boolean;
}

type StatsMap = Record<string, CategoryStats>;

interface StatsState {
  stats: StatsMap;
  recentCompletions: CompletionEntry[];
  isLoaded: boolean;

  setStats: (stats: StatsMap) => void;
  updateCategoryStats: (category: Category, changes: Partial<CategoryStats>) => void;
  addCompletion: (entry: CompletionEntry) => void;
  setRecentCompletions: (completions: CompletionEntry[]) => void;
  incrementStreak: (category: Category) => void;
  resetStreak: (category: Category) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  stats: {},
  recentCompletions: [],
  isLoaded: false,

  setStats: (stats) => set({ stats, isLoaded: true }),

  updateCategoryStats: (category, changes) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [category]: {
          ...(state.stats[category] ?? {
            category,
            currentStreak: 0,
            longestStreak: 0,
            lastCompletedDate: null,
            completionRateLast7Days: 0,
          }),
          ...changes,
        },
      },
    })),

  addCompletion: (entry) =>
    set((state) => ({
      recentCompletions: [entry, ...state.recentCompletions].slice(0, 200),
    })),

  setRecentCompletions: (completions) => set({ recentCompletions: completions }),

  incrementStreak: (category) => {
    const today = new Date().toISOString().slice(0, 10);
    const current = get().stats[category];

    const newStreak = (current?.currentStreak ?? 0) + 1;
    const newLongest = Math.max(newStreak, current?.longestStreak ?? 0);

    set((state) => ({
      stats: {
        ...state.stats,
        [category]: {
          ...current,
          category,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastCompletedDate: today,
          completionRateLast7Days: current?.completionRateLast7Days ?? 0,
        },
      },
    }));
  },

  resetStreak: (category) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [category]: {
          ...(state.stats[category] ?? {
            category,
            longestStreak: 0,
            lastCompletedDate: null,
            completionRateLast7Days: 0,
          }),
          currentStreak: 0,
        },
      },
    })),

  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));
