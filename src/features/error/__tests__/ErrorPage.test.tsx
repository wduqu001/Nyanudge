import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { ErrorPage } from '../ErrorPage';

vi.mock('../../../shared/components/CatErrorIllustration/CatErrorIllustration', () => ({
  CatErrorIllustration: () => <svg aria-label="Error illustration" role="img" />,
}));

// Capture navigate calls
const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

describe('ErrorPage', () => {
  beforeEach(() => navigateMock.mockReset());

  it('renders the error title and hero text', () => {
    render(<Wrapper><ErrorPage /></Wrapper>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows the fallback subtitle when no error prop is provided', () => {
    render(<Wrapper><ErrorPage /></Wrapper>);
    // The subtitle text comes from i18n 'error.subtitle'
    expect(screen.getByText(/3 AM/i)).toBeInTheDocument();
  });

  it('shows the error message when an error prop is provided', () => {
    render(<Wrapper><ErrorPage error={new Error('Custom crash message')} /></Wrapper>);
    expect(screen.getByText('Custom crash message')).toBeInTheDocument();
  });

  it('clicking "Go back" calls resetErrorBoundary and navigates -1', () => {
    const resetFn = vi.fn();
    render(<Wrapper><ErrorPage resetErrorBoundary={resetFn} /></Wrapper>);
    fireEvent.click(screen.getByText(/go back/i));
    expect(resetFn).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('clicking "Go back" without resetErrorBoundary still navigates -1 (no throw)', () => {
    render(<Wrapper><ErrorPage /></Wrapper>);
    expect(() => fireEvent.click(screen.getByText(/go back/i))).not.toThrow();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('clicking "Take me home" calls resetErrorBoundary and navigates /', () => {
    const resetFn = vi.fn();
    render(<Wrapper><ErrorPage resetErrorBoundary={resetFn} /></Wrapper>);
    fireEvent.click(screen.getByText(/take me home/i));
    expect(resetFn).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('clicking "Take me home" without resetErrorBoundary navigates / without throwing', () => {
    render(<Wrapper><ErrorPage /></Wrapper>);
    expect(() => fireEvent.click(screen.getByText(/take me home/i))).not.toThrow();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
