import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderEdit } from './ReminderEdit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useRemindersStore } from '../../core/store/remindersStore';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../core/i18n';

vi.mock('../../core/store/remindersStore');

describe('ReminderEdit', () => {
  const mockAddReminder = vi.fn();
  const mockUpdateReminder = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRemindersStore).mockReturnValue({
      reminders: [],
      addReminder: mockAddReminder,
      updateReminder: mockUpdateReminder,
    } as any);

    // Mock hook returned from react-router-dom
    vi.mock('react-router-dom', async (importOriginal) => {
      const actual: any = await importOriginal();
      return {
        ...actual,
        useNavigate: () => mockNavigate,
      };
    });
  });

  const renderComponent = (id: string = 'new') => {
    return render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/reminder/${id}`]}>
          <Routes>
            <Route path="/reminder/:id" element={<ReminderEdit />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );
  };

  it('renders "New Reminder" title when id is new', () => {
    renderComponent('new');
    expect(screen.getByText(/New Reminder/i)).toBeInTheDocument();
  });

  it('calls addReminder with default values when saving a new reminder', () => {
    renderComponent('new');
    fireEvent.click(screen.getByText(/Save|actions\.save/i));
    
    expect(mockAddReminder).toHaveBeenCalledWith(expect.objectContaining({
      category: 'water',
      enabled: true,
      soundMode: 'sound_vibration'
    }));
  });

  it('allows changing schedule type from fixed to interval', () => {
    renderComponent('new');
    
    const intervalBtn = screen.getByText(/edit_reminder\.type_interval|Interval/i);
    fireEvent.click(intervalBtn);
    
    // Once switched, it should show Interval inputs like 'minutes'
    expect(screen.getByText(/edit_reminder\.minutes/i)).toBeInTheDocument();
  });
});
