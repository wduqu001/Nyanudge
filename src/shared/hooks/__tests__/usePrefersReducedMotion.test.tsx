import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { AnimatedCatMochi } from '../../components/AnimatedCatMochi/AnimatedCatMochi';
import { AnimatedCatKuro } from '../../components/KuroCat/AnimatedCatKuro';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('cat animations and prefers-reduced-motion', () => {
  const originalMatchMedia = window.matchMedia;
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    ['Mochi', AnimatedCatMochi],
    ['Kuro', AnimatedCatKuro],
  ])('%s starts no timers or frames when the user asked for less motion', (_, Cat) => {
    vi.useFakeTimers();
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    mockReducedMotion(true);
    render(<Cat />);
    expect(vi.getTimerCount()).toBe(0);
    expect(raf).not.toHaveBeenCalled();
  });

  it.each([
    ['Mochi', AnimatedCatMochi],
    ['Kuro', AnimatedCatKuro],
  ])('%s animates by default', (_, Cat) => {
    vi.useFakeTimers();
    mockReducedMotion(false);
    render(<Cat />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
  });
});
