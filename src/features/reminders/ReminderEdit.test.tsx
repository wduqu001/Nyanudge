import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderEdit } from './ReminderEdit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useRemindersStore } from '../../core/store/remindersStore';

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

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  };
});

describe('ReminderEdit', () => {
  const mockAddReminder = vi.fn();
  const mockUpdateReminder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRemindersStore).mockReturnValue({
      reminders: [],
      addReminder: mockAddReminder,
      updateReminder: mockUpdateReminder,
      isLoaded: true,
    } as any);
  });

  const renderComponent = (id: string = 'new') => {
    return render(
      <MemoryRouter initialEntries={[`/reminder/${id}`]}>
        <Routes>
          <Route path="/reminder/:id" element={<ReminderEdit />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it('renders "New Reminder" title when id is new', () => {
    renderComponent('new');
    expect(screen.getByText(/edit_reminder\.title_new/i)).toBeInTheDocument();
  });

  it('calls addReminder with default values when saving a new reminder', () => {
    renderComponent('new');
    fireEvent.click(screen.getByText(/Save|actions\.save/i));

    expect(mockAddReminder).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'water',
        enabled: true,
        soundMode: 'sound_vibration',
      }),
    );
  });

  it('allows changing schedule type from fixed to interval', () => {
    renderComponent('new');

    const intervalBtn = screen.getByText(/edit_reminder\.type_interval|Interval/i);
    fireEvent.click(intervalBtn);

    // Once switched, it should show Interval inputs like 'minutes'
    expect(screen.getByText(/edit_reminder\.minutes/i)).toBeInTheDocument();
  });
});
