import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const WaterIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L17.3333 10C18.8 12.1333 19.3333 14 18.4 16.4C17.4667 18.6667 14.9333 20.6667 12 20.6667C9.06667 20.6667 6.53333 18.6667 5.6 16.4C4.66667 14 5.2 12.1333 6.66667 10L12 2Z" fill={color} />
  </svg>
);

export const MealIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5.33333 4V9.33333C5.33333 12.2667 7.73333 14.6667 10.6667 14.6667V20H13.3333V14.6667C16.2667 14.6667 18.6667 12.2667 18.6667 9.33333V4H16V8H8V4H5.33333Z" fill={color} />
  </svg>
);

export const ExerciseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="5.33333" r="2.66667" fill={color} />
    <path d="M8 9.33333H16L17.3333 14.6667H6.66667L8 9.33333Z" fill={color} />
    <path d="M9.33333 14.6667L8 21.3333M14.6667 14.6667L16 21.3333M8 17.3333H16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const BathroomIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="5.33333" y="10.6667" width="13.3333" height="10.6667" rx="2.66667" fill={color} />
    <path d="M8 10.6667V6.66667C8 4.45753 9.79086 2.66667 12 2.66667C14.2091 2.66667 16 4.45753 16 6.66667V10.6667" stroke={color} strokeWidth="1.73333" fill="none" />
  </svg>
);

export const MedicineIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="5.33333" y="9.33333" width="13.3333" height="9.33333" rx="2.66667" fill={color} />
    <rect x="9.33333" y="5.33333" width="5.33333" height="4" rx="1.33333" fill={color} />
    <rect x="8.66667" y="13.3333" width="6.66667" height="1.6" rx="0.8" fill="white" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const ChevronIcon: React.FC<IconProps & { rotated?: boolean }> = ({ size = 24, color = 'currentColor', className = '', rotated }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={{ transition: 'transform 0.2s ease', transform: rotated ? 'rotate(180deg)' : 'none' }}
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
