import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ErrorPage } from '../../features/error/ErrorPage';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

expect.extend(toHaveNoViolations);

// Mock the CatErrorIllustration SVG component so it doesn't break in jsdom
vi.mock('../../shared/components/CatErrorIllustration/CatErrorIllustration', () => ({
  CatErrorIllustration: () => <svg aria-label="Error illustration" role="img" />,
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

describe('Accessibility', () => {
  describe('ErrorPage', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Wrapper>
          <ErrorPage />
        </Wrapper>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no axe violations when showing an error message', async () => {
      const { container } = render(
        <Wrapper>
          <ErrorPage error={new Error('Something broke')} />
        </Wrapper>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
