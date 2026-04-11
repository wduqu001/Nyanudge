/**
 * SettingsScreen component tests
 *
 * Bug fixed: handleClearHistory previously only showed an alert without clearing
 * any data. It now calls setRecentCompletions([]) + setStats({}) on the stats
 * store and ReminderService.clearHistory() to wipe the DB.
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsScreen } from './SettingsScreen';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { useStatsStore } from '../../core/store/statsStore';
import { ReminderService } from '../../core/db/ReminderService';

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../core/db/PreferenceService', () => ({
  PreferenceService: {
    saveAll: vi.fn().mockResolvedValue(undefined),
    updatePreference: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('../../core/db/ReminderService', () => ({
  ReminderService: {
    clearHistory: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en' }
  })
}));

// Mock shared components to keep tests focused on SettingsScreen logic
vi.mock('../../shared/components/Button/NyaButton', () => ({
  NyaButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  )
}));

vi.mock('../../shared/components/Header/NyaHeader', () => ({
  NyaHeader: ({ title }: { title: string }) => <h1>{title}</h1>
}));

vi.mock('../../shared/components/Toggle/Toggle', () => ({
  Toggle: ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
  )
}));

vi.mock('../../shared/components/CharacterSelect/CharacterSelect', () => ({
  CharacterSelect: ({ onChange }: { onChange: (v: string) => void }) => (
    <select onChange={(e) => onChange(e.target.value)} data-testid="char-select">
      <option value="mochi">mochi</option>
    </select>
  )
}));

vi.mock('../../shared/components/Select/NyaSelect', () => ({
  NyaSelect: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-${value}`}>
      <option value={value}>{value}</option>
    </select>
  )
}));

// ── Helpers ────────────────────────────────────────────────────────────────

const renderSettings = () =>
  render(
    <MemoryRouter>
      <SettingsScreen />
    </MemoryRouter>
  );

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePreferencesStore.getState().resetPreferences();
    vi.clearAllMocks();
    useStatsStore.setState({ stats: {}, recentCompletions: [], isLoaded: true });
  });

  it('renders the settings title', () => {
    renderSettings();
    expect(screen.getByText('settings.title')).toBeInTheDocument();
  });

  it('renders the Clear History button', () => {
    renderSettings();
    expect(screen.getByText('settings.data.clear_history')).toBeInTheDocument();
  });

  it('renders the Export CSV button', () => {
    renderSettings();
    expect(screen.getByText('settings.data.export_csv')).toBeInTheDocument();
  });

  it('renders the Reset Defaults button', () => {
    renderSettings();
    expect(screen.getByText('settings.reminders.reset_defaults')).toBeInTheDocument();
  });

  // ── Reset defaults ─────────────────────────────────────────────────────

  it('resetPreferences is called when Reset Defaults is clicked', () => {
    const resetSpy = vi.spyOn(usePreferencesStore.getState(), 'resetPreferences');
    renderSettings();

    fireEvent.click(screen.getByText('settings.reminders.reset_defaults'));
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  // ── Export CSV ─────────────────────────────────────────────────────────

  it('shows an alert when Export CSV is clicked', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderSettings();

    fireEvent.click(screen.getByText('settings.data.export_csv'));
    expect(alertSpy).toHaveBeenCalledWith('settings.data.exporting');
  });

  // ── Clear History ──────────────────────────────────────────────────────

  it('shows a confirm dialog when Clear History is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderSettings();

    fireEvent.click(screen.getByText('settings.data.clear_history'));
    expect(confirmSpy).toHaveBeenCalledWith('settings.data.clear_confirm');
  });

  it('does not show the cleared alert if the user cancels the confirm dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderSettings();

    fireEvent.click(screen.getByText('settings.data.clear_history'));
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('shows a cleared alert when the user confirms the dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderSettings();

    fireEvent.click(screen.getByText('settings.data.clear_history'));
    expect(alertSpy).toHaveBeenCalledWith('settings.data.history_cleared');
  });

  /**
   * Previously a BUG: handleClearHistory only showed an alert but did NOT clear
   * recentCompletions from the statsStore. Now fixed — after confirmation the
   * store is emptied and clearHistory() is called on the DB.
   */
  it('clear history empties recentCompletions from the store after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    const seedCompletion = {
      id: 'c1',
      reminderId: 'r1',
      category: 'water' as const,
      completedAt: Date.now(),
      wasSkipped: false
    };
    useStatsStore.setState({ recentCompletions: [seedCompletion] });

    renderSettings();
    fireEvent.click(screen.getByText('settings.data.clear_history'));

    // Fixed: store is now wiped after confirmation
    expect(useStatsStore.getState().recentCompletions).toEqual([]);
  });

  it('clear history calls ReminderService.clearHistory after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderSettings();
    fireEvent.click(screen.getByText('settings.data.clear_history'));

    expect(ReminderService.clearHistory).toHaveBeenCalledTimes(1);
  });

  it('clear history does NOT wipe store when user cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    const seedCompletion = {
      id: 'c1',
      reminderId: 'r1',
      category: 'water' as const,
      completedAt: Date.now(),
      wasSkipped: false
    };
    useStatsStore.setState({ recentCompletions: [seedCompletion] });

    renderSettings();
    fireEvent.click(screen.getByText('settings.data.clear_history'));

    // Cancelled — data must be untouched
    expect(useStatsStore.getState().recentCompletions).toEqual([seedCompletion]);
  });
});
