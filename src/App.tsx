import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRemindersStore } from './core/store/remindersStore';
import { useStatsStore } from './core/store/statsStore';
import { mockStats } from './core/db/seed';
import { HomeScreen } from './features/home/HomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { ReminderEdit } from './features/reminders/ReminderEdit';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import { usePreferencesStore } from './core/store/preferencesStore';
import { useTranslation } from 'react-i18next';
import { useNotificationSetup } from './core/notifications/useNotificationSetup';
import { ReminderService } from './core/db/ReminderService';
import { PreferenceService } from './core/db/PreferenceService';
import { dbManager } from './core/db/database';
import './App.css';

// Expose Zustand store to window so native notification listeners
// (which run outside the React tree) can read state and call actions.
(window as any).remindersStore = useRemindersStore;

function App() {
  const { i18n } = useTranslation();
  useNotificationSetup();

  const { preferences, isLoaded, setLoaded, loadPreferences } = usePreferencesStore();
  const isOnboardingComplete = preferences.isOnboardingComplete;

  const { setReminders, setLoaded: setRemindersLoaded } = useRemindersStore();
  const { setStats, setRecentCompletions } = useStatsStore();

  useEffect(() => {
    // Sync theme
    const root = document.documentElement;
    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = preferences.theme === 'dark' || (preferences.theme === 'system' && isSystemDark);

    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', preferences.theme);
    }

    try {
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: isDark ? '#141412' : '#FAFAF9' }).catch(() => {});
    } catch (e) {
      console.log('StatusBar not available', e);
    }
  }, [preferences.theme]);

  useEffect(() => {
    if (i18n.language !== preferences.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences.language, i18n]);

  useEffect(() => {
    const initDb = async () => {
      try {
        await dbManager.init();
        await ReminderService.seedIfEmpty();

        const reminders = await ReminderService.getAllReminders();
        setReminders(reminders);
        setRemindersLoaded(true);

        const loadedPrefs = await PreferenceService.getPreferences();
        if (Object.keys(loadedPrefs).length > 0) {
          loadPreferences(loadedPrefs);
        }

        // Load completions from DB — persists across restarts
        const completions = await ReminderService.getRecentCompletions();
        setRecentCompletions(completions);

        // Stats seeded in DEV only; production stats are calculated from completion_log
        if (import.meta.env.DEV) {
          setStats(mockStats);
        } else {
          setStats({});
        }

        setLoaded(true);
      } catch (err) {
        console.error('Failed to initialize app database:', err);
        setLoaded(true);
      }
    };
    initDb();
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={!isOnboardingComplete ? <Navigate to="/onboarding" replace /> : <HomeScreen />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/reminder/:id" element={<ReminderEdit />} />
      <Route path="/settings" element={<SettingsScreen />} />
      <Route path="/history" element={<HistoryScreen />} />
    </Routes>
  );
}

export default App;
