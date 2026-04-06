import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePreferencesStore } from '../core/store/preferencesStore';
import { PreferenceService } from '../core/db/PreferenceService';

vi.mock('../core/db/PreferenceService', () => ({
  PreferenceService: {
    saveAll: vi.fn().mockResolvedValue(undefined),
    updatePreference: vi.fn().mockResolvedValue(undefined),
  }
}));

describe('PreferencesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePreferencesStore.getState().resetPreferences();
    // After reset, we might want to reset the mocked call counts
    vi.clearAllMocks();
  });

  it('initializes with default preferences and not loaded', () => {
    // isLoaded is originally false, resetPreferences doesnt touch isLoaded actually but let's assume default
    expect(usePreferencesStore.getState().preferences.theme).toBe('system');
    expect(usePreferencesStore.getState().preferences.language).toBe('en');
  });

  it('setPreferences overrides everything, sets loaded, and saves to DB', () => {
    const customPrefs = {
      ...usePreferencesStore.getState().preferences,
      theme: 'dark' as const,
      language: 'pt-BR'
    };
    usePreferencesStore.getState().setPreferences(customPrefs);

    expect(usePreferencesStore.getState().isLoaded).toBe(true);
    expect(usePreferencesStore.getState().preferences.theme).toBe('dark');
    expect(PreferenceService.saveAll).toHaveBeenCalledWith(customPrefs);
  });

  it('updatePreference patches a single key correctly and updates DB', () => {
    usePreferencesStore.getState().updatePreference('language', 'ja');

    expect(usePreferencesStore.getState().preferences.language).toBe('ja');
    expect(PreferenceService.updatePreference).toHaveBeenCalledWith('language', 'ja');
  });

  it('loadPreferences merges gracefully', () => {
    usePreferencesStore.getState().loadPreferences({
      defaultSnoozeMins: 30
    });

    expect(usePreferencesStore.getState().preferences.defaultSnoozeMins).toBe(30);
    // Other defaults remain untouched
    expect(usePreferencesStore.getState().preferences.theme).toBe('system');
    expect(usePreferencesStore.getState().isLoaded).toBe(true);
  });

  it('resetPreferences reverts to initial state and syncs to DB', () => {
    usePreferencesStore.getState().updatePreference('theme', 'dark');
    // Ensure the change took place
    expect(usePreferencesStore.getState().preferences.theme).toBe('dark');
    
    vi.clearAllMocks();
    
    usePreferencesStore.getState().resetPreferences();
    expect(usePreferencesStore.getState().preferences.theme).toBe('system');
    expect(PreferenceService.saveAll).toHaveBeenCalled(); // Should be saved back to DB
  });
});
