import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStatsStore } from '../../core/store/statsStore';
import { useRemindersStore } from '../../core/store/remindersStore';
import { HeatmapCalendar } from './components/HeatmapCalendar';
import { StatsCard } from './components/StatsCard';
import { ChevronLeft, Flame, Target, Trophy, ClipboardList } from 'lucide-react';
import styles from './HistoryScreen.module.css';

export const HistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { stats, recentCompletions } = useStatsStore();
  const { reminders } = useRemindersStore();

  // Aggregate stats across all categories
  const totalStreaks = Object.values(stats).reduce((acc, s) => acc + s.currentStreak, 0);
  const bestStreak = Object.values(stats).reduce((acc, s) => Math.max(acc, s.longestStreak), 0);
  const totalCompletions = recentCompletions.length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ChevronLeft size={24} />
        </button>
        <div className={styles.headerText}>
          <h1>{t('history.title')}</h1>
          <p>{t('history.subtitle')}</p>
        </div>
      </header>

      {/* Stats Summary */}
      <section className={styles.statsGrid}>
        <StatsCard 
          label={t('history.current_streak')} 
          value={totalStreaks} 
          icon={<Flame size={20} color="#ff7e5f" />}
          color="#ff7e5f"
        />
        <StatsCard 
          label={t('history.streak_record')} 
          value={bestStreak} 
          icon={<Trophy size={20} color="#feb47b" />}
          color="#feb47b"
        />
        <StatsCard 
          label={t('history.total_completions')} 
          value={totalCompletions} 
          icon={<Target size={20} color="#6a11cb" />}
          color="#6a11cb"
        />
      </section>

      {/* Heatmap */}
      <HeatmapCalendar 
        completions={recentCompletions} 
        title={t('history.heatmap_title')} 
      />

      {/* Per-Category Stats */}
      <section className={styles.categorySection}>
        <div className={styles.sectionHeader}>
          <Target size={20} />
          <h3>{t('history.category_stats_title')}</h3>
        </div>
        <div className={styles.categoryList}>
          {Object.entries(stats).map(([category, data]) => (
            <div key={category} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryName}>{t(`categories.${category}.name`)}</span>
                <span className={styles.categoryStreak}>
                  <Flame size={14} style={{ marginRight: 4 }} />
                  {data.currentStreak}d
                </span>
              </div>
              <div className={styles.categoryMetric}>
                <span>{t('history.streak_record')}: {data.longestStreak}d</span>
                <span>{Math.round(data.completionRateLast7Days * 100)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ 
                    width: `${data.completionRateLast7Days * 100}%`,
                    backgroundColor: `var(--cat-${category}, #6a11cb)`
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <ClipboardList size={20} />
          <h3>{t('history.recent_title')}</h3>
        </div>
        
        {recentCompletions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('history.no_data')}</p>
          </div>
        ) : (
          <div className={styles.logList}>
            {recentCompletions.slice(0, 10).map((log) => {
              const reminder = reminders.find(r => r.id === log.reminderId);
              const date = new Date(log.completedAt);
              return (
                <div key={log.id} className={styles.logItem}>
                  <div className={styles.logInfo}>
                    <span className={styles.logCategory}>{t(`categories.${log.category}.name`)}</span>
                    <span className={styles.logLabel}>
                      {reminder && reminder.label === t(`categories.${reminder.category}.name`, { lng: 'en' }) 
                        ? t(`categories.${reminder.category}.name`) 
                        : reminder?.label || log.category}
                    </span>
                  </div>
                  <div className={styles.logTime}>
                    {date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
