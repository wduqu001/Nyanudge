import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemindersStore } from '../../core/store/remindersStore';
import type { Category, Reminder } from '../../types/nyanudge';
import { Card } from '../../shared/components/Card/Card';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { LottiePlayer } from '../../shared/animations';
import { 
  WaterIcon, 
  MealIcon, 
  ExerciseIcon, 
  BathroomIcon, 
  MedicineIcon 
} from '../../shared/components/Icons';
import './HomeScreen.css';

const CategoryIcon = ({ category, enabled }: { category: Category, enabled: boolean }) => {
  const color = enabled ? CATEGORY_COLORS[category] : '#A09E98';

  switch (category) {
    case 'water':    return <WaterIcon size={18} color={color} />;
    case 'meal':     return <MealIcon size={18} color={color} />;
    case 'exercise': return <ExerciseIcon size={18} color={color} />;
    case 'bathroom': return <BathroomIcon size={18} color={color} />;
    case 'medicine': return <MedicineIcon size={18} color={color} />;
    default:         return null;
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

  const handleToggle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleReminder(id);
  };

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatSchedule = (reminder: Reminder) => {
    if (!reminder.enabled) return t('actions.disabled');
    const schedule = reminder.schedules && reminder.schedules[0];
    if (!schedule) return 'No schedule';
    
    if (schedule.type === 'interval') {
      return `${t('actions.every')} ${schedule.timeValue} ${t('edit_reminder.minutes')} · ${schedule.startTime}-${schedule.endTime}`;
    } else {
      return `${t('actions.at')} ${schedule.timeValue}`;
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
        <div className="next-up-pill">{t('home.next_up', { time: '14 min' })}</div>
        <div className="hero-copy">{t('categories.water.name')}</div>
        <div className="hero-sub">{t('home.hero_sub', { name: 'Mochi' })}</div>
      </section>

      <section className="streak-banner">
        🔥 <span>{t('home.streak_message', { count: 3 })}</span>
      </section>

      <div className="section-label">{t('home.reminders_title')}</div>

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
                    <h3 style={{ color: textColor }}>
                      {reminder.label === t(`categories.${reminder.category}.name`, { lng: 'en' }) 
                        ? t(`categories.${reminder.category}.name`) 
                        : reminder.label}
                    </h3>
                    <p style={{ color: subtextColor }}>
                      {formatSchedule(reminder)}
                    </p>
                  </div>
                  <div className="reminder-card-toggle">
                    <Toggle
                      checked={reminder.enabled}
                      onChange={(_, e) => handleToggle(reminder.id, e)}
                      categoryColor={categoryColorMapping[reminder.category]}
                    />
                  </div>
                </div>
              </div>
              
              {expandedId === reminder.id && (
                <div className="reminder-card-expanded">
                  <div className="expanded-divider" />
                  <div className="quick-actions">
                    <div className="quick-info">
                      <span className="quick-label">{t('home.quick_edit.next_fire')}</span>
                      <span className="quick-value">3:30 PM {t('actions.today')}</span>
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
          {t('home.nav.home')}
        </button>
        <button className="nav-item" onClick={() => navigate('/history')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="13" y1="2" x2="13" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="3" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1" />
          </svg>
          {t('home.nav.history')}
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
          {t('home.nav.settings')}
        </button>
      </nav>
    </div>
  );
};
