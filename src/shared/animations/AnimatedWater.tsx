import React from 'react';

/**
 * AnimatedWater is a decoupled SVG animation representing the "water" task.
 * Note: Provide a wrapper div to constrain width/height since it's a fixed viewBox.
 */
export const AnimatedWater: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 96 96" 
    width="100%" 
    height="100%" 
    fill="none" 
    stroke="#111827" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <style>
      {`
      @media (prefers-reduced-motion: reduce){
        .anim { animation: none !important }
      }
      .water { transform-origin:48px 60px; animation: rise 1.4s ease-out forwards }
      .b1 { animation: bubble 1.4s ease-out forwards }
      .ripple { animation: ripple 1.4s ease-out forwards }
      @keyframes rise {0%{transform:scaleY(.7)}60%{transform:scaleY(1.05)}100%{transform:scaleY(1)}}
      @keyframes bubble {0%{opacity:0; transform:translateY(6px)}40%{opacity:1}100%{opacity:0; transform:translateY(-10px)}}
      @keyframes ripple {0%{opacity:.6; transform:scale(.7)}100%{opacity:0; transform:scale(1.3)}}
      `}
    </style>

    <path d="M34 26 h28 l-3 42 a8 8 0 0 1 -8 6 h-6 a8 8 0 0 1 -8 -6 z"/>
    <clipPath id="c">
      <path d="M34 26 h28 l-3 42 a8 8 0 0 1 -8 6 h-6 a8 8 0 0 1 -8 -6 z"/>
    </clipPath>

    <g clipPath="url(#c)">
      <rect x="34" y="48" width="28" height="24" fill="#3B82F6" className="anim water"/>
      <circle cx="46" cy="56" r="1.5" fill="#3B82F6" className="anim b1"/>
    </g>

    <ellipse cx="48" cy="48" rx="10" ry="3" stroke="#3B82F6" className="anim ripple"/>
  </svg>
);
