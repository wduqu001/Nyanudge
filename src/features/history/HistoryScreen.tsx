import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>History & Stats</h1>
      <p>View completion history and habits.</p>
    </div>
  );
};
