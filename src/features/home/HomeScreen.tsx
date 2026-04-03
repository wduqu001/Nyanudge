import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemindersStore } from '../../core/store/remindersStore';
import type { Category, Reminder } from '../../types/nyanudge';
import { Card } from '../../shared/components/Card/Card';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { LottiePlayer } from '../../shared/animations';
import './HomeScreen.css';

import CatMochi from '../../assets/cat_mochi.svg';

const CategoryIcon = ({ category, enabled }: { category: Category, enabled: boolean }) => {
  const color = enabled ? CATEGORY_COLORS[category] : '#A09E98';

  switch (category) {
    case 'water':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L13 8C14.1 9.6 14.5 11 13.8 12.8 13.1 14.5 11.2 16 9 16 6.8 16 4.9 14.5 4.2 12.8 3.5 11 3.9 9.6 5 8Z" fill={color} />
        </svg>
      );
    case 'meal':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 3v4c0 2.2 1.8 4 4 4v4h2v-4c2.2 0 4-1.8 4-4V3h-2v3H6V3H4z" fill={color} />
        </svg>
      );
    case 'exercise':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="4" r="2" fill={color} />
          <path d="M6 7h6l1 4H5l1-4z" fill={color} />
          <path d="M7 11l-1 5M11 11l1 5M6 13h6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'bathroom':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="4" y="8" width="10" height="8" rx="2" fill={color} />
          <path d="M6 8V5a3 3 0 016 0v3" stroke={color} strokeWidth="1.3" fill="none" />
        </svg>
      );
    case 'medicine':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="4" y="7" width="10" height="7" rx="2" fill={color} />
          <rect x="7" y="4" width="4" height="3" rx="1" fill={color} />
          <rect x="6.5" y="10" width="5" height="1.2" rx="0.6" fill="white" />
        </svg>
      );
    default:
      return null;
  }
};

const CATEGORY_COLORS: Record<Category, string> = {
  water: '#3B8BD4',
  meal: '#5DAA62',
  exercise: '#E97B22',
  bathroom: '#8A72C8',
  medicine: '#D65B5B',
};

const CATEGORY_BG_COLORS: Record<Category, string> = {
  water: 'var(--color-icon-bg-water)',
  meal: 'var(--color-icon-bg-food)',
  exercise: 'var(--color-icon-bg-exercise)',
  bathroom: 'var(--color-icon-bg-disabled)',
  medicine: 'var(--color-icon-bg-disabled)',
};

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reminders, toggleReminder } = useRemindersStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleReminder(id);
  };

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatSchedule = (reminder: Reminder) => {
    if (!reminder.enabled) return t('actions.disabled', 'Disabled');
    const schedule = reminder.schedules[0];
    if (!schedule) return 'No schedule';
    
    if (schedule.type === 'interval') {
      return `Every ${schedule.timeValue} mins · ${schedule.startTime}-${schedule.endTime}`;
    } else {
      return `At ${schedule.timeValue}`;
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <button className="icon-button" aria-label="Menu" onClick={() => navigate('/history')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect y="3" width="16" height="1.5" rx="1" fill="currentColor" opacity="0.6" />
            <rect y="7" width="12" height="1.5" rx="1" fill="currentColor" opacity="0.6" />
            <rect y="11" width="16" height="1.5" rx="1" fill="currentColor" opacity="0.6" />
          </svg>
        </button>
        <h1 className="home-title">{t('app.name', 'NyaNudge')}</h1>
        <button className="icon-button" aria-label="Settings" onClick={() => navigate('/settings')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </svg>
        </button>
      </header>

      <section className="hero-section">
        <div className="hero-cat-container">
          <LottiePlayer animationKey="cat_idle" />
        </div>
        <div className="next-up-pill">Next up in 14 min</div>
        <div className="hero-copy">Drink Water</div>
        <div className="hero-sub">Mochi is keeping an eye on things 👀</div>
      </section>

      <section className="streak-banner">
        🔥 <span>3-day streak — keep going!</span>
      </section>

      <div className="section-label">Your reminders</div>

      <section className="reminders-list">
        {reminders.map((reminder: Reminder) => {
          const enabled = reminder.enabled;
          const bgConfig = enabled ? CATEGORY_BG_COLORS[reminder.category] : 'var(--color-icon-bg-disabled)';

          const categoryColorMapping: Record<string, "water" | "food" | "exercise" | "bathroom" | "medicine"> = {
            water: "water",
            meal: "food",
            exercise: "exercise",
            bathroom: "bathroom",
            medicine: "medicine"
          };

          const textColor = enabled ? 'var(--text-primary)' : '#A09E98';
          const subtextColor = enabled ? 'var(--text-secondary)' : '#A09E98';

          return (
            <Card
              key={reminder.id}
              className={`reminder-card ${expandedId === reminder.id ? 'expanded' : ''}`}
              onClick={() => handleCardClick(reminder.id)}
              categoryColor={enabled ? categoryColorMapping[reminder.category] : undefined}
            >
              <div className="reminder-card-main">
                <div className="reminder-card-content">
                  <div className="reminder-card-icon" style={{ background: bgConfig }}>
                    <CategoryIcon category={reminder.category} enabled={enabled} />
                  </div>
                  <div className="reminder-card-text">
                    <h3 style={{ color: textColor }}>{reminder.label}</h3>
                    <p style={{ color: subtextColor }}>
                      {formatSchedule(reminder)}
                    </p>
                  </div>
                  <div className="reminder-card-toggle">
                    <Toggle
                      checked={reminder.enabled}
                      onChange={(e: any) => handleToggle(reminder.id, e as any)}
                    />
                  </div>
                </div>
              </div>
              
              {expandedId === reminder.id && (
                <div className="reminder-card-expanded">
                  <div className="expanded-divider" />
                  <div className="quick-actions">
                    <div className="quick-info">
                      <span className="quick-label">Next fire time</span>
                      <span className="quick-value">3:30 PM today</span>
                    </div>
                    <button 
                      className="edit-full-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reminder/${reminder.id}`);
                      }}
                    >
                      {t('actions.edit_full', 'Edit Settings')}
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </section>

      <nav className="bottom-nav">
        <button className="nav-item nav-item-active" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <rect x="7" y="12" width="6" height="6" rx="1" fill="currentColor" opacity="0.4" />
          </svg>
          Home
        </button>
        <button className="nav-item" onClick={() => navigate('/history')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="13" y1="2" x2="13" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1" />
          </svg>
          History
        </button>
        <button className="nav-item" onClick={() => navigate('/settings')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="3" x2="10" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="3" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="14" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Settings
        </button>
      </nav>
    </div>
  );
};
