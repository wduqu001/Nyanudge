import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { NyaButton } from '../../shared/components/Button/NyaButton';
import { Step1MeetCrew } from './steps/Step1MeetCrew';
import { Step2YourReminders } from './steps/Step2YourReminders';
import { Step3HowYouLikeIt } from './steps/Step3HowYouLikeIt';
import { NyaSelect } from '../../shared/components/Select/NyaSelect';
import styles from './OnboardingFlow.module.css';

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { preferences, updatePreference } = usePreferencesStore();
  const [currentStep, setCurrentStep] = useState(0);

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'pt-BR', label: 'Português' },
    { value: 'ja', label: '日本語' },
    { value: 'es-ES', label: 'Español' },
  ];

  const handleLanguageChange = (newLang: string) => {
    updatePreference('language', newLang);
    i18n.changeLanguage(newLang);
  };

  const steps = [<Step1MeetCrew />, <Step2YourReminders />, <Step3HowYouLikeIt />];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    updatePreference('isOnboardingComplete', true);
    navigate('/', { replace: true });
  };

  return (
    <div className={styles.container}>
      <header className={styles.onboardingHeader}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className={styles.languageDropdownContainer}>
          <NyaSelect
            value={preferences.language}
            onChange={(val) => handleLanguageChange(String(val))}
            options={languages}
            className={styles.languageSelect}
          />
        </div>
      </header>
      <div className={styles.stepContent}>{steps[currentStep]}</div>

      <footer className={styles.footer}>
        {currentStep > 0 && (
          <NyaButton variant="secondary" onClick={handleBack} fullWidth>
            {t('onboarding.actions.back')}
          </NyaButton>
        )}
        <NyaButton variant="primary" onClick={handleNext} fullWidth>
          {currentStep === steps.length - 1
            ? t('onboarding.actions.finish')
            : t('onboarding.actions.next')}
        </NyaButton>
      </footer>
    </div>
  );
};
