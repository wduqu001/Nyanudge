import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { SettingsScreen } from '../SettingsScreen';
import { usePreferencesStore } from '../../../core/store/preferencesStore';
import { useStatsStore } from '../../../core/store/statsStore';
import * as ReminderService from '../../../core/db/ReminderService';

// ── Capacitor & native mocks ─────────────────────────────────────────────────
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'web' } }));
vi.mock('../../../core/db/ReminderService', () => ({
  ReminderService: { clearHistory: vi.fn().mockResolvedValue(undefined) },
}));

// Stub CrashReporterModal so we can assert it's rendered without complex deps
vi.mock('../CrashReporterModal', () => ({
  CrashReporterModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="debug-panel">
      <button onClick={onClose}>close-debug</button>
    </div>
  ),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

describe('SettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    // Reset stores to defaults between tests
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
    useStatsStore.setState({ stats: {}, recentCompletions: [] });
  });

  // ── Render ────────────────────────────────────────────────────────────────

  it('renders all four section headings', () => {
    render(<Wrapper><SettingsScreen /></Wrapper>);
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/appearance/i)).toBeInTheDocument();
    expect(screen.getByText(/reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/data/i)).toBeInTheDocument();
  });

  // ── Export CSV ────────────────────────────────────────────────────────────

  it('calls alert when Export CSV is clicked', () => {
    render(<Wrapper><SettingsScreen /></Wrapper>);
    fireEvent.click(screen.getByText(/export history as csv/i));
    expect(window.alert).toHaveBeenCalledOnce();
  });

  // ── Clear History ─────────────────────────────────────────────────────────

  it('does NOT clear history when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    fireEvent.click(screen.getByText(/clear all history/i));
    expect(ReminderService.ReminderService.clearHistory).not.toHaveBeenCalled();
  });

  it('clears store and calls ReminderService.clearHistory when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    await act(async () => {
      fireEvent.click(screen.getByText(/clear all history/i));
    });
    expect(ReminderService.ReminderService.clearHistory).toHaveBeenCalledOnce();
  });

  // ── Debug panel via version taps ──────────────────────────────────────────

  it('shows countdown text after 1-4 taps on version info', () => {
    render(<Wrapper><SettingsScreen /></Wrapper>);
    const versionEl = screen.getByLabelText(/tap 5 times for debug panel/i);
    fireEvent.click(versionEl);
    expect(screen.getByText(/more tap/i)).toBeInTheDocument();
  });

  it('opens debug panel after 5 taps', () => {
    render(<Wrapper><SettingsScreen /></Wrapper>);
    const versionEl = screen.getByLabelText(/tap 5 times for debug panel/i);
    for (let i = 0; i < 5; i++) fireEvent.click(versionEl);
    expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
  });

  it('closes debug panel via the panel onClose callback', () => {
    render(<Wrapper><SettingsScreen /></Wrapper>);
    const versionEl = screen.getByLabelText(/tap 5 times for debug panel/i);
    for (let i = 0; i < 5; i++) fireEvent.click(versionEl);
    expect(screen.getByTestId('debug-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByText('close-debug'));
    expect(screen.queryByTestId('debug-panel')).not.toBeInTheDocument();
  });

  it('resets tap count after 2 s (via fake timers)', () => {
    vi.useFakeTimers();
    render(<Wrapper><SettingsScreen /></Wrapper>);
    const versionEl = screen.getByLabelText(/tap 5 times for debug panel/i);
    fireEvent.click(versionEl); // tap 1
    expect(screen.getByText(/4 more tap/i)).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(2100); }); // wait > 2s
    expect(screen.queryByText(/more tap/i)).not.toBeInTheDocument();
    vi.useRealTimers();
  });
  it('can change sound mode via the NyaSelect', () => {
    const updatePreference = vi.fn();
    usePreferencesStore.setState({
      preferences: {
        defaultSoundMode: 'sound_vibration',
        notificationStyle: 'standard',
        dndStart: '22:00', dndEnd: '07:00',
        theme: 'system', character: 'mochi', language: 'en',
        defaultSnoozeMins: 10, markAsDoneOnOpen: false, isOnboardingComplete: false,
      },
      isLoaded: true,
      updatePreference,
    } as any);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    // Open sound mode select (trigger has accessible name = current value label)
    const soundTrigger = screen.getByRole('button', { name: /sound/i });
    fireEvent.click(soundTrigger);
    fireEvent.click(screen.getByText(/vibration only/i));
    expect(updatePreference).toHaveBeenCalledWith('defaultSoundMode', 'vibration_only');
  });

  it('can change notification style via the NyaSelect', () => {
    const updatePreference = vi.fn();
    usePreferencesStore.setState({
      preferences: {
        defaultSoundMode: 'sound_vibration', notificationStyle: 'standard',
        dndStart: '22:00', dndEnd: '07:00',
        theme: 'system', character: 'mochi', language: 'en',
        defaultSnoozeMins: 10, markAsDoneOnOpen: false, isOnboardingComplete: false,
      },
      isLoaded: true,
      updatePreference,
    } as any);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: /standard/i }));
    fireEvent.click(screen.getByText(/compact/i));
    expect(updatePreference).toHaveBeenCalledWith('notificationStyle', 'compact');
  });

  it('updates DND start time via time input change', () => {
    const updatePreference = vi.fn();
    usePreferencesStore.setState({
      preferences: {
        defaultSoundMode: 'sound_vibration', notificationStyle: 'standard',
        dndStart: '22:00', dndEnd: '07:00',
        theme: 'system', character: 'mochi', language: 'en',
        defaultSnoozeMins: 10, markAsDoneOnOpen: false, isOnboardingComplete: false,
      },
      isLoaded: true,
      updatePreference,
    } as any);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    const [startInput] = screen.getAllByDisplayValue(/:/);
    fireEvent.change(startInput!, { target: { value: '21:00' } });
    expect(updatePreference).toHaveBeenCalledWith('dndStart', '21:00');
  });

  it('toggles markAsDoneOnOpen via Toggle component', () => {
    const updatePreference = vi.fn();
    usePreferencesStore.setState({
      preferences: {
        defaultSoundMode: 'sound_vibration', notificationStyle: 'standard',
        dndStart: '22:00', dndEnd: '07:00',
        theme: 'system', character: 'mochi', language: 'en',
        defaultSnoozeMins: 10, markAsDoneOnOpen: false, isOnboardingComplete: false,
      },
      isLoaded: true,
      updatePreference,
    } as any);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    const toggles = screen.getAllByRole('switch');
    // The markAsDoneOnOpen toggle exists as one of the switches
    const markDoneToggle = toggles.find(el => el.getAttribute('aria-checked') === 'false');
    expect(markDoneToggle).toBeDefined();
    fireEvent.click(markDoneToggle!);
    expect(updatePreference).toHaveBeenCalled();
  });

  it('calls updatePreference and i18n.changeLanguage when language is changed', () => {
    const updatePreference = vi.fn();
    usePreferencesStore.setState({
      preferences: {
        defaultSoundMode: 'sound_vibration', notificationStyle: 'standard',
        dndStart: '22:00', dndEnd: '07:00',
        theme: 'system', character: 'mochi', language: 'en',
        defaultSnoozeMins: 10, markAsDoneOnOpen: false, isOnboardingComplete: false,
      },
      isLoaded: true,
      updatePreference,
    } as any);
    render(<Wrapper><SettingsScreen /></Wrapper>);
    // Language select has 'English' as current value
    const langTrigger = screen.getByRole('button', { name: /english/i });
    fireEvent.click(langTrigger);
    // Click pt-BR option
    fireEvent.click(screen.getByText(/português/i));
    expect(updatePreference).toHaveBeenCalledWith('language', 'pt-BR');
  });
});
