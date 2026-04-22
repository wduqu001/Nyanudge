import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import {
  getCrashLogs,
  clearCrashLogs,
  exportCrashLogs,
  isCrashReporterEnabled,
  setCrashReporterEnabled,
} from '../../../core/crash/useCrashReporter';
import { CrashReporterModal } from '../CrashReporterModal';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../core/crash/useCrashReporter', () => ({
  getCrashLogs: vi.fn(() => []),
  clearCrashLogs: vi.fn(),
  exportCrashLogs: vi.fn(),
  isCrashReporterEnabled: vi.fn(() => false),
  setCrashReporterEnabled: vi.fn(),
}));

const mockGetCrashLogs = vi.mocked(getCrashLogs);
const mockClearCrashLogs = vi.mocked(clearCrashLogs);
const mockExportCrashLogs = vi.mocked(exportCrashLogs);
const mockIsEnabled = vi.mocked(isCrashReporterEnabled);
const mockSetEnabled = vi.mocked(setCrashReporterEnabled);

// Clipboard mock
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </MemoryRouter>
);

describe('CrashReporterModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCrashLogs.mockReturnValue([]);
    mockIsEnabled.mockReturnValue(false);
    onClose.mockReset();
  });

  // ── Empty state ───────────────────────────────────────────────────────────

  it('renders "Enable crash reporter" message when disabled and no logs', () => {
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    expect(screen.getByText(/enable crash reporter to start capturing/i)).toBeInTheDocument();
  });

  it('renders "No crash logs recorded" when enabled and no logs', () => {
    mockIsEnabled.mockReturnValue(true);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    expect(screen.getByText(/no crash logs recorded/i)).toBeInTheDocument();
  });

  // ── Toggle ────────────────────────────────────────────────────────────────

  it('calls setCrashReporterEnabled(true) when toggling on', () => {
    mockIsEnabled.mockReturnValue(false);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    fireEvent.click(screen.getByRole('switch', { name: /enable crash reporter/i }));
    expect(mockSetEnabled).toHaveBeenCalledWith(true);
  });

  it('calls setCrashReporterEnabled(false) when toggling off', () => {
    mockIsEnabled.mockReturnValue(true);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    fireEvent.click(screen.getByRole('switch', { name: /enable crash reporter/i }));
    expect(mockSetEnabled).toHaveBeenCalledWith(false);
  });

  // ── Log list ──────────────────────────────────────────────────────────────

  it('renders log cards when logs exist', () => {
    mockGetCrashLogs.mockReturnValue([
      { timestamp: new Date(2024, 0, 1).toISOString(), error: 'TypeError: Cannot read property' },
    ]);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    expect(screen.getByText(/TypeError: Cannot read property/i)).toBeInTheDocument();
  });

  it('expands a log card on click showing the stack trace', () => {
    mockGetCrashLogs.mockReturnValue([
      {
        timestamp: new Date(2024, 0, 1).toISOString(),
        error: 'Boom',
        stack: 'at doSomething (app.js:12)',
        componentStack: '  in App',
      },
    ]);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    // Collapsed by default
    expect(screen.queryByText(/at doSomething/)).not.toBeInTheDocument();
    // Click the log card header button (contains the error text)
    fireEvent.click(screen.getByText('Boom').closest('[role="button"]') as Element);
    // stack and componentStack now visible
    expect(screen.getByText(/at doSomething/)).toBeInTheDocument();
    expect(screen.getByText(/in App/)).toBeInTheDocument();
  });

  it('copies log JSON to clipboard on "Copy JSON" click', async () => {
    const log = {
      timestamp: new Date(2024, 0, 1).toISOString(),
      error: 'Oops',
      stack: 'at foo (bar.js:1)',
    };
    mockGetCrashLogs.mockReturnValue([log]);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    // Expand the card first
    fireEvent.click(screen.getAllByRole('button')[1]!); // second button = log card
    fireEvent.click(screen.getByText('Copy JSON'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(log, null, 2));
  });

  // ── Footer actions ────────────────────────────────────────────────────────

  it('shows Export and Clear buttons when logs exist', () => {
    mockGetCrashLogs.mockReturnValue([
      { timestamp: new Date().toISOString(), error: 'err' },
    ]);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    expect(screen.getByText(/export json/i)).toBeInTheDocument();
    expect(screen.getByText(/clear logs/i)).toBeInTheDocument();
  });

  it('calls exportCrashLogs when Export button is clicked', () => {
    mockGetCrashLogs.mockReturnValue([{ timestamp: new Date().toISOString(), error: 'err' }]);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    fireEvent.click(screen.getByText(/export json/i));
    expect(mockExportCrashLogs).toHaveBeenCalledOnce();
  });

  it('calls clearCrashLogs and empties the list when Clear is clicked', () => {
    mockGetCrashLogs.mockReturnValue([{ timestamp: new Date().toISOString(), error: 'err' }]);
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    fireEvent.click(screen.getByText(/clear logs/i));
    expect(mockClearCrashLogs).toHaveBeenCalledOnce();
    // After clearing, the empty state should appear
    expect(screen.queryByText(/export json/i)).not.toBeInTheDocument();
  });

  // ── Close ─────────────────────────────────────────────────────────────────

  it('calls onClose when the close (✕) button is clicked', () => {
    render(<Wrapper><CrashReporterModal onClose={onClose} /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
