import React, { useEffect, useRef, useState } from "react";
import styles from "./AnimatedCatMochi.module.css";

/**
 * AnimatedCatMochi is a highly interactive, SVGR-based animation 
 * that mimics cat behaviors like breathing, tail wagging, ear twitching, 
 * and mouse-tracking eye movement.
 */
export const AnimatedCatMochi: React.FC = () => {
  const [blink, setBlink] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);

  const eyePosRef = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const eyeElementRef = useRef<SVGGElement>(null);

  /* ---------------------------
     Blink loop (randomly fires)
  ----------------------------*/
  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loop = () => {
      const timeout = Math.random() * 4000 + 2000;
      timeoutId = setTimeout(() => {
        if (!mounted) return;
        setBlink(true);

        timeoutId = setTimeout(() => {
          if (!mounted) return;
          setBlink(false);
          loop();
        }, 120);
      }, timeout);
    };

    loop();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  /* ---------------------------
     Ear twitch (rare event)
  ----------------------------*/
  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const twitchLoop = () => {
      const timeout = Math.random() * 8000 + 6000; // 6–14s
      timeoutId = setTimeout(() => {
        if (!mounted) return;
        setEarTwitch(true);

        timeoutId = setTimeout(() => {
          if (!mounted) return;
          setEarTwitch(false);
          twitchLoop();
        }, 220);
      }, timeout);
    };

    twitchLoop();
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  /* ---------------------------
     Eye tracking (smoothed via Raf loop)
  ----------------------------*/
  useEffect(() => {
    let raf: number;
    const animate = () => {
      // Linear interpolation (cheap smoothing)
      eyePosRef.current.x += (targetPosRef.current.x - eyePosRef.current.x) * 0.15;
      eyePosRef.current.y += (targetPosRef.current.y - eyePosRef.current.y) * 0.15;

      if (eyeElementRef.current) {
        eyeElementRef.current.style.transform = `translate(${eyePosRef.current.x}px, ${eyePosRef.current.y}px)`;
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  /**
   * Updates target eye position based on mouse coordinate within the container
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Clamp to avoid uncanny extremes
    targetPosRef.current.x = Math.max(-1, Math.min(1, x)) * 2.5;
    targetPosRef.current.y = Math.max(-1, Math.min(1, y)) * 2.5;
  };

  /**
   * Resets the eyes to the center when mouse leaves the component area
   */
  const handleMouseLeave = () => {
    targetPosRef.current.x = 0;
    targetPosRef.current.y = 0;
  };

  return (
    <div 
      className={styles.catWrapper} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg className={styles.catSvg} viewBox="0 0 72 72">
        {/* Tail */}
        <path
          className={styles.catTail}
          d="M52 52 Q64 46 60 38"
          stroke="#D4D2CC"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Head tilt wrapper */}
        <g className={styles.catHead}>
          {/* Body */}
          <g className={styles.catBody}>
            <ellipse cx="36" cy="48" rx="20" ry="16" fill="#F0EEE8" />
            <circle cx="36" cy="28" r="18" fill="#F0EEE8" />
          </g>

          {/* Ears */}
          <g className={`${styles.catEars} ${earTwitch ? styles.twitch : ""}`}>
            <polygon points="18,14 12,4 24,10" fill="#F0EEE8" />
            <polygon points="54,14 60,4 48,10" fill="#F0EEE8" />
            <polygon points="19,13 14,6 23,10" fill="#FFD4D4" />
            <polygon points="53,13 58,6 49,10" fill="#FFD4D4" />
          </g>

          {/* Eyes (tracking applied via Raf ref) */}
          <g
            ref={eyeElementRef}
            className={`${styles.catEyes} ${blink ? styles.blink : ""}`}
          >
            <ellipse cx="26" cy="27" rx="4" ry="4.5" fill="#333" />
            <ellipse cx="42" cy="27" rx="4" ry="4.5" fill="#333" />
            <circle cx="27.5" cy="25.5" r="1.5" fill="white" />
            <circle cx="43.5" cy="25.5" r="1.5" fill="white" />
          </g>

          {/* Face */}
          <ellipse cx="34" cy="33" rx="2" ry="1.5" fill="#FFB3B3" />
          <path d="M31 35 Q34 38 37 35" stroke="#CCC" strokeWidth="1.2" fill="none" strokeLinecap="round" />

          {/* Whiskers */}
          <line x1="36" y1="33" x2="48" y2="31" stroke="#CCC" strokeWidth="0.8" />
          <line x1="36" y1="34" x2="48" y2="35" stroke="#CCC" strokeWidth="0.8" />
          <line x1="32" y1="33" x2="20" y2="31" stroke="#CCC" strokeWidth="0.8" />
          <line x1="32" y1="34" x2="20" y2="35" stroke="#CCC" strokeWidth="0.8" />
        </g>

        {/* Bell */}
        <circle cx="34" cy="50" r="8" fill="white" stroke="#E97B22" strokeWidth="1.5" />
        <circle cx="34" cy="50" r="1" fill="#E97B22" />
        <line x1="34" y1="50" x2="34" y2="44.5" stroke="#E97B22" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="34" y1="50" x2="37.5" y2="51.5" stroke="#74726C" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
};
