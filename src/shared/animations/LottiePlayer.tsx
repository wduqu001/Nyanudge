import React, { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { animationRegistry, animationMetadata, type AnimationKey } from './registry';
import { AnimatedWater } from './AnimatedWater';
import { AnimatedMeal } from './AnimatedMeal';
import { AnimatedMedicine } from './AnimatedMedicine';
import { AnimatedExercise } from './AnimatedExercise';
import { AnimatedSleep } from './AnimatedSleep';
import { AnimatedBathroom } from './AnimatedBathroom';

interface LottiePlayerProps {
  animationKey: AnimationKey;
  loop?: boolean;
  autoplay?: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const CUSTOM_SVG_KEYS = new Set<AnimationKey>([
  'cat_water',
  'cat_meal',
  'cat_medicine',
  'cat_exercise',
  'cat_sleep',
  'cat_bathroom',
]);

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationKey,
  loop,
  autoplay = true,
  onComplete,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animItemRef = useRef<AnimationItem | null>(null);
  const isCustomSvg = CUSTOM_SVG_KEYS.has(animationKey);

  useEffect(() => {
    if (isCustomSvg || !containerRef.current) return;

    animItemRef.current?.destroy();

    const meta = animationMetadata[animationKey];
    const resolvedLoop = loop ?? meta.loop;

    animItemRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: resolvedLoop,
      autoplay,
      animationData: animationRegistry[animationKey],
    });

    if (onComplete) {
      animItemRef.current.addEventListener('complete', onComplete);
    }

    return () => {
      animItemRef.current?.removeEventListener('complete', onComplete);
      animItemRef.current?.destroy();
    };
  }, [animationKey, loop, autoplay, onComplete, isCustomSvg]);

  if (isCustomSvg) {
    const renderSvg = () => {
      switch (animationKey) {
        case 'cat_water':    return <AnimatedWater />;
        case 'cat_meal':     return <AnimatedMeal />;
        case 'cat_medicine': return <AnimatedMedicine />;
        case 'cat_exercise': return <AnimatedExercise />;
        case 'cat_sleep':    return <AnimatedSleep />;
        case 'cat_bathroom': return <AnimatedBathroom />;
        default:             return null;
      }
    };

    return (
      <div
        className={`lottie-container custom-svg ${className}`}
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}
        aria-hidden="true"
      >
        {renderSvg()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`lottie-container ${className}`}
      style={{ width: '100%', height: '100%', ...style }}
      aria-hidden="true"
    />
  );
};
