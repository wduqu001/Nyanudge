import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { NyaHeader } from '../Header/NyaHeader';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter><I18nextProvider i18n={i18n}>{children}</I18nextProvider></MemoryRouter>
);

describe('NyaHeader', () => {
  beforeEach(() => navigateMock.mockReset());

  it('renders the provided title', () => {
    render(<Wrapper><NyaHeader title="My Title" /></Wrapper>);
    expect(screen.getByRole('heading', { name: 'My Title' })).toBeInTheDocument();
  });

  it('calls navigate(-1) when back button is clicked and no onBack prop', () => {
    render(<Wrapper><NyaHeader title="Title" /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('calls the onBack prop instead of navigate when provided', () => {
    const onBack = vi.fn();
    render(<Wrapper><NyaHeader title="Title" onBack={onBack} /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('hides the back button when showBack=false', () => {
    render(<Wrapper><NyaHeader title="Title" showBack={false} /></Wrapper>);
    expect(screen.queryByRole('button', { name: /go back/i })).not.toBeInTheDocument();
  });

  it('renders rightContent slot when provided', () => {
    render(
      <Wrapper>
        <NyaHeader title="Title" rightContent={<span data-testid="right-slot">⚙️</span>} />
      </Wrapper>,
    );
    expect(screen.getByTestId('right-slot')).toBeInTheDocument();
  });
});
