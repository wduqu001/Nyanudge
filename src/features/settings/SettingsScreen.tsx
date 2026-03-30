import React from 'react';
import { useNavigate } from 'react-router-dom';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Settings</h1>
      <p>Configure global application settings.</p>
    </div>
  );
};
