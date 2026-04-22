import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// ── Mock Capacitor before importing the cat animation components ──────────────
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: () => 'web' } }));

describe('Cat Animation Components — render smoke tests', () => {
  it('CatSora renders without throwing', async () => {
    const { CatSora } = await import('../../shared/components/SoraCat/CatSora');
    const { container } = render(<CatSora />);
    // Should render something (svg, div, or canvas)
    expect(container.firstChild).not.toBeNull();
  });

  it('AnimatedCatKuro renders without throwing', async () => {
    const { AnimatedCatKuro } = await import('../../shared/components/KuroCat/AnimatedCatKuro');
    const { container } = render(<AnimatedCatKuro />);
    expect(container.firstChild).not.toBeNull();
  });

  it('AnimatedCatMochi renders without throwing', async () => {
    const { AnimatedCatMochi } = await import('../../shared/components/AnimatedCatMochi/AnimatedCatMochi');
    const { container } = render(<AnimatedCatMochi />);
    expect(container.firstChild).not.toBeNull();
  });
});
