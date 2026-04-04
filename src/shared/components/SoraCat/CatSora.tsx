import React from "react";
import styles from "./CatSora.module.css";

/**
 * CatSora — sleek grey tabby cat, calm and reassuring.
 * Personality: composed, dependable, zen.
 *
 * This is a static (non-animated) component intentionally.
 * Sora's stillness is the point — she's the "just breathe" character.
 * Used in contexts where animation would be distracting:
 *   - Settings screen avatar
 *   - Premium character select card
 *   - Error states where calm is needed
 *
 * To animate Sora later, see AnimatedCatMochi.tsx for the pattern.
 */
export const CatSora: React.FC = () => {
  return (
    <div className={styles.catWrapper}>
      <svg className={styles.catSvg} viewBox="0 0 72 72">

        {/* ── Tail — curves gently, resting position ── */}
        <path
          d="M50 54 Q62 50 58 40"
          stroke="#9B9892"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Body ──────────────────────────────────── */}
        <ellipse cx="36" cy="48" rx="20" ry="16" fill="#CCCAC4" />

        {/* ── Tabby body stripes ──────────────────── */}
        <path d="M22 44 Q28 42 34 44"   stroke="#A09E98" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M20 48 Q27 46 33 48"   stroke="#A09E98" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M38 44 Q44 42 50 44"   stroke="#A09E98" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M39 48 Q45 46 52 48"   stroke="#A09E98" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* ── Ears ─────────────────────────────────── */}
        {/* Left ear */}
        <polygon points="18,14 12,4 24,10" fill="#CCCAC4" />
        <polygon points="19,13 14,6 23,10" fill="#E8C4C4" />
        {/* Right ear */}
        <polygon points="54,14 60,4 48,10" fill="#CCCAC4" />
        <polygon points="53,13 58,6 49,10" fill="#E8C4C4" />

        {/* ── Head ─────────────────────────────────── */}
        <circle cx="36" cy="28" r="18" fill="#CCCAC4" />

        {/* ── Tabby forehead M-mark ─────────────── */}
        <path d="M30 18 Q33 15 36 18" stroke="#A09E98" strokeWidth="1.0" fill="none" strokeLinecap="round" opacity="0.8"/>
        <path d="M33 16 Q36 13 39 16" stroke="#A09E98" strokeWidth="1.0" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M36 18 Q39 15 42 18" stroke="#A09E98" strokeWidth="1.0" fill="none" strokeLinecap="round" opacity="0.8"/>

        {/* ── Eyes — half-closed, serene ─────────── */}
        {/* Outer eye shape (almond / slightly lidded) */}
        <ellipse cx="27" cy="27" rx="4.2" ry="3.8" fill="#4A9B8A" />
        <ellipse cx="45" cy="27" rx="4.2" ry="3.8" fill="#4A9B8A" />
        {/* Pupils */}
        <ellipse cx="27" cy="27" rx="2.2" ry="2.6" fill="#2A2A2A" />
        <ellipse cx="45" cy="27" rx="2.2" ry="2.6" fill="#2A2A2A" />
        {/* Upper lid line — the "calm" look */}
        <path d="M23 25.5 Q27 24 31 25.5" stroke="#888" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M41 25.5 Q45 24 49 25.5" stroke="#888" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        {/* Eye shines */}
        <circle cx="28.5" cy="26" r="1.3" fill="white" opacity="0.9" />
        <circle cx="46.5" cy="26" r="1.3" fill="white" opacity="0.9" />

        {/* ── Nose ─────────────────────────────────── */}
        <ellipse cx="36" cy="33" rx="2" ry="1.5" fill="#C8A0A0" />

        {/* ── Mouth — calm closed smile ─────────── */}
        <path
          d="M33.5 35 Q36 37 38.5 35"
          stroke="#B0AEAA"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Whiskers — perfectly level ────────── */}
        <line x1="38" y1="33" x2="50" y2="32" stroke="#B0AEAA" strokeWidth="0.8" />
        <line x1="38" y1="34" x2="50" y2="35" stroke="#B0AEAA" strokeWidth="0.8" />
        <line x1="34" y1="33" x2="22" y2="32" stroke="#B0AEAA" strokeWidth="0.8" />
        <line x1="34" y1="34" x2="22" y2="35" stroke="#B0AEAA" strokeWidth="0.8" />

        {/* ── Bell ─────────────────────────────────── */}
        <circle cx="36" cy="50" r="8"  fill="white" stroke="#E97B22" strokeWidth="1.5" />
        <circle cx="36" cy="50" r="1"  fill="#E97B22" />
        <line x1="36" y1="50" x2="36" y2="44.5" stroke="#E97B22" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="36" y1="50" x2="39.5" y2="51.5" stroke="#74726C" strokeWidth="1" strokeLinecap="round" />

      </svg>
    </div>
  );
};
