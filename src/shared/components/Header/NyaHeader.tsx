import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import styles from './Header.module.css';

interface NyaHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

export const NyaHeader: React.FC<NyaHeaderProps> = ({ 
  title, 
  onBack, 
  showBack = true, 
  rightContent 
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={styles.header}>
      {showBack ? (
        <button 
          className={styles.backButton} 
          onClick={handleBack} 
          aria-label={t('aria.go_back')}
        >
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className={styles.spacer} />
      )}
      
      <h1 className={styles.title}>{title}</h1>
      
      {rightContent ? (
        <div className={styles.rightContent}>{rightContent}</div>
      ) : (
        <div className={styles.spacer} />
      )}
    </header>
  );
};
