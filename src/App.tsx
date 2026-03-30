import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeScreen } from './features/home/HomeScreen';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { ReminderEdit } from './features/reminders/ReminderEdit';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { HistoryScreen } from './features/history/HistoryScreen';
import './App.css';

function App() {
  const isFirstLaunch = false; // TODO: Check if first launch

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isFirstLaunch ? <Navigate to="/onboarding" replace /> : <HomeScreen />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/reminder/:id" element={<ReminderEdit />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
