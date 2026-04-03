import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRemindersStore } from './core/store/remindersStore';
import { defaultReminders } from './core/db/seed';
import { HomeScreen } from './features/home/HomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { ReminderEdit } from './features/reminders/ReminderEdit';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import { usePreferencesStore } from './core/store/preferencesStore';
import './App.css';

function App() {
  const { preferences, isLoaded, setLoaded } = usePreferencesStore();
  const isOnboardingComplete = preferences.isOnboardingComplete;
  const { setReminders, setLoaded: setRemindersLoaded } = useRemindersStore();

  useEffect(() => {
    // Sync theme
    const root = document.documentElement;
    if (preferences.theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', preferences.theme);
    }
  }, [preferences.theme]);

  useEffect(() => {
    // Simulate DB load
    setTimeout(() => {
      setLoaded(true);
      setReminders(defaultReminders as any);
      setRemindersLoaded(true);
    }, 500);
  }, []);

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!isOnboardingComplete ? <Navigate to="/onboarding" replace /> : <HomeScreen />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/reminder/:id" element={<ReminderEdit />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
