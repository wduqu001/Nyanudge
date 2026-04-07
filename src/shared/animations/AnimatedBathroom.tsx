import React from 'react';

/**
 * AnimatedBathroom — Mochi-style cat in the bathroom.
 */
export const AnimatedBathroom: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 96 96"
    width="100%"
    height="100%"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <style>{`
      @media (prefers-reduced-motion: reduce) { .anim { animation: none !important } }
      .bubble { animation: float-bubble 2s ease-in-out infinite; opacity: 0; }
      .b1 { animation-delay: 0s; }
      .b2 { animation-delay: 0.7s; }
      @keyframes float-bubble {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        50% { opacity: 0.6; }
        100% { transform: translateY(-20px) scale(1.2); opacity: 0; }
      }
    `}</style>
    {/* Body */}
    <ellipse cx="48" cy="62" rx="18" ry="12" fill="#F0EEE8" stroke="#111827" strokeWidth="2" />
    {/* Head */}
    <circle cx="48" cy="42" r="10" fill="#F0EEE8" stroke="#111827" strokeWidth="2" />
    {/* Ears */}
    <polygon points="42,34 38,26 46,31" fill="#F0EEE8" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    <polygon points="54,34 58,26 50,31" fill="#F0EEE8" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Bubbles */}
    <circle className="anim bubble b1" cx="35" cy="40" r="4" stroke="#D4D2CC" />
    <circle className="anim bubble b2" cx="62" cy="35" r="3" stroke="#D4D2CC" />
  </svg>
);
