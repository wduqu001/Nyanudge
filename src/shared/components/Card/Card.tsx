import React, { type ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: ReactNode;
  categoryColor?: 'water' | 'food' | 'exercise' | 'bathroom' | 'medicine';
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  categoryColor,
  onClick,
  className = '',
}) => {
  const isClickable = !!onClick;
  const cn = [
    styles.card,
    isClickable ? styles.clickable : '',
    categoryColor ? styles[`border-${categoryColor}`] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cn} onClick={onClick} role={isClickable ? 'button' : undefined} tabIndex={isClickable ? 0 : undefined}>
      {children}
    </div>
  );
};
