import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon, HistoryIcon, SettingsIcon } from '../Icons';
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
        <HomeIcon size={20} />
        {t('home.nav.home')}
      </button>

      <button 
        className={`${styles.navItem} ${isActive('/history') ? styles.navItemActive : ''}`} 
        onClick={() => navigate('/history')}
        aria-current={isActive('/history') ? 'page' : undefined}
      >
        <HistoryIcon size={20} />
        {t('home.nav.history')}
      </button>

      <button 
        className={`${styles.navItem} ${isActive('/settings') ? styles.navItemActive : ''}`} 
        onClick={() => navigate('/settings')}
        aria-current={isActive('/settings') ? 'page' : undefined}
      >
        <SettingsIcon size={20} />
        {t('home.nav.settings')}
      </button>
    </nav>
  );
};
