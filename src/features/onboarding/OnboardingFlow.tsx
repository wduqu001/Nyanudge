import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { Button } from '../../shared/components/Button/Button';
import { Step1MeetCrew } from './steps/Step1MeetCrew';
import { Step2YourReminders } from './steps/Step2YourReminders';
import { Step3HowYouLikeIt } from './steps/Step3HowYouLikeIt';
import styles from './OnboardingFlow.module.css';

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const updatePreference = usePreferencesStore((state) => state.updatePreference);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    <Step1MeetCrew />,
    <Step2YourReminders />,
    <Step3HowYouLikeIt />,
  ];

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
      <div className={styles.stepContent}>
        {steps[currentStep]}
      </div>

      <footer className={styles.footer}>
        {currentStep > 0 && (
          <Button variant="secondary" onClick={handleBack} fullWidth>
            {t('onboarding.actions.back')}
          </Button>
        )}
        <Button variant="primary" onClick={handleNext} fullWidth>
          {currentStep === steps.length - 1 
            ? t('onboarding.actions.finish') 
            : t('onboarding.actions.next')}
        </Button>
      </footer>
    </div>
  );
};
