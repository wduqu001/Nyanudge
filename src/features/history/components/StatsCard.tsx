import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, subtitle }) => {
  return (
    <div className={styles.card} style={{ borderLeftColor: color }}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
};
