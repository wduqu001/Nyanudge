import { useEffect, useRef } from 'react';

const handlers: Array<() => void> = [];

/** While `active`, the Android back button calls `onBack` instead of navigating; the latest registration wins. */
export function useBackHandler(active: boolean, onBack: () => void): void {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!active) return;
    const handler = () => onBackRef.current();
    handlers.push(handler);
    return () => {
      const index = handlers.lastIndexOf(handler);
      if (index >= 0) handlers.splice(index, 1);
    };
  }, [active]);
}

/** Runs the most recently registered back handler; returns false when none is active. */
export function runBackHandler(): boolean {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
}
