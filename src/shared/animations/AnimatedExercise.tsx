import React from 'react';

/**
 * AnimatedExercise — Mochi-style cat running animation.
 * 
 * Color palette from cat_mochi.svg:
 *   body:      #F0EEE8 (warm cream)
 *   details:   #D4D2CC (grey tail/whiskers)
 *   ear-inner: #FFD4D4 (pink)
 *   nose:      #FFB3B3
 *   eyes:      #333
 *   stroke:    #111827
 * 
 * Animation sequence:
 *  - Body bobs up/down (running bounce)
 *  - Legs alternate like a stride
 *  - Tail swings back
 *  - Speed lines dash past
 *  - Paw print stamps on ground on final frame
 */
export const AnimatedExercise: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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

      /* ── Body bob (runs up-down continuously) ── */
      .run-body {
        transform-origin: 48px 52px;
        animation: run-bob 0.5s ease-in-out infinite;
      }
      @keyframes run-bob {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-3px); }
      }

      /* ── Front leg swing ── */
      .leg-front {
        transform-origin: 45px 60px;
        animation: leg-front-swing 0.5s ease-in-out infinite;
      }
      @keyframes leg-front-swing {
        0%, 100% { transform: rotate(-18deg); }
        50%       { transform: rotate(18deg); }
      }

      /* ── Back leg swing (opposite phase) ── */
      .leg-back {
        transform-origin: 36px 60px;
        animation: leg-back-swing 0.5s ease-in-out infinite;
      }
      @keyframes leg-back-swing {
        0%, 100% { transform: rotate(18deg); }
        50%       { transform: rotate(-18deg); }
      }

      /* ── Tail swings back ── */
      .run-tail {
        transform-origin: 29px 52px;
        animation: tail-swing 0.5s ease-in-out infinite;
      }
      @keyframes tail-swing {
        0%, 100% { transform: rotate(-8deg); }
        50%       { transform: rotate(8deg); }
      }

      /* ── Speed lines slide left and fade ── */
      .speed-line {
        animation: speed-dash 0.6s linear infinite;
      }
      .sl2 { animation-delay: -0.2s; }
      .sl3 { animation-delay: -0.4s; }
      @keyframes speed-dash {
        0%   { transform: translateX(0px);   opacity: 0.8; }
        100% { transform: translateX(-14px); opacity: 0; }
      }

      /* ── Ear twitch ── */
      .run-ear {
        transform-origin: 56px 32px;
        animation: ear-twitch 1s ease-in-out infinite;
      }
      @keyframes ear-twitch {
        0%, 80%, 100% { transform: rotate(0deg); }
        85%            { transform: rotate(-5deg); }
        92%            { transform: rotate(3deg); }
      }
    `}</style>

    {/* ── Running body group ── */}
    <g className="anim run-body">

      {/* Tail (behind body, swings back) */}
      <path
        className="anim run-tail"
        d="M30 52 Q18 44 20 36"
        stroke="#D4D2CC"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Back leg */}
      <g className="anim leg-back">
        <line x1="36" y1="62" x2="32" y2="72" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="72" x2="28" y2="72" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Body ellipse */}
      <ellipse cx="42" cy="56" rx="16" ry="11" fill="#F0EEE8" stroke="#111827" strokeWidth="2" />

      {/* Front leg */}
      <g className="anim leg-front">
        <line x1="46" y1="62" x2="50" y2="72" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="72" x2="55" y2="72" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Head */}
      <circle cx="55" cy="40" r="12" fill="#F0EEE8" stroke="#111827" strokeWidth="2" />

      {/* Left ear (outer) */}
      <polygon points="47,32 44,23 52,28" fill="#F0EEE8" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Left ear (inner) */}
      <polygon points="47.5,31 45.5,25 51,28.5" fill="#FFD4D4" />

      {/* Right ear (outer) — twitches */}
      <g className="anim run-ear">
        <polygon points="61,32 64,22 69,29" fill="#F0EEE8" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
        <polygon points="61.5,31 64,24.5 67.5,29" fill="#FFD4D4" />
      </g>

      {/* Eyes (closed, mid-run squint) */}
      <path d="M51 39 q2 -2 4 0" stroke="#333" strokeWidth="1.5" fill="none" />
      <path d="M58 38 q2 -2 4 0" stroke="#333" strokeWidth="1.5" fill="none" />

      {/* Nose */}
      <ellipse cx="55" cy="43" rx="1.5" ry="1" fill="#FFB3B3" />

      {/* Mouth (happy run smile) */}
      <path d="M53 44.5 Q55 46.5 57 44.5" stroke="#D4D2CC" strokeWidth="1" fill="none" />

      {/* Whiskers */}
      <line x1="57" y1="42" x2="65" y2="41" stroke="#D4D2CC" strokeWidth="0.8" />
      <line x1="57" y1="43" x2="65" y2="44" stroke="#D4D2CC" strokeWidth="0.8" />
      <line x1="53" y1="42" x2="45" y2="41" stroke="#D4D2CC" strokeWidth="0.8" />
      <line x1="53" y1="43" x2="45" y2="44" stroke="#D4D2CC" strokeWidth="0.8" />
    </g>

    {/* ── Ground line ── */}
    <line x1="14" y1="74" x2="82" y2="74" stroke="#D4D2CC" strokeWidth="1.5" />

    {/* ── Speed lines (appear behind the cat) ── */}
    <line className="anim speed-line"     x1="14" y1="46" x2="26" y2="46" stroke="#E97B22" strokeWidth="1.5" strokeLinecap="round" />
    <line className="anim speed-line sl2" x1="12" y1="51" x2="22" y2="51" stroke="#E97B22" strokeWidth="1.5" strokeLinecap="round" />
    <line className="anim speed-line sl3" x1="14" y1="55" x2="24" y2="55" stroke="#E97B22" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
