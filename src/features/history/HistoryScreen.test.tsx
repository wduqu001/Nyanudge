import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HistoryScreen } from './HistoryScreen';
import { useStatsStore } from '../../core/store/statsStore';
import { useRemindersStore } from '../../core/store/remindersStore';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../core/notifications/scheduler', () => ({
  scheduleReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../../core/db/ReminderService', () => ({
  ReminderService: {
    addReminder: vi.fn().mockResolvedValue(undefined),
    updateReminder: vi.fn().mockResolvedValue(undefined),
    deleteReminder: vi.fn().mockResolvedValue(undefined),
    addCompletion: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
    i18n: { language: 'en' }
  })
}));

// HeatmapCalendar depends on the real date; stub it to keep tests deterministic
vi.mock('./components/HeatmapCalendar', () => ({
  HeatmapCalendar: ({ completions }: { completions: unknown[] }) => (
    <div data-testid="heatmap">{completions.length} days</div>
  )
}));

vi.mock('./components/StatsCard', () => ({
  StatsCard: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid={`stats-card-${label}`}>{label}: {value}</div>
  )
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const renderHistory = () =>
  render(
    <MemoryRouter>
      <HistoryScreen />
    </MemoryRouter>
  );

const makeCompletion = (overrides?: Partial<{ id: string; reminderId: string; category: Category; completedAt: number }>) => ({
  id: 'c1',
  reminderId: 'r1',
  category: 'water' as Category,
  completedAt: new Date('2023-10-10T10:00:00Z').getTime(),
  wasSkipped: false,
  ...overrides
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('HistoryScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStatsStore.setState({ stats: {}, recentCompletions: [], isLoaded: true });
    useRemindersStore.setState({ reminders: [], isLoaded: true, pendingNotifAction: null });
  });

  // ── Rendering ──────────────────────────────────────────────────────────

  it('renders the page title', () => {
    renderHistory();
    expect(screen.getByText('history.title')).toBeInTheDocument();
  });

  it('renders the heatmap', () => {
    renderHistory();
    expect(screen.getByTestId('heatmap')).toBeInTheDocument();
  });

  // ── Stats aggregation (bug-prone area) ────────────────────────────────

  it('shows totalCompletions equal to the length of recentCompletions', () => {
    useStatsStore.setState({
      recentCompletions: [makeCompletion({ id: 'c1' }), makeCompletion({ id: 'c2' })]
    });

    renderHistory();

    // The StatsCard for total completions should show "2"
    expect(screen.getByText(/history.total_completions.*2|2.*history.total_completions/i)).toBeInTheDocument();
  });

  it('shows totalStreaks as the sum of all category currentStreaks', () => {
    useStatsStore.setState({
      stats: {
        water: { category: 'water', currentStreak: 3, longestStreak: 5, lastCompletedDate: null, completionRateLast7Days: 0 },
        meal: { category: 'meal', currentStreak: 2, longestStreak: 2, lastCompletedDate: null, completionRateLast7Days: 0 }
      }
    });

    renderHistory();

    // totalStreaks = 3 + 2 = 5
    expect(screen.getByTestId('stats-card-history.current_streak')).toHaveTextContent('5');
  });

  it('shows bestStreak as the max longestStreak across all categories', () => {
    useStatsStore.setState({
      stats: {
        water: { category: 'water', currentStreak: 1, longestStreak: 7, lastCompletedDate: null, completionRateLast7Days: 0 },
        exercise: { category: 'exercise', currentStreak: 2, longestStreak: 14, lastCompletedDate: null, completionRateLast7Days: 0 }
      }
    });

    renderHistory();

    expect(screen.getByTestId('stats-card-history.streak_record')).toHaveTextContent('14');
  });

  it('shows zeroes when store is empty', () => {
    renderHistory();

    expect(screen.getByTestId('stats-card-history.current_streak')).toHaveTextContent('0');
    expect(screen.getByTestId('stats-card-history.streak_record')).toHaveTextContent('0');
    expect(screen.getByTestId('stats-card-history.total_completions')).toHaveTextContent('0');
  });

  // ── Empty state ────────────────────────────────────────────────────────

  it('shows the empty state message when there are no recent completions', () => {
    useStatsStore.setState({ recentCompletions: [] });
    renderHistory();

    expect(screen.getByText('history.no_data')).toBeInTheDocument();
  });

  it('does not show the empty state when there are completions', () => {
    useStatsStore.setState({
      recentCompletions: [makeCompletion()]
    });
    renderHistory();

    expect(screen.queryByText('history.no_data')).not.toBeInTheDocument();
  });

  // ── Recent completions list ────────────────────────────────────────────

  it('renders at most 10 recent completion log items', () => {
    const completions = Array.from({ length: 15 }, (_, i) =>
      makeCompletion({ id: `c${i}`, completedAt: new Date('2023-10-10T10:00:00Z').getTime() + i })
    );
    useStatsStore.setState({ recentCompletions: completions });

    renderHistory();

    // Each log item shows the category; we have 15 completions but only 10 should render
    const categoryLabels = screen.getAllByText('categories.water.name');
    expect(categoryLabels.length).toBeLessThanOrEqual(10);
  });

  it('renders the reminder label when the reminder is found', () => {
    const reminder: Reminder = {
      id: 'r1',
      category: 'water',
      label: 'Custom Water Label',
      enabled: true,
      soundMode: 'sound_vibration',
      snoozeMins: 10,
      character: 'mochi',
      schedules: [],
      createdAt: 1000,
      updatedAt: 1000
    };

    useRemindersStore.setState({ reminders: [reminder] });
    useStatsStore.setState({
      recentCompletions: [makeCompletion({ reminderId: 'r1' })]
    });

    renderHistory();

    expect(screen.getByText('Custom Water Label')).toBeInTheDocument();
  });

  it('falls back to category key when reminder is not found', () => {
    useRemindersStore.setState({ reminders: [] });
    useStatsStore.setState({
      recentCompletions: [makeCompletion({ reminderId: 'unknown' })]
    });

    renderHistory();

    // When reminder is not found, label falls back to log.category ('water')
    expect(screen.getByText('water')).toBeInTheDocument();
  });

  // ── Per-category stats section ─────────────────────────────────────────

  it('renders the per-category stats section when stats exist', () => {
    useStatsStore.setState({
      stats: {
        water: { category: 'water', currentStreak: 3, longestStreak: 5, lastCompletedDate: null, completionRateLast7Days: 0.75 }
      }
    });

    renderHistory();

    expect(screen.getByText('categories.water.name')).toBeInTheDocument();
    expect(screen.getByText('3d')).toBeInTheDocument(); // currentStreak display
  });

  it('renders an empty category list when stats is empty', () => {
    useStatsStore.setState({ stats: {} });
    renderHistory();

    // The section header still renders but no category cards
    expect(screen.getByText('history.category_stats_title')).toBeInTheDocument();
    expect(screen.queryByText(/d$/)).not.toBeInTheDocument(); // no "Xd" streak labels
  });
});
