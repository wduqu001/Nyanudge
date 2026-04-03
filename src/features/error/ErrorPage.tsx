import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CatErrorIllustration } from '../../shared/components/CatErrorIllustration/CatErrorIllustration';
import { NyaButton } from '../../shared/components/Button/NyaButton';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    navigate(-1);
  };

  const handleGoHome = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    navigate('/');
  };

  return (
    <div className={styles.body}>
      <div className={styles.logoBar}>
        <div className={styles.logoDot}></div>
        NyaNudge
      </div>

      <div className={styles.card}>
        <div className={styles.catWrap}>
          <CatErrorIllustration />
        </div>

        <div className={styles.errorCode}>{t('error.title')}</div>

        <h1>{t('error.hero')}</h1>

        <p className={styles.subtitle}>
          {error ? error.message : t('error.subtitle')}
        </p>

        <div className={styles.actions}>
          <NyaButton variant="primary" onClick={handleGoBack} fullWidth>{t('error.go_back')}</NyaButton>
          <NyaButton variant="ghost" onClick={handleGoHome} fullWidth>{t('error.take_home')}</NyaButton>
        </div>
      </div>

      <p className={styles.footerNote}>
        NyaNudge
        <span className={styles.footerDot}></span>
        {t('error.footer')}
      </p>
    </div>
  );
};
