import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeScreen } from '../features/home/HomeScreen';
import { useRemindersStore } from '../core/store/remindersStore';
import { usePreferencesStore } from '../core/store/preferencesStore';
import { useStatsStore } from '../core/store/statsStore';
import { calculateNextFireTime } from '../core/notifications/scheduler';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../core/notifications/scheduler', () => ({
  calculateNextFireTime: vi.fn(),
  snoozeReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn().mockResolvedValue(undefined),
  scheduleReminder: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    schedule: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, secondArg?: any, thirdArg?: any) => {
      const options = typeof secondArg === 'object' ? secondArg : thirdArg;
      if (options?.count !== undefined) return `${key}:${options.count}`;
      if (options?.time !== undefined) return `${key}:${options.time}`;
      return key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() }
  })
}));

// Mock shared components to keep tests focused on HomeScreen logic
vi.mock('../shared/components/Card/Card', () => ({
  Card: ({ children, onClick, 'aria-label': ariaLabel }: any) => (
    <div data-testid="card" onClick={onClick} aria-label={ariaLabel}>
      {children}
    </div>
  )
}));

vi.mock('../shared/components/Toggle/Toggle', () => ({
  Toggle: ({ checked, onChange }: any) => (
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked, e)} />
  )
}));

// Mock Lottie components or other heavy animations
vi.mock('../shared/components/AnimatedCatMochi/AnimatedCatMochi', () => ({
  AnimatedCatMochi: () => <div data-testid="cat-mochi">Mochi</div>
}));
vi.mock('../shared/components/KuroCat/AnimatedCatKuro', () => ({
  AnimatedCatKuro: () => <div data-testid="cat-kuro">Kuro</div>
}));
vi.mock('../shared/components/SoraCat/CatSora', () => ({
  CatSora: () => <div data-testid="cat-sora">Sora</div>
}));

// Mock Icons
vi.mock('../shared/components/Icons', () => ({
  CogIcon: () => <span>Cog</span>,
  MenuIcon: () => <span>Menu</span>,
  WaterIcon: () => <span>Water</span>,
  MealIcon: () => <span>Meal</span>,
  ExerciseIcon: () => <span>Exercise</span>,
  BathroomIcon: () => <span>Bathroom</span>,
  MedicineIcon: () => <span>Medicine</span>,
}));

// Mock Nav
vi.mock('../shared/components/BottomNav/BottomNav', () => ({
  BottomNav: () => <nav>BottomNav</nav>
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomeScreen />
    </MemoryRouter>
  );

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePreferencesStore.setState({
      preferences: {
        theme: 'system',
        character: 'mochi',
        language: 'en',
        isOnboardingComplete: true,
        defaultSoundMode: 'sound_vibration',
        notificationStyle: 'standard',
        dndStart: '22:00',
        dndEnd: '07:00',
        defaultSnoozeMins: 10,
        markAsDoneOnOpen: false,
      },
      isLoaded: true
    });
    useRemindersStore.setState({
      reminders: [],
      isLoaded: true,
      pendingNotifAction: null
    });
    useStatsStore.setState({ stats: {}, recentCompletions: [], isLoaded: true });
    
    vi.useFakeTimers();
  });

  it('renders the character selected in preferences', () => {
    usePreferencesStore.setState({ preferences: { ...usePreferencesStore.getState().preferences, character: 'kuro' } });
    renderHome();
    expect(screen.getByTestId('cat-kuro')).toBeInTheDocument();
  });

  it('shows next upcoming reminder if one is enabled', () => {
    const mockDate = new Date(2023, 9, 10, 10, 0, 0);
    vi.setSystemTime(mockDate);
    
    const nextDate = new Date(mockDate.getTime() + 30 * 60_000); // in 30 mins
    vi.mocked(calculateNextFireTime).mockReturnValue(nextDate);

    const reminder: Reminder = {
      id: 'r1', category: 'water', label: 'Drink!', enabled: true, soundMode: 'sound_vibration',
      snoozeMins: 10, character: 'mochi', schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed', timeValue: '10:30' }],
      createdAt: 0, updatedAt: 0
    };
    useRemindersStore.setState({ reminders: [reminder] });

    renderHome();
    expect(screen.getByText(/home\.next_up.*30.*edit_reminder\.minutes/)).toBeInTheDocument();
    expect(screen.getAllByText('Drink!').length).toBeGreaterThanOrEqual(1);
  });

  it('shows no reminders message if none are active', () => {
    renderHome();
    expect(screen.getByText('home.no_reminders')).toBeInTheDocument();
  });

  it('renders the list of active (non-archived) reminders', () => {
    const reminders: Reminder[] = [
      { id: 'r1', category: 'water', label: 'R1', enabled: true, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0 },
      { id: 'r2', category: 'meal', label: 'R2', enabled: false, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0, archived: true },
      { id: 'r3', category: 'exercise', label: 'R3', enabled: true, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0 }
    ];
    useRemindersStore.setState({ reminders });

    renderHome();
    expect(screen.getByText('R1')).toBeInTheDocument();
    expect(screen.queryByText('R2')).not.toBeInTheDocument(); // archived
    expect(screen.getByText('R3')).toBeInTheDocument();
  });

  it('toggles reminder when toggle button is clicked', () => {
    const toggleSpy = vi.spyOn(useRemindersStore.getState(), 'toggleReminder');
    const reminder: Reminder = { id: 'r1', category: 'water', label: 'R1', enabled: true, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0 };
    useRemindersStore.setState({ reminders: [reminder] });

    renderHome();
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(toggleSpy).toHaveBeenCalledWith('r1');
  });

  it('expands card and shows actions when clicked', () => {
    const reminder: Reminder = { id: 'r1', category: 'water', label: 'R1', enabled: true, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0 };
    useRemindersStore.setState({ reminders: [reminder] });

    renderHome();
    const card = screen.getByLabelText('R1');
    fireEvent.click(card);

    expect(screen.getByText('actions.done')).toBeInTheDocument();
    expect(screen.getByText('actions.edit_full')).toBeInTheDocument();
  });

  it('shows streak banner if max streak > 0', () => {
    useStatsStore.setState({
      stats: {
        water: { category: 'water', currentStreak: 5, longestStreak: 10, lastCompletedDate: '2023-10-09', completionRateLast7Days: 1 }
      }
    });

    renderHome();
    expect(screen.getByText('home.streak_message:5')).toBeInTheDocument();
  });

  it('renders notification action sheet when pendingNotifAction is present', () => {
    useRemindersStore.setState({
      reminders: [{ id: 'r1', category: 'water', label: 'R1', enabled: true, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0 }],
      pendingNotifAction: { reminderId: 'r1', label: 'Drink Water', category: 'water' }
    });

    renderHome();
    expect(screen.getByText('Drink Water')).toBeInTheDocument();
    expect(screen.getByText('home.notif_action_subtitle')).toBeInTheDocument();
    expect(screen.getByText(/actions\.done/)).toBeInTheDocument();
  });

  it('closes notification action sheet on backdrop click', () => {
    const setActionSpy = vi.spyOn(useRemindersStore.getState(), 'setPendingNotifAction');
    useRemindersStore.setState({
      reminders: [{ id: 'r1', category: 'water', label: 'R1', enabled: true, soundMode: 'sound_vibration', snoozeMins: 5, character: 'mochi', schedules: [], createdAt: 0, updatedAt: 0 }],
      pendingNotifAction: { reminderId: 'r1', label: 'Action', category: 'water' }
    });

    renderHome();
    // Path: p("Action") -> div(center) -> div(sheet) -> div(backdrop)
    const backdrop = screen.getByText('Action').parentElement!.parentElement!.previousElementSibling!;
    fireEvent.click(backdrop);

    expect(setActionSpy).toHaveBeenCalledWith(null);
  });
});
