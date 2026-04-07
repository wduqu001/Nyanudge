import React from 'react';

/**
 * AnimatedMedicine — a decoupled SVG for the "medicine" reminder.
 * Inspired by Loading_water.json's approach:
 *  - pill bounces in (like the drop falling)
 *  - ring ripple expands from center (like the water impact ellipse)
 *  - checkmark draws in with stroke-dashoffset trick
 *  - two-tone pill fill slides in via clip, mirroring the water-fill wave
 */
export const AnimatedMedicine: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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

      /* Pill group pops in with spring overshoot */
      .pill-group {
        transform-origin: 48px 46px;
        animation: pill-pop 0.7s cubic-bezier(.22, 1, .36, 1) forwards;
        transform: scale(0.6);
        opacity: 0;
      }
      @keyframes pill-pop {
        0%   { transform: scale(0.6) translateY(-8px); opacity: 0; }
        60%  { transform: scale(1.1) translateY(0px);  opacity: 1; }
        100% { transform: scale(1)   translateY(0px);  opacity: 1; }
      }

      /* Right half fill slides in from right (like water-fill) */
      .pill-fill-right {
        clip-path: inset(0 0 0 50%);
        animation: fill-slide 0.4s 0.5s ease-out forwards;
        transform: scaleX(0);
        transform-origin: right center;
      }
      @keyframes fill-slide {
        0%  { clip-path: inset(0 100% 0 50%); }
        100%{ clip-path: inset(0 0%   0 50%); }
      }

      /* Ring ripple expands from pill center — mirrors the water impact ring */
      .pill-ripple {
        transform-origin: 48px 46px;
        animation: pill-ripple 0.9s 0.55s ease-out forwards;
        opacity: 0;
      }
      @keyframes pill-ripple {
        0%   { transform: scale(0.5); opacity: 0.8; }
        100% { transform: scale(1.6); opacity: 0; }
      }

      /* Checkmark draws on via stroke-dashoffset */
      .check {
        stroke-dasharray: 28;
        stroke-dashoffset: 28;
        animation: check-draw 0.5s 0.8s cubic-bezier(.4,0,.2,1) forwards;
      }
      @keyframes check-draw { to { stroke-dashoffset: 0; } }
    `}</style>

    <defs>
      {/* Clip to left half of pill rect */}
      <clipPath id="pill-left-clip">
        <rect x="32" y="38" width="16" height="16" />
      </clipPath>
      {/* Clip to right half */}
      <clipPath id="pill-right-clip">
        <rect x="48" y="38" width="16" height="16" />
      </clipPath>
    </defs>

    {/* ── Pill group (bounces in) ── */}
    <g className="anim pill-group">
      {/* Pill outline */}
      <rect
        x="32" y="40" width="32" height="12" rx="6"
        fill="#F0F0F0"
        stroke="#111827"
        strokeWidth="2"
      />

      {/* Left half — static warm color */}
      <rect
        x="32" y="40" width="16" height="12"
        rx="6"
        fill="#D65B5B"
        clipPath="url(#pill-left-clip)"
      />

      {/* Right half — white, slides in */}
      <rect
        x="48" y="40" width="16" height="12"
        rx="6"
        fill="#FFFFFF"
        clipPath="url(#pill-right-clip)"
        className="anim pill-fill-right"
      />

      {/* Centre divider line */}
      <line
        x1="48" y1="40" x2="48" y2="52"
        stroke="#111827"
        strokeWidth="2"
      />

      {/* Pill outline on top so divider doesn't bleed past border */}
      <rect
        x="32" y="40" width="32" height="12" rx="6"
        fill="none"
        stroke="#111827"
        strokeWidth="2"
      />
    </g>

    {/* ── Ring ripple from pill center ── */}
    <ellipse
      cx="48" cy="46"
      rx="18" ry="7"
      stroke="#D65B5B"
      strokeWidth="1.5"
      fill="none"
      className="anim pill-ripple"
    />

    {/* ── Checkmark draws in below the pill ── */}
    <path
      d="M36 64 l6 6 l14 -16"
      stroke="#5DAA62"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      className="anim check"
    />
  </svg>
);
