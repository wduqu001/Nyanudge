import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../../core/store/preferencesStore';
import styles from '../OnboardingFlow.module.css';

export const Step3HowYouLikeIt: React.FC = () => {
  const { t } = useTranslation();
  const { preferences, updatePreference } = usePreferencesStore();

  const options = [
    { value: 'sound_vibration', label: t('settings.notifications.sound_vibration'), icon: '🔊' },
    { value: 'vibration_only', label: t('settings.notifications.vibration_only'), icon: '📳' },
    { value: 'silent', label: t('settings.notifications.silent'), icon: '🔇' }
  ];

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.title}>{t('onboarding.step3.title')}</h1>
      <p className={styles.description}>{t('onboarding.step3.description')}</p>

      <div className={styles.grid}>
        {options.map((opt) => (
          <div
            key={opt.value}
            className={`${styles.card} ${preferences.defaultSoundMode === opt.value ? styles.cardSelected : ''}`}
            onClick={() => updatePreference('defaultSoundMode', opt.value as any)}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-neutral-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {opt.icon}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{opt.label}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
