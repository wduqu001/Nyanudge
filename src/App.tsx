import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRemindersStore } from './core/store/remindersStore';
import { useStatsStore } from './core/store/statsStore';
import { defaultReminders, mockStats, mockRecentCompletions } from './core/db/seed';
import { HomeScreen } from './features/home/HomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { ReminderEdit } from './features/reminders/ReminderEdit';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import { usePreferencesStore } from './core/store/preferencesStore';
import { useTranslation } from 'react-i18next';
import { useNotificationSetup } from './core/notifications/useNotificationSetup';
import './App.css';

function App() {
  const { t } = useTranslation();
  useNotificationSetup();
  const { preferences, isLoaded, setLoaded, loadPreferences } = usePreferencesStore();
  const isOnboardingComplete = preferences.isOnboardingComplete;
  const { setReminders, setLoaded: setRemindersLoaded } = useRemindersStore();
  const { setStats, setRecentCompletions } = useStatsStore();

  useEffect(() => {
    // Sync theme
    const root = document.documentElement;
    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', preferences.theme);
    }
  }, [preferences.theme]);

  const { i18n } = useTranslation();
  useEffect(() => {
    // Sync language
    if (i18n.language !== preferences.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences.language, i18n]);

  useEffect(() => {
    // Real DB load
    const initDb = async () => {
      try {
        // Initialize SQLite & Run Migrations
        await import('./core/db/database').then(({ dbManager }) => dbManager.init());
        
        // Seed if first run
        const { ReminderService } = await import('./core/db/ReminderService');
        const { PreferenceService } = await import('./core/db/PreferenceService');
        
        await ReminderService.seedIfEmpty();
        
        // Load data
        const reminders = await ReminderService.getAllReminders();
        setReminders(reminders);
        setRemindersLoaded(true);

        const loadedPrefs = await PreferenceService.getPreferences();
        if (Object.keys(loadedPrefs).length > 0) {
          loadPreferences(loadedPrefs);
        }

        if (import.meta.env.DEV) {
          setStats(mockStats);
          setRecentCompletions(mockRecentCompletions);
        } else {
          setStats({});
          setRecentCompletions([]);
        }

        setLoaded(true);
      } catch (err) {
        console.error('Failed to initialize app database:', err);
        // Fallback to loaded anyway so the app can start (though with issues)
        setLoaded(true);
      }
    };

    initDb();
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        {t('app.loading')}
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
