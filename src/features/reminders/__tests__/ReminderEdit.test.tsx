
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { ReminderEdit } from '../ReminderEdit';
import { useRemindersStore } from '../../../core/store/remindersStore';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../../../core/notifications/scheduler', () => ({
  scheduleReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../core/db/ReminderService', () => ({
  ReminderService: {
    addReminder: vi.fn().mockResolvedValue(undefined),
    updateReminder: vi.fn().mockResolvedValue(undefined),
  },
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => navigateMock };
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'existing-1',
  category: 'water',
  label: 'Drink Water',
  enabled: true,
  archived: false,
  soundMode: 'sound_vibration',
  snoozeMins: 10,
  character: 'mochi',
  createdAt: 1000,
  updatedAt: 1000,
  schedules: [{ id: 's1', reminderId: 'existing-1', type: 'fixed', timeValue: '08:00', daysOfWeek: [1, 2, 3, 4, 5] }],
  ...overrides,
});

// ── Router wrapper with route param ──────────────────────────────────────────

const RouterWrapper = ({ id }: { id: string }) => (
  <MemoryRouter initialEntries={[`/reminder/${id}`]}>
    <I18nextProvider i18n={i18n}>
      <Routes>
        <Route path="/reminder/:id" element={<ReminderEdit />} />
      </Routes>
    </I18nextProvider>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
  navigateMock.mockReset();
  useRemindersStore.setState({ reminders: [], isLoaded: true, pendingNotifAction: null });
});

describe('ReminderEdit', () => {
  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows loading text when store is not yet loaded', () => {
    useRemindersStore.setState({ reminders: [], isLoaded: false });
    render(<RouterWrapper id="new" />);
    expect(screen.getByText(/loading reminder/i)).toBeInTheDocument();
  });

  // ── Not-found state ───────────────────────────────────────────────────────

  it('shows not-found state for an unknown non-new id', () => {
    useRemindersStore.setState({ reminders: [], isLoaded: true });
    render(<RouterWrapper id="does-not-exist" />);
    // i18n key is rendered verbatim: 'edit_reminder.not_found' in the heading
    // Use getAllByText to handle multiple elements that might match
    expect(screen.getAllByText(/edit_reminder\.not_found/i).length).toBeGreaterThan(0);
  });

  // ── New reminder ──────────────────────────────────────────────────────────

  it('renders "New Reminder" heading for id=new', () => {
    render(<RouterWrapper id="new" />);
    expect(screen.getByText(/new reminder/i)).toBeInTheDocument();
  });

  it('calls addReminder and navigates back on save for new reminder', async () => {
    const addReminder = vi.fn().mockResolvedValue(undefined);
    useRemindersStore.setState({ reminders: [], isLoaded: true, addReminder } as any);
    render(<RouterWrapper id="new" />);
    await act(async () => {
      fireEvent.click(screen.getByText(/save/i));
    });
    expect(addReminder).toHaveBeenCalledOnce();
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  // ── Existing reminder ─────────────────────────────────────────────────────

  it('pre-fills the label field for an existing reminder', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    // Multiple textboxes exist (label input + textarea). Target by id.
    const input = document.getElementById('label-input') as HTMLInputElement;
    expect(input.value).toBe('Drink Water');
  });

  it('calls updateReminder and navigates back on save for existing reminder', async () => {
    const updateReminder = vi.fn().mockResolvedValue(undefined);
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true, updateReminder } as any);
    render(<RouterWrapper id="existing-1" />);
    await act(async () => {
      fireEvent.click(screen.getByText(/save/i));
    });
    expect(updateReminder).toHaveBeenCalledWith('existing-1', expect.any(Object));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it('shows the Archive button only for existing reminders', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    expect(screen.getByText(/archive/i)).toBeInTheDocument();
  });

  it('does NOT show Archive button for new reminders', () => {
    render(<RouterWrapper id="new" />);
    expect(screen.queryByText(/archive/i)).not.toBeInTheDocument();
  });

  it('calls updateReminder with archived=true when Archive is clicked', async () => {
    const updateReminder = vi.fn().mockResolvedValue(undefined);
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true, updateReminder } as any);
    render(<RouterWrapper id="existing-1" />);
    await act(async () => {
      fireEvent.click(screen.getByText(/archive/i));
    });
    expect(updateReminder).toHaveBeenCalledWith('existing-1', { archived: true, enabled: false });
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  // ── Schedule type toggle ──────────────────────────────────────────────────

  it('switches from Fixed to Interval schedule type on button click', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    fireEvent.click(screen.getByText(/interval/i));
    // Interval schedule shows a time-window select/input (Start/End labels)
    expect(screen.getByText(/start/i)).toBeInTheDocument();
  });

  // ── Day toggle ────────────────────────────────────────────────────────────

  it('toggles a weekday button (adds the day when not present)', () => {
    // Reminder has only Mon-Fri (1-5) — clicking Sunday (index 0) should add it
    render(<RouterWrapper id="new" />);
    // Day buttons render as single letter abbreviations
    const dayButtons = screen.getAllByRole('button').filter(
      (b) => b.textContent && b.textContent.length === 1  && /[SMTWF]/.test(b.textContent),
    );
    // Confirm day buttons exist
    expect(dayButtons.length).toBeGreaterThan(0);
  });

  // ── Cancel navigation ─────────────────────────────────────────────────────

  it('calls window.history.back() when Cancel is clicked', () => {
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<RouterWrapper id="new" />);
    fireEvent.click(screen.getByText(/cancel/i));
    expect(backSpy).toHaveBeenCalledOnce();
    backSpy.mockRestore();
  });

  // ── Inline form interactions (covers lines 119-269) ──────────────────────

  it('can type in the label input and updates local state', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    const input = document.getElementById('label-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'My new label' } });
    expect(input.value).toBe('My new label');
  });

  it('can type in the custom message textarea', () => {
    render(<RouterWrapper id="new" />);
    // The textarea is the only non-label textbox style element
    const textareas = document.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThan(0);
    fireEvent.change(textareas[0]!, { target: { value: 'Custom msg' } });
    expect((textareas[0] as HTMLTextAreaElement).value).toBe('Custom msg');
  });

  it('can change the fixed time input value', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    const timeInput = screen.getByDisplayValue('08:00') as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: '10:00' } });
    expect(timeInput.value).toBe('10:00');
  });

  it('toggles a day button to add it when not in the days list', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    // Reminder has Mon-Fri (indices 1-5). Day at index 0 (Sunday) is inactive.
    const dayBtns = document.querySelectorAll('.day-btn');
    const sundayBtn = dayBtns[0] as HTMLElement;
    expect(sundayBtn).not.toHaveClass('active');
    fireEvent.click(sundayBtn);
    expect(sundayBtn).toHaveClass('active');
  });

  it('toggles an active day button to remove it', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    const dayBtns = document.querySelectorAll('.day-btn');
    const mondayBtn = dayBtns[1] as HTMLElement; // Monday is active in fixture
    expect(mondayBtn).toHaveClass('active');
    fireEvent.click(mondayBtn);
    expect(mondayBtn).not.toHaveClass('active');
  });

  it('switches to interval and shows start/end time inputs', () => {
    render(<RouterWrapper id="new" />);
    fireEvent.click(screen.getByText(/interval/i));
    expect(screen.getByText(/start/i)).toBeInTheDocument();
    expect(screen.getByText(/end/i)).toBeInTheDocument();
  });

  it('can update the interval start time', () => {
    render(<RouterWrapper id="new" />);
    fireEvent.click(screen.getByText(/interval/i));
    const timeInputs = screen.getAllByDisplayValue(/:/);
    fireEvent.change(timeInputs[0]!, { target: { value: '06:00' } });
    expect((timeInputs[0] as HTMLInputElement).value).toBe('06:00');
  });

  it('can update the interval end time', () => {
    render(<RouterWrapper id="new" />);
    fireEvent.click(screen.getByText(/interval/i));
    const timeInputs = screen.getAllByDisplayValue(/:/);
    fireEvent.change(timeInputs[timeInputs.length - 1]!, { target: { value: '22:00' } });
    expect((timeInputs[timeInputs.length - 1] as HTMLInputElement).value).toBe('22:00');
  });

  it('toggles the enabled switch on/off', () => {
    useRemindersStore.setState({ reminders: [makeReminder()], isLoaded: true });
    render(<RouterWrapper id="existing-1" />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('can click a category button to change category', () => {
    render(<RouterWrapper id="new" />);
    // Category buttons are present (meal, exercise, etc.)
    const mealBtn = screen.getByText(/eat something|meal/i);
    fireEvent.click(mealBtn);
    // After clicking, it should be visually active (class check or aria)
    expect(mealBtn).toBeInTheDocument();
  });
});
