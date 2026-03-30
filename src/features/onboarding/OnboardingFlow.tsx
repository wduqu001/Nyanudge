import React from 'react';
import { useNavigate } from 'react-router-dom';

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <h1>Welcome to NyaNudge</h1>
      <p>This is the onboarding flow.</p>
      <button onClick={() => navigate('/')}>Finish Onboarding</button>
    </div>
  );
};
