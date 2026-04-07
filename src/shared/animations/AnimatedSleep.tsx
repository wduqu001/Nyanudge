import React from 'react';

/**
 * AnimatedSleep — Mochi-style sleeping cat with slow breathing and floating z's.
 * 
 * Inspired by Cat_exercise.json's (actually "Cat_sleeping") animation:
 *   - body oscillates up/down (breathing rhythm)
 *   - tail sways gently
 *   - z's float up, grow, then fade (staggered, repeating)
 *   - eyes show classic sleep arcs
 * 
 * Color palette from cat_mochi.svg:
 *   body:      #F0EEE8 (warm cream)
 *   details:   #D4D2CC (grey)
 *   ear-inner: #FFD4D4
 *   nose:      #FFB3B3
 *   stroke:    #111827
 */
export const AnimatedSleep: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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

      /* ── Breathing (whole cat group bobs very gently) ── */
      .sleep-body {
        transform-origin: 48px 58px;
        animation: breathe 2.4s ease-in-out infinite;
      }
      @keyframes breathe {
        0%, 100% { transform: translateY(0px) scaleY(1); }
        50%       { transform: translateY(-2px) scaleY(1.02); }
      }

      /* ── Tail sways slowly like the Lottie reference ── */
      .sleep-tail {
        transform-origin: 62px 56px;
        animation: tail-sway 2.4s ease-in-out infinite;
      }
      @keyframes tail-sway {
        0%, 100% { transform: rotate(0deg); }
        50%       { transform: rotate(12deg); }
      }

      /* ── Z letters float up, grow and fade (3 staggered) ── */
      .zzz {
        font-family: sans-serif;
        font-weight: bold;
        fill: #8A8A8A;
        animation: float-z 2.4s ease-out infinite;
        opacity: 0;
      }
      .z1 { animation-delay: 0s;    font-size: 8px; }
      .z2 { animation-delay: 0.8s;  font-size: 10px; }
      .z3 { animation-delay: 1.6s;  font-size: 12px; }

      @keyframes float-z {
        0%   { opacity: 0;   transform: translateY(0px)   scale(0.6); }
        15%  { opacity: 1; }
        70%  { opacity: 0.8; }
        100% { opacity: 0;   transform: translateY(-20px) scale(1.2); }
      }
    `}</style>

    {/* ── Sleeping cat group (breathes) ── */}
    <g className="anim sleep-body">

      {/* Body (curled, lying down) */}
      <ellipse cx="44" cy="64" rx="22" ry="13" fill="#F0EEE8" stroke="#111827" strokeWidth="2" />

      {/* Head resting on body */}
      <circle cx="60" cy="52" r="13" fill="#F0EEE8" stroke="#111827" strokeWidth="2" />

      {/* Left ear (outer) */}
      <polygon points="53,44 50,34 58,40" fill="#F0EEE8" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Left ear (inner) */}
      <polygon points="53.5,43 51.5,36.5 57,40.5" fill="#FFD4D4" />

      {/* Right ear (outer) */}
      <polygon points="66,43 70,34 73,41" fill="#F0EEE8" stroke="#111827" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Right ear (inner) */}
      <polygon points="66.5,42 69.5,35.5 71.5,41" fill="#FFD4D4" />

      {/* Eyes — closed arcs like the big Lottie cat */}
      <path d="M55 52 q2.5 -3 5 0" stroke="#333" strokeWidth="1.8" fill="none" />
      <path d="M63 51 q2.5 -3 5 0" stroke="#333" strokeWidth="1.8" fill="none" />

      {/* Nose */}
      <ellipse cx="61" cy="56" rx="1.5" ry="1" fill="#FFB3B3" />

      {/* Mouth */}
      <path d="M59.5 57.5 Q61 59 62.5 57.5" stroke="#D4D2CC" strokeWidth="1" fill="none" />

      {/* Whiskers */}
      <line x1="63" y1="55" x2="71" y2="53" stroke="#D4D2CC" strokeWidth="0.8" />
      <line x1="63" y1="56.5" x2="71" y2="57" stroke="#D4D2CC" strokeWidth="0.8" />
      <line x1="59" y1="55" x2="51" y2="53" stroke="#D4D2CC" strokeWidth="0.8" />
      <line x1="59" y1="56.5" x2="51" y2="57" stroke="#D4D2CC" strokeWidth="0.8" />

      {/* Tail curled around body */}
      <g className="anim sleep-tail">
        <path
          d="M63 70 Q76 64 74 56"
          stroke="#D4D2CC"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

    </g>

    {/* ── Floating Z's (outside the breathing group so they float independently) ── */}
    <text className="anim zzz z1" x="74" y="46">z</text>
    <text className="anim zzz z2" x="79" y="36">z</text>
    <text className="anim zzz z3" x="76" y="24">z</text>
  </svg>
);
