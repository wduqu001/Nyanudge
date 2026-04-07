import React from 'react';

/**
 * AnimatedMeal — a decoupled SVG for the "meal" reminder.
 * Design inspired by Loading_water.json:
 *  - bowl filled via a rising clip (like the water-fill wave)
 *  - food "drop" falls into the bowl with a splat/squish
 *  - ripple ring expands from the impact, then fades
 *  - steam wiggles up with staggered delay
 */
export const AnimatedMeal: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      @media (prefers-reduced-motion: reduce){ .anim { animation: none !important } }

      /* Bowl fill — rises up from 0 to full height */
      .meal-fill {
        transform-origin: 48px 72px;
        animation: meal-rise 0.9s 0.3s cubic-bezier(.22,.68,0,1.2) forwards;
        transform: scaleY(0);
      }
      @keyframes meal-rise {
        0%   { transform: scaleY(0) }
        70%  { transform: scaleY(1.06) }
        100% { transform: scaleY(1) }
      }

      /* Drop falls into bowl */
      .meal-drop {
        animation: meal-drop 0.5s 0s cubic-bezier(.4,0,.6,1) forwards;
        opacity: 1;
      }
      @keyframes meal-drop {
        0%   { transform: translateY(-18px); opacity: 1; }
        80%  { transform: translateY(0px);   opacity: 1; }
        100% { transform: translateY(2px);   opacity: 0; }
      }

      /* Impact ripple */
      .meal-ripple {
        transform-origin: 48px 58px;
        animation: meal-ripple 0.8s 0.35s ease-out forwards;
        opacity: 0;
      }
      @keyframes meal-ripple {
        0%   { transform: scale(0.3); opacity: 0.7; }
        100% { transform: scale(1.4); opacity: 0; }
      }

      /* Steam wisps — staggered */
      .steam {
        stroke: #111827;
        stroke-width: 2;
        animation: steam-rise 1.6s ease-in-out infinite;
        opacity: 0;
      }
      .s1 { animation-delay: 0.9s; }
      .s2 { animation-delay: 1.1s; }
      .s3 { animation-delay: 1.3s; }
      @keyframes steam-rise {
        0%   { opacity: 0;   transform: translateY(0px); }
        20%  { opacity: 1; }
        100% { opacity: 0;   transform: translateY(-14px); }
      }
    `}</style>

    {/* Clip path = inside of bowl */}
    <defs>
      <clipPath id="bowl-clip">
        {/* Elliptical bowl interior */}
        <path d="M20 55 Q48 80 76 55 L74 64 Q65 78 48 78 Q31 78 22 64 Z" />
      </clipPath>
    </defs>

    {/* ── Bowl body ── */}
    <path
      d="M20 55 Q48 80 76 55 L74 64 Q65 78 48 78 Q31 78 22 64 Z"
      fill="#F5F0E8"
      stroke="#111827"
      strokeWidth="2"
    />
    {/* Bowl rim ellipse */}
    <ellipse cx="48" cy="55" rx="28" ry="6" fill="#EDE8DF" stroke="#111827" strokeWidth="2" />

    {/* ── Food fill (clipped, rises from bottom) ── */}
    <g clipPath="url(#bowl-clip)" className="anim">
      {/* Base food color fill */}
      <rect
        x="20" y="50" width="56" height="30"
        fill="#E9A84B"
        className="anim meal-fill"
      />
      {/* A subtle wave on top of the fill for visual interest */}
      <path
        d="M20 62 Q34 58 48 62 Q62 66 76 62"
        fill="none"
        stroke="#D4892A"
        strokeWidth="1.5"
        className="anim meal-fill"
      />
    </g>

    {/* ── Falling food drop ── */}
    <circle
      cx="48"
      cy="44"
      r="5"
      fill="#E9A84B"
      stroke="#111827"
      strokeWidth="1.5"
      className="anim meal-drop"
    />

    {/* ── Impact ripple (expands from impact point) ── */}
    <ellipse
      cx="48" cy="58"
      rx="10" ry="3"
      stroke="#D4892A"
      strokeWidth="1.5"
      fill="none"
      className="anim meal-ripple"
    />

    {/* ── Steam wisps ── */}
    <path className="steam s1 anim" d="M38 50 q3 -5 0 -10" />
    <path className="steam s2 anim" d="M48 48 q3 -5 0 -10" />
    <path className="steam s3 anim" d="M58 50 q3 -5 0 -10" />
  </svg>
);
