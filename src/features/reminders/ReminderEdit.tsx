import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ReminderEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Edit Reminder {id}</h1>
      <p>Configure your reminder here.</p>
    </div>
  );
};
