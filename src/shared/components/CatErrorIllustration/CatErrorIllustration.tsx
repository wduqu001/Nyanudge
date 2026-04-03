import React from 'react';
import styles from './CatErrorIllustration.module.css';

interface CatErrorIllustrationProps {
  className?: string;
}

export const CatErrorIllustration: React.FC<CatErrorIllustrationProps> = ({ className = '' }) => (
  <svg 
    className={`${styles.catSvg} ${className}`} 
    viewBox="0 0 160 160" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g className={styles.catTail}>
      <path d="M118 150 Q138 140 132 122" stroke="#D4D2CC" strokeWidth="9" strokeLinecap="round" fill="none"/>
    </g>

    <g className={styles.catBodyG}>
      <ellipse cx="80" cy="132" rx="44" ry="34" fill="#F0EEE8"/>

      <g className={styles.catEarL}>
        <polygon points="44,54 30,28 58,40" fill="#F0EEE8"/>
        <polygon points="46,52 34,32 56,42" fill="#FFD4D4"/>
      </g>
      <g className={styles.catEarR}>
        <polygon points="116,54 130,28 102,40" fill="#F0EEE8"/>
        <polygon points="114,52 126,32 104,42" fill="#FFD4D4"/>
      </g>

      <circle cx="80" cy="76" r="40" fill="#F0EEE8"/>

      <g transform="rotate(18, 80, 76)">
        <circle cx="80" cy="76" r="40" fill="#F0EEE8"/>
        <path d="M60 71 Q63 76 66 71" stroke="#2A2A2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M94 71 Q97 76 100 71" stroke="#2A2A2A" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <line x1="55" y1="71" x2="71" y2="71" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="89" y1="71" x2="105" y2="71" stroke="#2A2A2A" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="62" cy="68" r="1.8" fill="#2A2A2A" opacity="0.5"/>
        <circle cx="98" cy="68" r="1.8" fill="#2A2A2A" opacity="0.5"/>
        <ellipse cx="80" cy="82" rx="4" ry="3" fill="#FFB3B3"/>
        <path d="M73 87 Q80 83 87 87" stroke="#C0BEB8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <line x1="82" y1="82" x2="98" y2="78" stroke="#C0BEB8" strokeWidth="1"/>
        <line x1="82" y1="84" x2="98" y2="86" stroke="#C0BEB8" strokeWidth="1"/>
        <line x1="78" y1="82" x2="62" y2="78" stroke="#C0BEB8" strokeWidth="1"/>
        <line x1="78" y1="84" x2="62" y2="86" stroke="#C0BEB8" strokeWidth="1"/>
      </g>
    </g>
  </svg>
);
