import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingFlow } from './OnboardingFlow';
import { MemoryRouter } from 'react-router-dom';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { useRemindersStore } from '../../core/store/remindersStore';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../core/i18n';

// Mock child components to isolate the OnboardingFlow logic
vi.mock('./steps/Step1MeetCrew', () => ({
  Step1MeetCrew: () => <div data-testid="step-1">Step 1 Content</div>,
}));
vi.mock('./steps/Step2YourReminders', () => ({
  Step2YourReminders: () => <div data-testid="step-2">Step 2 Content</div>,
}));
vi.mock('./steps/Step3HowYouLikeIt', () => ({
  Step3HowYouLikeIt: () => <div data-testid="step-3">Step 3 Content</div>,
}));

// Mock UI components to simplify interaction
vi.mock('../../shared/components/Button/NyaButton', () => ({
  NyaButton: ({ children, onClick, variant }: any) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock('../../shared/components/Select/NyaSelect', () => ({
  NyaSelect: ({ value, onChange, options }: any) => (
    <select data-testid="language-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

// Mock stores
vi.mock('../../core/store/preferencesStore');
vi.mock('../../core/store/remindersStore');

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
  };
});

// Mock react-router-dom navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('OnboardingFlow', () => {
  const mockUpdatePreference = vi.fn();
  const mockAddReminder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: { language: 'en' },
      updatePreference: mockUpdatePreference,
    } as any);

    vi.mocked(useRemindersStore).mockReturnValue({
      addReminder: mockAddReminder,
    } as any);
  });

  const renderComponent = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <OnboardingFlow />
        </MemoryRouter>
      </I18nextProvider>,
    );
  };

  it('should render the first step initially', () => {
    renderComponent();

    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.getByText('onboarding.actions.next')).toBeInTheDocument();
    // Back button should not be present on the first step
    expect(screen.queryByText('onboarding.actions.back')).not.toBeInTheDocument();
  });

  it('should navigate to the next step when Next is clicked', () => {
    renderComponent();

    const nextButton = screen.getByText('onboarding.actions.next');
    fireEvent.click(nextButton);

    expect(screen.getByTestId('step-2')).toBeInTheDocument();
    expect(screen.queryByTestId('step-1')).not.toBeInTheDocument();

    // Back button should appear now
    expect(screen.getByText('onboarding.actions.back')).toBeInTheDocument();
  });

  it('should navigate to the previous step when Back is clicked', () => {
    renderComponent();

    // Go to step 2
    fireEvent.click(screen.getByText('onboarding.actions.next'));
    expect(screen.getByTestId('step-2')).toBeInTheDocument();

    // Go back to step 1
    fireEvent.click(screen.getByText('onboarding.actions.back'));
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.queryByText('onboarding.actions.back')).not.toBeInTheDocument();
  });

  it('should show Finish button on the last step and complete onboarding', () => {
    renderComponent();

    // Navigate to the last step (Step 3)
    fireEvent.click(screen.getByText('onboarding.actions.next')); // Step 2
    fireEvent.click(screen.getByText('onboarding.actions.next')); // Step 3

    expect(screen.getByTestId('step-3')).toBeInTheDocument();
    expect(screen.getByText('onboarding.actions.finish')).toBeInTheDocument();

    // Click Finish
    fireEvent.click(screen.getByText('onboarding.actions.finish'));

    expect(mockUpdatePreference).toHaveBeenCalledWith('isOnboardingComplete', true);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('should update progress bar width based on current step', () => {
    renderComponent();

    // Helper to check style, as CSS modules classes might be obfuscated
    // We look for the element with the inline style width calculation
    const progressFill = document.querySelector('[style*="width: 33"]');
    expect(progressFill).toHaveStyle({ width: '33.33333333333333%' });

    // Move to step 2
    fireEvent.click(screen.getByText('onboarding.actions.next'));
    const progressFillStep2 = document.querySelector('[style*="width: 66"]');
    expect(progressFillStep2).toHaveStyle({ width: '66.66666666666666%' });
  });

  it('should change language when selecting a new option', () => {
    renderComponent();

    const select = screen.getByTestId('language-select');

    fireEvent.change(select, { target: { value: 'pt-BR' } });

    expect(mockUpdatePreference).toHaveBeenCalledWith('language', 'pt-BR');
  });
});
