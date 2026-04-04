import React from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean, e?: React.MouseEvent) => void;
  disabled?: boolean;
  label?: string;
  categoryColor?: 'water' | 'food' | 'exercise' | 'bathroom' | 'medicine';
  'aria-labelledby'?: string;
  'aria-label'?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  disabled, 
  label, 
  categoryColor, 
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel
}) => {
  const cn = [
    styles.toggle,
    checked ? styles.checked : '',
    disabled ? styles.disabled : '',
    categoryColor && checked ? styles[`color-${categoryColor}`] : ''
  ].filter(Boolean).join(' ');

  return (
    <label className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        className={cn}
        onClick={(e) => !disabled && onChange(!checked, e)}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        aria-label={label || ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  );
};
