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
import { LocalNotifications, type PendingResult } from '@capacitor/local-notifications';
import { BottomNav } from '../../shared/components/BottomNav/BottomNav';
import { AnimatedCatMochi } from '../../shared/components/AnimatedCatMochi/AnimatedCatMochi';
import { AnimatedCatKuro } from '../../shared/components/KuroCat/AnimatedCatKuro';
import { CatSora } from '../../shared/components/SoraCat/CatSora';
import { CogIcon, MenuIcon, WaterIcon, MealIcon, ExerciseIcon, BathroomIcon, MedicineIcon } from '../../shared/components/Icons';
import { formatLocalizedTime, formatDuration, formatNextFire } from '../../shared/utils/dateUtils';
import { DebugPanel } from './DebugPanel';
import { useBackHandler } from '../../shared/hooks/useBackHandler';
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

function nextFireOf(r: Reminder): Date | null {
  const cleanAnchor = Math.floor(Math.max(r.updatedAt || 0, r.createdAt || 0) / 60000) * 60000;
  let earliest: Date | null = null;
  r.schedules.forEach(s => {
    const fire = calculateNextFireTime(s, cleanAnchor);
    if (fire && (!earliest || fire < earliest)) earliest = fire;
  });
  return earliest;
}

export const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { reminders, toggleReminder, completeReminder, pendingNotifAction, setPendingNotifAction, snoozedUntil, snooze, refreshSnoozes } = useRemindersStore();
  const { preferences } = usePreferencesStore();
  const { stats } = useStatsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useBackHandler(expandedId !== null, () => setExpandedId(null));
  useBackHandler(pendingNotifAction !== null, () => setPendingNotifAction(null));
  const [pendingNotifs, setPendingNotifs] = useState<PendingResult | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  React.useEffect(() => {
    refreshSnoozes();
  }, [refreshSnoozes]);

  /** Active snooze time for a reminder, if one is still pending. */
  const snoozeOf = (r: Reminder): Date | null =>
    snoozedUntil[r.id] && snoozedUntil[r.id]! > currentTime ? new Date(snoozedUntil[r.id]!) : null;

  /** The sooner of the snooze and the next scheduled fire. */
  const upcomingOf = (r: Reminder): Date | null => {
    const fire = nextFireOf(r);
    const snoozed = snoozeOf(r);
    if (!fire || !snoozed) return fire ?? snoozed;
    return fire < snoozed ? fire : snoozed;
  };

  // Re-calculate "Next Up" every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
      const fire = upcomingOf(r);
      if (fire && (!earliestDate || fire < earliestDate)) {
        earliestDate = fire;
        nextReminder = r;
      }
    });

    if (!earliestDate || !nextReminder) return null;

    const diffMs = (earliestDate as Date).getTime() - currentTime;
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    let timeStr = '';
    if (diffMins < 1) {
      timeStr = t('home.now', 'Now');
    } else {
      timeStr = formatDuration(diffMins, i18n.language);
    }

    return {
      reminder: nextReminder as Reminder,
      timeStr
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- upcomingOf reads snoozedUntil and currentTime, both listed
  }, [reminders, t, currentTime, i18n.language, snoozedUntil]);

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatSchedule = (reminder: Reminder) => {
    if (!reminder.enabled) return t('actions.disabled');
    const snoozed = snoozeOf(reminder);
    if (snoozed) return t('home.snoozed_until', { time: formatNextFire(snoozed, new Date(currentTime), i18n.language) });
    const schedule = reminder.schedules && reminder.schedules[0];
    if (!schedule) return t('home.no_schedule');
    
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
        <h1 className="home-title" onClick={import.meta.env.DEV ? async () => {
          const pending = await LocalNotifications.getPending();
          setPendingNotifs(pending);
          setTimeout(() => setPendingNotifs(null), 10000); // Hide after 10s
        } : undefined}>{t('app.name', 'NyaNudge')}</h1>
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

      {import.meta.env.DEV && pendingNotifs && (
        <DebugPanel pendingNotifs={pendingNotifs} setPendingNotifs={setPendingNotifs} />
      )}

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

          const displayLabel = reminder.label === t(`categories.${reminder.category}.name`, { lng: 'en' })
            ? t(`categories.${reminder.category}.name`)
            : reminder.label;
          const textColor = enabled ? 'var(--text-primary)' : 'var(--text-muted)';
          const subtextColor = enabled ? 'var(--text-secondary)' : 'var(--text-muted)';

          return (
            <Card
              key={reminder.id}
              className={`reminder-card ${expandedId === reminder.id ? 'expanded' : ''}`}
              categoryColor={enabled ? categoryColorMapping[reminder.category] : undefined}
            >
              <div className="reminder-card-main">
                <div className="reminder-card-content">
                  {/* The toggle sits beside, not inside, the expand button: controls must not nest. */}
                  <button
                    type="button"
                    className="reminder-card-expand"
                    onClick={() => handleCardClick(reminder.id)}
                    aria-expanded={expandedId === reminder.id}
                    aria-label={displayLabel}
                    aria-describedby={`schedule-${reminder.id}`}
                  >
                    <span className="reminder-card-icon" style={{ background: bgConfig }} aria-hidden="true">
                      <CategoryIcon category={reminder.category} enabled={enabled} />
                    </span>
                    <span className="reminder-card-text">
                      <span className="reminder-card-title" id={`label-${reminder.id}`} style={{ color: textColor }}>
                        {displayLabel}
                      </span>
                      <span className="reminder-card-schedule" id={`schedule-${reminder.id}`} style={{ color: subtextColor }}>
                        {formatSchedule(reminder)}
                      </span>
                    </span>
                  </button>
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
                    {(() => {
                      const next = reminder.enabled ? upcomingOf(reminder) : null;
                      return next && (
                        <div className="quick-info">
                          <span className="quick-label">{t('home.quick_edit.next_fire')}</span>
                          <span className="quick-value">{formatNextFire(next, new Date(currentTime), i18n.language)}</span>
                        </div>
                      );
                    })()}
                    <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                      <button 
                        className="complete-button"
                        style={{ 
                          flex: 1, 
                          background: 'var(--accent)', 
                          color: 'var(--color-neutral-900)', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '20px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          completeReminder(reminder.id);
                        }}
                      >
                        {t('actions.done', 'Done')}
                      </button>
                      <button 
                        className="edit-full-button"
                        style={{ flex: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reminder/${reminder.id}`);
                        }}
                      >
                        {t('actions.edit_full', 'Edit Settings')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </section>

      <FAB onClick={() => navigate('/reminder/new')} aria-label={t('aria.add_reminder')} />

      {/* ── Notification tap action sheet ──────────────────────────────── */}
      {pendingNotifAction && (() => {
        const rem = reminders.find(r => r.id === pendingNotifAction.reminderId);
        const catColor = rem ? CATEGORY_COLORS[rem.category] : 'var(--accent)';
        return (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setPendingNotifAction(null)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 200,
                animation: 'fadeIn 0.2s ease'
              }}
            />
            {/* Sheet */}
            <div role="dialog" aria-modal="true" aria-labelledby="notif-sheet-title" style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: 'var(--surface-bg)',
              borderRadius: '20px 20px 0 0',
              padding: '24px 24px 40px',
              zIndex: 201,
              boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
              animation: 'slideUp 0.28s cubic-bezier(.22,1,.36,1)'
            }}>
              {/* Handle bar */}
              <div style={{ width: 40, height: 4, background: 'var(--border-subtle)', borderRadius: 2, margin: '0 auto 20px' }} />

              {/* Reminder label */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: `${catColor}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px'
                }}>
                  {rem && <CategoryIcon category={rem.category} enabled />}
                </div>
                <p id="notif-sheet-title" style={{ margin: 0, fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                  {pendingNotifAction.label}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {t('home.notif_action_subtitle')}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => {
                    completeReminder(pendingNotifAction.reminderId);
                    setPendingNotifAction(null);
                  }}
                  style={{
                    padding: '14px 0',
                    borderRadius: 14,
                    border: 'none',
                    background: catColor,
                    color: 'var(--color-neutral-900)',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  ✓ {t('actions.done')}
                </button>

                <button
                  onClick={() => {
                    if (rem) snooze(rem.id).catch(() => {});
                    setPendingNotifAction(null);
                  }}
                  style={{
                    padding: '14px 0',
                    borderRadius: 14,
                    border: '1.5px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  ⏱ {t('home.notif_next_time')}
                </button>

                <button
                  onClick={() => setPendingNotifAction(null)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 14,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  {t('actions.cancel')}
                </button>
              </div>
            </div>
          </>
        );
      })()}

      <BottomNav />
    </div>
  );
};
