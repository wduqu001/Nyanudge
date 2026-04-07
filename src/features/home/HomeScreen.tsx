import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRemindersStore } from '../../core/store/remindersStore';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { useStatsStore } from '../../core/store/statsStore';
import { calculateNextFireTime } from '../../core/notifications/scheduler';

import { Card } from '../../shared/components/Card/Card';
import { Toggle } from '../../shared/components/Toggle/Toggle';
import { FAB } from '../../shared/components/FAB/FAB';
import { BottomNav } from '../../shared/components/BottomNav/BottomNav';
import { AnimatedCatMochi } from '../../shared/components/AnimatedCatMochi/AnimatedCatMochi';
import { AnimatedCatKuro } from '../../shared/components/KuroCat/AnimatedCatKuro';
import { CatSora } from '../../shared/components/SoraCat/CatSora';
import { CogIcon, MenuIcon, WaterIcon, MealIcon, ExerciseIcon, BathroomIcon, MedicineIcon } from '../../shared/components/Icons';
import { formatLocalizedTime } from '../../shared/utils/dateUtils';
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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { reminders, toggleReminder } = useRemindersStore();
  const { preferences } = usePreferencesStore();
  const { stats } = useStatsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Calculate max current streak across all categories
  const statsList = Object.values(stats);
  const maxStreak = statsList.length > 0 
    ? Math.max(...statsList.map(s => s.currentStreak)) 
    : 0;

  const handleToggle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    toggleReminder(id);
  };

  // Find the next upcoming reminder
  const nextReminderInfo = React.useMemo(() => {
    let earliestDate: Date | null = null;
    let nextReminder: Reminder | null = null;

    reminders.forEach(r => {
      if (!r.enabled || r.archived) return;
      r.schedules.forEach(s => {
        const fire = calculateNextFireTime(s);
        if (fire && (!earliestDate || fire < earliestDate)) {
          earliestDate = fire;
          nextReminder = r;
        }
      });
    });

    if (!earliestDate || !nextReminder) return null;

    const diffMs = (earliestDate as Date).getTime() - Date.now();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    let timeStr = '';
    if (diffMins < 1) {
      timeStr = t('home.now', 'Now');
    } else if (diffMins < 60) {
      timeStr = `${diffMins} ${t('edit_reminder.minutes')}`;
    } else if (diffMins < 1440) { // Less than a day
      const hours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      timeStr = remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    } else {
      const days = Math.floor(diffMins / 1440);
      timeStr = `${days}d+`;
    }

    return {
      reminder: nextReminder as Reminder,
      timeStr
    };
  }, [reminders, t]);

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatSchedule = (reminder: Reminder) => {
    if (!reminder.enabled) return t('actions.disabled');
    const schedule = reminder.schedules && reminder.schedules[0];
    if (!schedule) return 'No schedule';
    
    if (schedule.type === 'interval') {
      const start = formatLocalizedTime(schedule.startTime, i18n.language);
      const end = formatLocalizedTime(schedule.endTime, i18n.language);
      return `${t('actions.every')} ${schedule.timeValue} ${t('edit_reminder.minutes')} · ${start}-${end}`;
    } else {
      const atTime = formatLocalizedTime(schedule.timeValue, i18n.language);
      return `${t('actions.at')} ${atTime}`;
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <button className="icon-button" aria-label={t('aria.menu')} onClick={() => navigate('/history')}>
          <MenuIcon size={16} />
        </button>
        <h1 className="home-title">{t('app.name', 'NyaNudge')}</h1>
        <button className="icon-button" aria-label={t('aria.settings')} onClick={() => navigate('/settings')}>
          <CogIcon size={16} />
        </button>
      </header>

      <section className="hero-section">
        <div className="hero-cat-container">
          {preferences.character === 'mochi' && <AnimatedCatMochi />}
          {preferences.character === 'kuro'  && <AnimatedCatKuro />}
          {preferences.character === 'sora'  && <CatSora />}
        </div>

        {nextReminderInfo ? (
          <>
            <div className="next-up-pill">{t('home.next_up', { time: nextReminderInfo.timeStr })}</div>
            <div className="hero-copy">
              {nextReminderInfo.reminder.label === t(`categories.${nextReminderInfo.reminder.category}.name`, { lng: 'en' }) 
                ? t(`categories.${nextReminderInfo.reminder.category}.name`) 
                : nextReminderInfo.reminder.label}
            </div>
          </>
        ) : (
          <div className="hero-copy">{t('home.no_reminders', 'No active reminders')}</div>
        )}
        
        <div className="hero-sub">{t('home.hero_sub', { name: preferences.character.charAt(0).toUpperCase() + preferences.character.slice(1) })}</div>
      </section>

      {maxStreak > 0 && (
        <section className="streak-banner">
          🔥 <span>{t('home.streak_message', { count: maxStreak })}</span>
        </section>
      )}

      <div className="section-label">{t('home.reminders_title')}</div>

      <section className="reminders-list">
        {reminders.filter(r => !r.archived).map((reminder: Reminder) => {
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
              aria-expanded={expandedId === reminder.id}
              aria-label={reminder.label}
            >
              <div className="reminder-card-main">
                <div className="reminder-card-content">
                  <div className="reminder-card-icon" style={{ background: bgConfig }} aria-hidden="true">
                    <CategoryIcon category={reminder.category} enabled={enabled} />
                  </div>
                  <div className="reminder-card-text">
                    <h3 id={`label-${reminder.id}`} style={{ color: textColor }}>
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
                      aria-labelledby={`label-${reminder.id}`}
                    />
                  </div>
                </div>
              </div>
              
              {expandedId === reminder.id && (
                  <div className="reminder-card-expanded">
                  <div className="expanded-divider" />
                  <div className="quick-actions">
                    {reminder.enabled && (
                      <div className="quick-info">
                        <span className="quick-label">{t('home.quick_edit.next_fire')}</span>
                        <span className="quick-value">
                          {formatLocalizedTime(reminder.schedules[0]?.timeValue || '08:00', i18n.language)} {t('actions.today')}
                        </span>
                      </div>
                    )}
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

      <FAB onClick={() => navigate('/reminder/new')} aria-label={t('aria.add_reminder')} />

      <BottomNav />
    </div>
  );
};
