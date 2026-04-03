import React, { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export interface NyaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const NyaButton: React.FC<NyaButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const cn = [styles.button, styles[variant], fullWidth ? styles.fullWidth : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cn} {...props}>
      {children}
    </button>
  );
};
