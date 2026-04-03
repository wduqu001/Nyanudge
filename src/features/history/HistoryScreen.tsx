import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ padding: '24px' }}>
      <button onClick={() => navigate(-1)}>{t('onboarding.actions.back')}</button>
      <h1>{t('history.title')}</h1>
      <p>{t('history.subtitle')}</p>
    </div>
  );
};
