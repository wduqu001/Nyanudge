import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '../Toggle/Toggle';

describe('Toggle', () => {
  it('renders in the unchecked state', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders in the checked state', () => {
    render(<Toggle checked={true} onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with the toggled value on click', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('does NOT call onChange when disabled is true (the critical uncovered branch)', () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders with correct aria-label when label prop is provided', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Notifications" />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('renders with aria-labelledby when provided', () => {
    render(
      <div>
        <span id="lbl">My Label</span>
        <Toggle checked={true} onChange={vi.fn()} aria-labelledby="lbl" />
      </div>,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-labelledby', 'lbl');
  });
});
