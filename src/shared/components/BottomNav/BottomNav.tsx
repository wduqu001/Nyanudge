import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './BottomNav.module.css';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.bottomNav} aria-label={t('aria.main_navigation')}>
      <button 
        className={`${styles.navItem} ${isActive('/') ? styles.navItemActive : ''}`} 
        onClick={() => navigate('/')}
        aria-current={isActive('/') ? 'page' : undefined}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.4" fill="none" />
          <rect x="7" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
        {t('home.nav.home')}
      </button>

      <button 
        className={`${styles.navItem} ${isActive('/history') ? styles.navItemActive : ''}`} 
        onClick={() => navigate('/history')}
        aria-current={isActive('/history') ? 'page' : undefined}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="13" y1="2" x2="13" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1" />
        </svg>
        {t('home.nav.history')}
      </button>

      <button 
        className={`${styles.navItem} ${isActive('/settings') ? styles.navItemActive : ''}`} 
        onClick={() => navigate('/settings')}
        aria-current={isActive('/settings') ? 'page' : undefined}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="10" y1="3" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="14" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {t('home.nav.settings')}
      </button>
    </nav>
  );
};
