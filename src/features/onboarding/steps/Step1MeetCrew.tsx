import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../../core/store/preferencesStore';
import type { Character } from '../../../types/nyanudge';
import styles from '../OnboardingFlow.module.css';

export const Step1MeetCrew: React.FC = () => {
  const { t } = useTranslation();
  const { preferences, updatePreference } = usePreferencesStore();

  const characters: Character[] = ['mochi', 'sora', 'kuro'];

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.title}>{t('onboarding.step1.title')}</h1>
      <p className={styles.description}>{t('onboarding.step1.description')}</p>

      <div className={styles.grid}>
        {characters.map((char) => (
          <div
            key={char}
            className={`${styles.card} ${preferences.character === char ? styles.cardSelected : ''}`}
            onClick={() => updatePreference('character', char)}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              backgroundColor: 'var(--color-neutral-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              {char === 'mochi' ? '🐱' : char === 'sora' ? '🐈' : '🐈‍⬛'}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{t(`onboarding.step1.${char}.name`)}</h3>
              <p className={styles.cardDesc}>{t(`onboarding.step1.${char}.description`)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
