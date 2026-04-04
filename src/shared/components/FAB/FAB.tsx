import React from 'react';
import styles from './FAB.module.css';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export const FAB: React.FC<FABProps> = ({ icon, className = '', ...props }) => {
  return (
    <button className={`${styles.fab} ${className}`} {...props}>
      {icon ? icon : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )}
    </button>
  );
};
