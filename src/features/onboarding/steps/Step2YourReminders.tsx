import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRemindersStore } from '../../../core/store/remindersStore';
import type { Category } from '../../../types/nyanudge';
import { Toggle } from '../../../shared/components/Toggle/Toggle';
import styles from '../OnboardingFlow.module.css';

export const Step2YourReminders: React.FC = () => {
  const { t } = useTranslation();
  const { reminders, toggleReminder } = useRemindersStore();

  const categories: Category[] = ['water', 'meal', 'exercise', 'bathroom', 'medicine'];
  const categoryColorMapping: Record<string, 'water' | 'food' | 'exercise' | 'bathroom' | 'medicine'> = {
    water: 'water',
    meal: 'food',
    exercise: 'exercise',
    bathroom: 'bathroom',
    medicine: 'medicine',
  };

  return (
    <div className={styles.stepContent} style={{ justifyContent: 'start' }}>
      <h1 className={styles.title}>{t('onboarding.step2.title')}</h1>
      <p className={styles.description}>{t('onboarding.step2.description')}</p>

      <div className={styles.grid}>
        {categories.map((cat) => {
          const reminder = reminders.find((r) => r.category === cat);
          if (!reminder) return null;

          return (
            <div
              key={cat}
              className={`${styles.card} ${reminder.enabled ? styles.cardSelected : ''}`}
              onClick={() => toggleReminder(reminder.id)}
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
                {cat === 'water' ? '💧' : cat === 'meal' ? '🍱' : cat === 'exercise' ? '🏃' : cat === 'bathroom' ? '🚽' : '💊'}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{t(`categories.${cat}.name`)}</h3>
                <p className={styles.cardDesc}>{t(`onboarding.step2.${cat}`)}</p>
              </div>
              <Toggle
                checked={reminder.enabled}
                onChange={(_, e) => {
                  e?.stopPropagation();
                  toggleReminder(reminder.id);
                }}
                categoryColor={categoryColorMapping[cat]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
