import { create } from 'zustand';

export type Theme = 'system' | 'light' | 'dark';
export type NotificationStyle = 'standard' | 'compact';

export interface Preferences {
  // Notifications
  defaultSoundMode: 'sound_vibration' | 'vibration_only' | 'silent';
  notificationStyle: NotificationStyle;
  dndStart: string;   // "22:00"
  dndEnd: string;     // "07:00"

  // Appearance
  theme: Theme;
  character: 'mochi' | 'sora' | 'kuro';
  language: string;   // BCP-47 code: 'en' | 'pt-BR' | 'ja' | 'es-ES'

  // Reminders
  defaultSnoozeMins: number;
  markAsDoneOnOpen: boolean;
}

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
};

interface PreferencesState {
  preferences: Preferences;
  isLoaded: boolean;

  setPreferences: (prefs: Preferences) => void;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;
  setLoaded: (loaded: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: defaultPreferences,
  isLoaded: false,

  setPreferences: (preferences) => set({ preferences, isLoaded: true }),

  updatePreference: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    })),

  resetPreferences: () =>
    set({ preferences: defaultPreferences }),

  setLoaded: (loaded) => set({ isLoaded: loaded }),
}));
