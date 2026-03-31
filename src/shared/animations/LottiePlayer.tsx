import React, { useEffect, useRef } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import { animationRegistry, animationMetadata, type AnimationKey } from './registry';

interface LottiePlayerProps {
  /** The specific animation key from the registry */
  animationKey: AnimationKey;
  /** Whether the animation should loop; defaults to the metadata value for the key */
  loop?: boolean;
  /** Whether the animation should play automatically; defaults to true */
  autoplay?: boolean;
  /** Optional completion callback */
  onComplete?: () => void;
  /** Custom CSS classes for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
}

/**
 * LottiePlayer is a wrapper for lottie-web that integrates with the NyaNudge 
 * animation registry. It handles loading, playback, and lifecycle of 
 * the vector animations.
 */
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

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy any existing animation before loading a new one
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
  }, [animationKey, loop, autoplay, onComplete]);

  return (
    <div 
      ref={containerRef} 
      className={`lottie-container ${className}`} 
      style={{ 
        width: '100%', 
        height: '100%', 
        ...style 
      }}
      aria-hidden="true" // Usually these are decorative animations
    />
  );
};
