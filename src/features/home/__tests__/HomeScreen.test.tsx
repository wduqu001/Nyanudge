import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { HomeScreen } from '../HomeScreen';
import { useRemindersStore } from '../../../core/store/remindersStore';
import { usePreferencesStore } from '../../../core/store/preferencesStore';
import { useStatsStore } from '../../../core/store/statsStore';

// ── Capacitor & heavy deps mocks ─────────────────────────────────────────────

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
    cancel: vi.fn().mockResolvedValue(undefined),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
  },
}));

vi.mock('../../../core/notifications/scheduler', () => ({
  calculateNextFireTime: vi.fn().mockReturnValue(null),
  snoozeReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn().mockResolvedValue(undefined),
  scheduleReminder: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../shared/components/AnimatedCatMochi/AnimatedCatMochi', () => ({
  AnimatedCatMochi: () => <div data-testid="cat-mochi" />,
}));
vi.mock('../../shared/components/KuroCat/AnimatedCatKuro', () => ({
  AnimatedCatKuro: () => <div data-testid="cat-kuro" />,
}));
vi.mock('../../shared/components/SoraCat/CatSora', () => ({
  CatSora: () => <div data-testid="cat-sora" />,
}));
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

describe('HomeScreen', () => {
  // ── Basic render ──────────────────────────────────────────────────────────

  it('renders "No active reminders" hero copy when store is empty', () => {
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText(/no active reminders/i)).toBeInTheDocument();
  });

  it('renders the reminder card label when reminders exist', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText('Drink Water')).toBeInTheDocument();
  });

  it('shows streak banner when maxStreak > 0', () => {
    useStatsStore.setState({
      stats: { water: { category: 'water', currentStreak: 3, longestStreak: 3, lastCompletedDate: null, completionRateLast7Days: 0 } },
      recentCompletions: [],
      isLoaded: true,
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText(/done — keep going/i)).toBeInTheDocument();
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
      reminders: [makeReminder()],
      isLoaded: true,
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' },
    });
    render(<Wrapper><HomeScreen /></Wrapper>);
    expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
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
