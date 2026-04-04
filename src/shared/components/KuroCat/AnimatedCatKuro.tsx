import React, { useEffect, useRef, useState } from "react";
import styles from "./AnimatedCatKuro.module.css";

/**
 * AnimatedCatKuro — Kuro is the mischievous black cat character.
 * Personality: sly, unpredictable, maximum sass energy.
 *
 * Behaviours:
 *  - Breathing idle (body scale)
 *  - Slow tail sway with occasional fast "excited" flick
 *  - Random slow blink (narrowed, not fully closed — side-eye energy)
 *  - Rare ear twitch (one ear at a time for asymmetric attitude)
 *  - Mouse-tracking eye movement (same lerp as Mochi)
 *  - Occasional smug squint (eyes narrow to slits briefly)
 */
export const AnimatedCatKuro: React.FC = () => {
  const [blink, setBlink]         = useState(false);
  const [squint, setSquint]       = useState(false);
  const [leftEarTwitch, setLeftEarTwitch]   = useState(false);
  const [rightEarTwitch, setRightEarTwitch] = useState(false);
  const [tailFlick, setTailFlick] = useState(false);

  const eyePosRef    = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const eyeGroupRef  = useRef<SVGGElement>(null);

  /* ── Blink loop ─────────────────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    let id: ReturnType<typeof setTimeout>;

    const loop = () => {
      id = setTimeout(() => {
        if (!mounted) return;
        setBlink(true);
        id = setTimeout(() => {
          if (!mounted) return;
          setBlink(false);
          loop();
        }, 130);
      }, Math.random() * 5000 + 3000);
    };

    loop();
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  /* ── Smug squint (Kuro's signature look) ───────────────────────── */
  useEffect(() => {
    let mounted = true;
    let id: ReturnType<typeof setTimeout>;

    const loop = () => {
      id = setTimeout(() => {
        if (!mounted) return;
        setSquint(true);
        id = setTimeout(() => {
          if (!mounted) return;
          setSquint(false);
          loop();
        }, 900); // holds the squint longer than a blink
      }, Math.random() * 9000 + 7000);
    };

    loop();
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  /* ── Asymmetric ear twitches ────────────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    let id: ReturnType<typeof setTimeout>;

    const loop = () => {
      id = setTimeout(() => {
        if (!mounted) return;
        // randomly pick left, right, or both
        const which = Math.random();
        if (which < 0.4)       setLeftEarTwitch(true);
        else if (which < 0.8)  setRightEarTwitch(true);
        else { setLeftEarTwitch(true); setRightEarTwitch(true); }

        id = setTimeout(() => {
          if (!mounted) return;
          setLeftEarTwitch(false);
          setRightEarTwitch(false);
          loop();
        }, 250);
      }, Math.random() * 7000 + 5000);
    };

    loop();
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  /* ── Tail flick (sudden fast swipe) ────────────────────────────── */
  useEffect(() => {
    let mounted = true;
    let id: ReturnType<typeof setTimeout>;

    const loop = () => {
      id = setTimeout(() => {
        if (!mounted) return;
        setTailFlick(true);
        id = setTimeout(() => {
          if (!mounted) return;
          setTailFlick(false);
          loop();
        }, 400);
      }, Math.random() * 6000 + 4000);
    };

    loop();
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  /* ── Eye tracking ───────────────────────────────────────────────── */
  useEffect(() => {
    let raf: number;
    const animate = () => {
      eyePosRef.current.x += (targetPosRef.current.x - eyePosRef.current.x) * 0.12;
      eyePosRef.current.y += (targetPosRef.current.y - eyePosRef.current.y) * 0.12;
      if (eyeGroupRef.current) {
        eyeGroupRef.current.style.transform =
          `translate(${eyePosRef.current.x}px, ${eyePosRef.current.y}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    targetPosRef.current.x = Math.max(-1, Math.min(1, x)) * 2.5;
    targetPosRef.current.y = Math.max(-1, Math.min(1, y)) * 2.5;
  };

  const handleMouseLeave = () => {
    targetPosRef.current.x = 0;
    targetPosRef.current.y = 0;
  };

  /* ── Eye shape: yellow irises, vertical slit pupils ────────────── */
  const eyeRyNormal = 4.5;
  const eyeRyBlink  = blink  ? 0.4 : squint ? 1.6 : eyeRyNormal;

  return (
    <div
      className={styles.catWrapper}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg className={styles.catSvg} viewBox="0 0 72 72">

        {/* ── Tail ─────────────────────────────────────── */}
        <path
          className={`${styles.catTail} ${tailFlick ? styles.tailFlick : ""}`}
          d="M52 52 Q66 44 58 34"
          stroke="#2C2C2A"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Body ─────────────────────────────────────── */}
        <g className={styles.catBody}>
          <ellipse cx="36" cy="48" rx="20" ry="16" fill="#2C2C2A" />

          {/* ── Ears ─────────────────────────────────── */}
          <g className={`${styles.catEarLeft} ${leftEarTwitch ? styles.twitch : ""}`}>
            <polygon points="18,14 12,4 24,10" fill="#2C2C2A" />
            <polygon points="19,13 14,6 23,10" fill="#3D2030" />
          </g>
          <g className={`${styles.catEarRight} ${rightEarTwitch ? styles.twitch : ""}`}>
            <polygon points="54,14 60,4 48,10" fill="#2C2C2A" />
            <polygon points="53,13 58,6 49,10" fill="#3D2030" />
          </g>

          {/* ── Head ─────────────────────────────────── */}
          <circle cx="36" cy="28" r="18" fill="#2C2C2A" />

          {/* ── Eyes (tracking group) ─────────────── */}
          <g ref={eyeGroupRef}>
            {/* Yellow iris */}
            <ellipse cx="27" cy="27" rx="4"   ry={eyeRyBlink} fill="#E8C840" />
            <ellipse cx="42" cy="27" rx="4"   ry={eyeRyBlink} fill="#E8C840" />
            {/* Vertical slit pupil */}
            {!blink && (
              <>
                <ellipse cx="27" cy="27" rx="1.2" ry={squint ? 1.4 : 3.2} fill="#141412" />
                <ellipse cx="42" cy="27" rx="1.2" ry={squint ? 1.4 : 3.2} fill="#141412" />
              </>
            )}
            {/* Eye shine */}
            {!blink && (
              <>
                <circle cx="28.5" cy="25.5" r="1.2" fill="white" opacity="0.85" />
                <circle cx="43.5" cy="25.5" r="1.2" fill="white" opacity="0.85" />
              </>
            )}
          </g>

          {/* ── Nose ─────────────────────────────────── */}
          <ellipse cx="36" cy="33" rx="2" ry="1.5" fill="#8B4F6B" />

          {/* ── Mouth — slight smirk (left side higher) ── */}
          <path
            d="M33 35.5 Q36 37.5 39 35"
            stroke="#555"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />

          {/* ── Whiskers ─────────────────────────────── */}
          <line x1="38" y1="33" x2="50" y2="30" stroke="#555" strokeWidth="0.8" />
          <line x1="38" y1="34" x2="50" y2="35" stroke="#555" strokeWidth="0.8" />
          <line x1="34" y1="33" x2="22" y2="30" stroke="#555" strokeWidth="0.8" />
          <line x1="34" y1="34" x2="22" y2="35" stroke="#555" strokeWidth="0.8" />

          {/* ── Bell (same accent as Mochi for brand consistency) ── */}
          <circle cx="36" cy="50" r="8"  fill="white" stroke="#E97B22" strokeWidth="1.5" />
          <circle cx="36" cy="50" r="1"  fill="#E97B22" />
          <line x1="36" y1="50" x2="36" y2="44.5" stroke="#E97B22" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="36" y1="50" x2="39.5" y2="51.5" stroke="#74726C" strokeWidth="1" strokeLinecap="round" />
        </g>

      </svg>
    </div>
  );
};
