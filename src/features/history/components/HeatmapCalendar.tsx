import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './HeatmapCalendar.module.css';

interface HeatmapCalendarProps {
  completions: { completedAt: number }[];
  title?: string;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ completions, title }) => {
  const { i18n } = useTranslation();
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  // Create a map of date (YYYY-MM-DD) to count
  const countsByDate = completions.reduce((acc, c) => {
    const d = new Date(c.completedAt);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weekdays = i18n.language.startsWith('pt') 
    ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] 
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const monthName = today.toLocaleString(i18n.language, { month: 'long' });

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.monthLabel}>{monthName} {today.getFullYear()}</div>
      
      <div className={styles.weekdayHeader}>
        {weekdays.map((day, index) => (
          <div key={`${day}-${index}`} className={styles.weekday}>{day}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.emptyDay} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const count = countsByDate[dateKey] || 0;
          const level = Math.min(5, count);

          return (
            <div 
              key={day} 
              className={`${styles.day} ${level > 0 ? styles[`active-${level}`] : ''}`}
              title={`${dateKey}: ${count} completions`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};
