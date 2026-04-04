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
  const { preferences, isLoaded, setLoaded } = usePreferencesStore();
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
    // Simulate DB load
    setTimeout(() => {
      setLoaded(true);
      setReminders(defaultReminders as any);
      setRemindersLoaded(true);
      if (import.meta.env.DEV) {
        setStats(mockStats);
        setRecentCompletions(mockRecentCompletions);
      } else {
        setStats({});
        setRecentCompletions([]);
      }
    }, 500);
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
