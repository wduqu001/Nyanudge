import { create } from 'zustand';

import { PreferenceService } from '../db/PreferenceService';

const defaultPreferences: Preferences = {
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
};

interface PreferencesState {
  preferences: Preferences;
  isLoaded: boolean;

  setPreferences: (prefs: Preferences) => void;
  loadPreferences: (prefs: Partial<Preferences>) => void;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;
  setLoaded: (loaded: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: defaultPreferences,
  isLoaded: false,

  setPreferences: (preferences) => {
    set({ preferences, isLoaded: true });
    PreferenceService.saveAll(preferences).catch(err => console.error('[Store] Error saving prefs:', err));
  },

  loadPreferences: (loadedPrefs) => {
    set((state) => ({ 
      preferences: { ...state.preferences, ...loadedPrefs }, 
      isLoaded: true 
    }));
  },

  updatePreference: (key, value) => {
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    }));
    PreferenceService.updatePreference(key as string, value).catch(err => console.error('[Store] Error updating pref:', err));
  },

  resetPreferences: () => {
    set({ preferences: defaultPreferences });
    PreferenceService.saveAll(defaultPreferences).catch(err => console.error('[Store] Error resetting prefs:', err));
  },

  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));
