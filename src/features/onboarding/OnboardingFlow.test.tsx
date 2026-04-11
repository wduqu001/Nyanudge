import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingFlow } from './OnboardingFlow';
import { MemoryRouter } from 'react-router-dom';
import { usePreferencesStore } from '../../core/store/preferencesStore';
import { useRemindersStore } from '../../core/store/remindersStore';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../core/i18n';

vi.mock('../../core/store/preferencesStore');
vi.mock('../../core/store/remindersStore');

describe('OnboardingFlow', () => {
  const mockUpdatePreference = vi.fn();
  const mockAddReminder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePreferencesStore).mockReturnValue({
      preferences: {},
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
      </I18nextProvider>
    );
  };

  it('starts at step 1 and moves to next step', () => {
    renderComponent();
    const nextButton = screen.getByText(/onboarding\.welcome_action|actions\.next/i);
    fireEvent.click(nextButton);
    expect(screen.getByText(/What's your wake up time\?|onboarding\.step2_title/i)).toBeInTheDocument();
  });
});
