import type { CategoryStats } from './statsStore';

/** One day (device-local 'YYYY-MM-DD') on which a category had at least one completion. */
export interface CompletionDay {
  category: Category;
  day: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function localDay(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return localDay(new Date(y, m - 1, d + delta).getTime());
}

/** A streak survives until the end of the day after its last completion. */
export function computeStats(days: CompletionDay[], today: string): Record<string, CategoryStats> {
  const byCategory = new Map<Category, Set<string>>();
  for (const { category, day } of days) {
    if (!byCategory.has(category)) byCategory.set(category, new Set());
    byCategory.get(category)!.add(day);
  }

  const lastWeek = new Set(Array.from({ length: 7 }, (_, i) => shiftDay(today, -i)));
  const stats: Record<string, CategoryStats> = {};

  for (const [category, daySet] of byCategory) {
    const sorted = [...daySet].sort();
    let longest = 0;
    let run = 0;
    sorted.forEach((day, i) => {
      run = i > 0 && shiftDay(sorted[i - 1]!, 1) === day ? run + 1 : 1;
      longest = Math.max(longest, run);
    });

    let current = 0;
    let cursor = daySet.has(today) ? today : shiftDay(today, -1);
    while (daySet.has(cursor)) {
      current++;
      cursor = shiftDay(cursor, -1);
    }

    stats[category] = {
      category,
      currentStreak: current,
      longestStreak: longest,
      lastCompletedDate: sorted[sorted.length - 1] ?? null,
      completionRateLast7Days: sorted.filter((d) => lastWeek.has(d)).length / 7,
    };
  }
  return stats;
}
