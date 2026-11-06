import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBackHandler, runBackHandler } from '../useBackHandler';

describe('useBackHandler', () => {
  it('runs only the most recent active handler and unregisters on cleanup', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const outerHook = renderHook(() => useBackHandler(true, outer));
    const innerHook = renderHook(({ active }) => useBackHandler(active, inner), { initialProps: { active: true } });

    expect(runBackHandler()).toBe(true);
    expect(inner).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();

    innerHook.rerender({ active: false });
    runBackHandler();
    expect(outer).toHaveBeenCalledOnce();

    outerHook.unmount();
    innerHook.unmount();
    expect(runBackHandler()).toBe(false);
  });
});
