import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../core/i18n';
import { PrivacyScreen } from './PrivacyScreen';

const config = vi.hoisted(() => ({ PRIVACY_POLICY_UPDATED: '2026-11-06', PRIVACY_CONTACT_EMAIL: '' }));
vi.mock('../../core/config/privacy', () => config);

const renderPrivacy = () => render(
  <MemoryRouter><I18nextProvider i18n={i18n}><PrivacyScreen /></I18nextProvider></MemoryRouter>,
);

describe('PrivacyScreen', () => {
  it('states that data stays on the device and lists every section', () => {
    renderPrivacy();
    expect(screen.getByText(/does not send your data anywhere/i)).toBeInTheDocument();
    for (const heading of ['What the app stores', 'Permissions', 'Crash logs', 'Sharing', 'Deleting your data', 'Not medical advice', 'Children']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
  });

  it('hides the contact section until an email is configured', () => {
    renderPrivacy();
    expect(screen.queryByRole('heading', { name: 'Contact' })).not.toBeInTheDocument();
  });

  it('shows the contact email once configured', () => {
    config.PRIVACY_CONTACT_EMAIL = 'hello@example.com';
    renderPrivacy();
    expect(screen.getByText(/hello@example.com/)).toBeInTheDocument();
    config.PRIVACY_CONTACT_EMAIL = '';
  });
});
