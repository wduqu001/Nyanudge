import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { HomeScreen } from '../HomeScreen';
import { useRemindersStore } from '../../../core/store/remindersStore';
import { usePreferencesStore } from '../../../core/store/preferencesStore';
import { useStatsStore } from '../../../core/store/statsStore';
import { calculateNextFireTime, snoozeReminder } from '../../../core/notifications/scheduler';
import { runBackHandler } from '../../../shared/hooks/useBackHandler';

// ── Capacitor & heavy deps mocks ─────────────────────────────────────────────

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
  },
}));

vi.mock('../../../core/notifications/scheduler', () => ({
  rescheduleAll: vi.fn().mockResolvedValue(undefined),
  msSinceLastReschedule: vi.fn(() => Infinity),
  calculateNextFireTime: vi.fn().mockReturnValue(null),
  snoozeReminder: vi.fn().mockResolvedValue(undefined),
}));

// Wrap rather than replace the cats so they still render (and stay covered).
vi.mock('../../../shared/components/AnimatedCatMochi/AnimatedCatMochi', async (importOriginal) => {
  const { AnimatedCatMochi } = await importOriginal<typeof import('../../../shared/components/AnimatedCatMochi/AnimatedCatMochi')>();
  return { AnimatedCatMochi: () => <div data-testid="cat-mochi"><AnimatedCatMochi /></div> };
});
vi.mock('../../../shared/components/KuroCat/AnimatedCatKuro', async (importOriginal) => {
  const { AnimatedCatKuro } = await importOriginal<typeof import('../../../shared/components/KuroCat/AnimatedCatKuro')>();
  return { AnimatedCatKuro: () => <div data-testid="cat-kuro"><AnimatedCatKuro /></div> };
});
vi.mock('../../../shared/components/SoraCat/CatSora', async (importOriginal) => {
  const { CatSora } = await importOriginal<typeof import('../../../shared/components/SoraCat/CatSora')>();
  return { CatSora: () => <div data-testid="cat-sora"><CatSora /></div> };
});
vi.mock('../DebugPanel', () => ({
  DebugPanel: () => <div data-testid="debug-panel" />,
}));
vi.mock('../../../shared/components/BottomNav/BottomNav', () => ({
  BottomNav: () => <nav data-testid="bottom-nav" />,
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

// ── Shared reminder fixture ───────────────────────────────────────────────────

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'r1',
  category: 'water',
  label: 'Drink Water',
  enabled: true,
  archived: false,
  soundMode: 'sound_vibration',
  snoozeMins: 10,
  character: 'mochi',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '08:00' }],
  ...overrides,
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

// ── Reset stores before each test ─────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  navigateMock.mockReset();
  vi.mocked(calculateNextFireTime).mockReturnValue(undefined);
  useRemindersStore.setState({
    reminders: [],
    isLoaded: true,
    pendingNotifAction: null,
  });
  usePreferencesStore.setState({
    preferences: {
      defaultSoundMode: 'sound_vibration',
      notificationStyle: 'standard',
      dndStart: '22:00',
      dndEnd: '07:00',
      theme: 'system',
      character: 'mochi',
      language: 'en',
      defaultSnoozeMins: 10,
      markAsDoneOnOpen: false,
      isOnboardingComplete: false,
    },
    isLoaded: true,
  });
  useStatsStore.setState({ stats: {}, recentCompletions: [], isLoaded: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('HomeScreen', () => {
  // ── Basic render ──────────────────────────────────────────────────────────

  it('renders "No active reminders" hero copy when store is empty', () => {
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText(/no active reminders/i)).toBeInTheDocument();
  });

  it('renders the character selected in preferences', () => {
    usePreferencesStore.setState({ preferences: { ...usePreferencesStore.getState().preferences, character: 'kuro' } });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByTestId('cat-kuro')).toBeInTheDocument();
  });

  it('shows next upcoming reminder if one is enabled', () => {
    vi.useFakeTimers();
    const mockDate = new Date(2023, 9, 10, 10, 0, 0);
    vi.setSystemTime(mockDate);
    vi.mocked(calculateNextFireTime).mockReturnValue(new Date(mockDate.getTime() + 30 * 60_000));
    useRemindersStore.setState({
      reminders: [makeReminder({ label: 'Drink!', createdAt: 0, updatedAt: 0, schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '10:30' }] })],
      isLoaded: true,
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText('Next up in 30 minutes')).toBeInTheDocument();
    expect(screen.getAllByText('Drink!').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the list of active (non-archived) reminders', () => {
    useRemindersStore.setState({
      reminders: [
        makeReminder({ id: 'r1', label: 'R1', schedules: [] }),
        makeReminder({ id: 'r2', category: 'meal', label: 'R2', enabled: false, archived: true, schedules: [] }),
        makeReminder({ id: 'r3', category: 'exercise', label: 'R3', schedules: [] }),
      ],
      isLoaded: true,
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText('R1')).toBeInTheDocument();
    expect(screen.queryByText('R2')).not.toBeInTheDocument(); // archived
    expect(screen.getByText('R3')).toBeInTheDocument();
  });

  it('toggles reminder when toggle button is clicked', () => {
    const toggleReminder = vi.fn();
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true, toggleReminder } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    fireEvent.click(screen.getByRole('switch'));
    expect(toggleReminder).toHaveBeenCalledWith('r1');
  });

  it('shows streak banner with the current (not longest) streak when maxStreak > 0', () => {
    useStatsStore.setState({
      stats: { water: { category: 'water', currentStreak: 5, longestStreak: 10, lastCompletedDate: '2023-10-09', completionRateLast7Days: 1 } },
      recentCompletions: [],
      isLoaded: true,
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText('5 done — keep going!')).toBeInTheDocument();
  });

  it('does not show streak banner when maxStreak is 0', () => {
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.queryByText(/done — keep going/i)).not.toBeInTheDocument();
  });

  // ── Card expand/collapse ──────────────────────────────────────────────────

  it('expands a reminder card on click to show quick actions', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<Wrapper><HomeScreen /></Wrapper>);
    // Click the card container — use the h3 text to locate it then walk up to the card
    fireEvent.click(screen.getByText('Drink Water').closest('[class]')!);
    expect(screen.getByText(/edit settings/i)).toBeInTheDocument();
  });

  it('collapses the card on a second click', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<Wrapper><HomeScreen /></Wrapper>);
    const label = screen.getByText('Drink Water').closest('[class]')!;
    fireEvent.click(label); // expand
    fireEvent.click(label); // collapse
    expect(screen.queryByText(/edit settings/i)).not.toBeInTheDocument();
  });

  // ── Quick actions ─────────────────────────────────────────────────────────

  it('"Done" quick action calls completeReminder', () => {
    const completeReminder = vi.fn();
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true, completeReminder } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    fireEvent.click(screen.getByText('Drink Water').closest('[class]')!);
    fireEvent.click(screen.getByRole('button', { name: /^done$/i }));
    expect(completeReminder).toHaveBeenCalledWith('r1');
  });

  it('"Edit Settings" navigates to /reminder/:id', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<Wrapper><HomeScreen /></Wrapper>);
    fireEvent.click(screen.getByText('Drink Water').closest('[class]')!);
    fireEvent.click(screen.getByRole('button', { name: /edit settings/i }));
    expect(navigateMock).toHaveBeenCalledWith('/reminder/r1');
  });

  // ── Notification action sheet ─────────────────────────────────────────────

  it('renders the notification action sheet when pendingNotifAction is set', () => {
    useRemindersStore.setState({
      reminders: [makeReminder({ label: 'R1' })],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' },
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText('Drink Water')).toBeInTheDocument();
    expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('closes notification action sheet on backdrop click', () => {
    const setPendingNotifAction = vi.fn();
    useRemindersStore.setState({
      reminders: [makeReminder()],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Action', category: 'water' },
      setPendingNotifAction,
    } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    fireEvent.click(screen.getByRole('dialog').previousElementSibling!);
    expect(setPendingNotifAction).toHaveBeenCalledWith(null);
  });

  it('dismisses sheet when "Cancel" is clicked', () => {
    const setPendingNotifAction = vi.fn();
    useRemindersStore.setState({
      reminders: [makeReminder()],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' },
      setPendingNotifAction,
    } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(setPendingNotifAction).toHaveBeenCalledWith(null);
  });

  it('"Done" in action sheet calls completeReminder and clears action', () => {
    const completeReminder = vi.fn();
    const setPendingNotifAction = vi.fn();
    useRemindersStore.setState({
      reminders: [makeReminder()],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' },
      completeReminder,
      setPendingNotifAction,
    } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    // The sheet "Done" button has the check-mark prefix
    const doneButtons = screen.getAllByText(/done/i);
    // Last one is in the action sheet
    fireEvent.click(doneButtons[doneButtons.length - 1]!);
    expect(completeReminder).toHaveBeenCalledWith('r1');
    expect(setPendingNotifAction).toHaveBeenCalledWith(null);
  });

  it('snooze in the action sheet snoozes that reminder and closes the sheet', () => {
    const setPendingNotifAction = vi.fn();
    useRemindersStore.setState({
      reminders: [makeReminder()],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' },
      setPendingNotifAction,
    } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    fireEvent.click(screen.getByText(new RegExp(i18n.t('home.notif_next_time'), 'i')));
    expect(snoozeReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
    expect(setPendingNotifAction).toHaveBeenCalledWith(null);
  });

  it('Android back closes the action sheet before anything else', () => {
    const setPendingNotifAction = vi.fn();
    useRemindersStore.setState({
      reminders: [makeReminder()],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' },
      setPendingNotifAction,
    } as any);
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(runBackHandler()).toBe(true);
    expect(setPendingNotifAction).toHaveBeenCalledWith(null);
  });

  // ── formatSchedule label ──────────────────────────────────────────────────

  it('shows "Disabled" schedule label for a disabled reminder', () => {
    useRemindersStore.setState({
      reminders: [makeReminder({ enabled: false })],
      isLoaded: true,
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText(/disabled/i)).toBeInTheDocument();
  });

  it('shows interval schedule label for interval-type reminders', () => {
    useRemindersStore.setState({
      reminders: [makeReminder({
        schedules: [{ id: 's1', reminderId: 'r1', type: 'interval', timeValue: '60', startTime: '07:00', endTime: '21:00' }],
      })],
      isLoaded: true,
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText(/every/i)).toBeInTheDocument();
  });
});
