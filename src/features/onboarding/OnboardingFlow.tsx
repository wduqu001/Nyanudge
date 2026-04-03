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
  const { t, i18n } = useTranslation();
  const { preferences, updatePreference } = usePreferencesStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt-BR', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'es-ES', name: 'Español' }
  ];

  const handleLanguageChange = (newLang: string) => {
    updatePreference('language', newLang);
    i18n.changeLanguage(newLang);
    setIsLangOpen(false);
  };

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
      <header className={styles.onboardingHeader}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} 
          />
        </div>
        <div className={styles.languageDropdownContainer}>
          <button 
            id="onboarding-language-select"
            className={`${styles.languageSelectWrapper} ${isLangOpen ? styles.dropdownActive : ''}`}
            onClick={() => setIsLangOpen(!isLangOpen)}
            aria-haspopup="listbox"
            aria-expanded={isLangOpen}
            aria-label="Change language"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={styles.globeIcon}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className={styles.currentLangLabel}>
              {languages.find(l => l.code === preferences.language)?.name || 'English'}
            </span>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={`${styles.chevronIcon} ${isLangOpen ? styles.chevronRotated : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isLangOpen && (
            <>
              <div className={styles.dropdownOverlay} onClick={() => setIsLangOpen(false)} />
              <div className={styles.dropdownMenu} role="listbox">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`${styles.dropdownItem} ${preferences.language === lang.code ? styles.dropdownItemSelected : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                    role="option"
                    aria-selected={preferences.language === lang.code}
                  >
                    <span className={styles.dropdownItemName}>{lang.name}</span>
                    {preferences.language === lang.code && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>
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
