import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRemindersStore } from '../core/store/remindersStore';
import { scheduleReminder, cancelReminder } from '../core/notifications/scheduler';
import { ReminderService } from '../core/db/ReminderService';

vi.mock('../core/notifications/scheduler', () => ({
  scheduleReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../core/db/ReminderService', () => ({
  ReminderService: {
    addReminder: vi.fn().mockResolvedValue(undefined),
    updateReminder: vi.fn().mockResolvedValue(undefined),
    deleteReminder: vi.fn().mockResolvedValue(undefined)
  }
}));

const mockReminder = {
  id: 'r1',
  category: 'water' as const,
  label: 'Drink Water',
  enabled: true,
  soundMode: 'sound_vibration' as const,
  snoozeMins: 10,
  character: 'mochi' as const,
  schedules: [{ id: 's1', reminderId: 'r1', type: 'fixed' as const, timeValue: '08:00', notifId: 100 }],
  createdAt: 1000,
  updatedAt: 1000
};

describe('RemindersStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRemindersStore.setState({
      reminders: [],
      isLoaded: false
    });
  });

  it('setReminders sets the reminders and schedules active ones', async () => {
    useRemindersStore.getState().setReminders([mockReminder]);
    
    expect(useRemindersStore.getState().reminders.length).toBe(1);
    expect(useRemindersStore.getState().isLoaded).toBe(true);
    expect(cancelReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
    
    // flush microtasks because setReminders calls scheduleReminder in a .finally() block
    await Promise.resolve();
    
    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('addReminder adds to state, DB, and schedules if active', () => {
    useRemindersStore.getState().addReminder(mockReminder);

    expect(useRemindersStore.getState().reminders.length).toBe(1);
    expect(ReminderService.addReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('updateReminder updates state, DB, cancels old and schedules new', () => {
    useRemindersStore.setState({ reminders: [mockReminder] });
    
    useRemindersStore.getState().updateReminder('r1', { label: 'Drink More Water', enabled: false });

    const updated = useRemindersStore.getState().reminders[0];
    expect(updated!).toBeDefined();
    expect(updated!.label).toBe('Drink More Water');
    expect(updated!.enabled).toBe(false);

    expect(cancelReminder).toHaveBeenCalled(); // Should have canceled old
    expect(ReminderService.updateReminder).toHaveBeenCalledWith('r1', expect.objectContaining({ label: 'Drink More Water' }));
    // Shouldn't schedule because it is disabled
    expect(scheduleReminder).not.toHaveBeenCalled();
  });

  it('deleteReminder removes from state, DB and cancels notification', () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    useRemindersStore.getState().deleteReminder('r1');

    expect(useRemindersStore.getState().reminders.length).toBe(0);
    expect(cancelReminder).toHaveBeenCalled();
    expect(ReminderService.deleteReminder).toHaveBeenCalledWith('r1');
  });

  it('toggleReminder flips the enabled state, updates DB, and schedules/cancels appropriately', () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    // Toggle off
    useRemindersStore.getState().toggleReminder('r1');
    expect(useRemindersStore.getState().reminders[0]!.enabled).toBe(false);
    expect(cancelReminder).toHaveBeenCalled();
    expect(ReminderService.updateReminder).toHaveBeenCalledWith('r1', { enabled: false });

    vi.clearAllMocks();

    // Toggle on
    useRemindersStore.getState().toggleReminder('r1');
    expect(useRemindersStore.getState().reminders[0]!.enabled).toBe(true);
    expect(ReminderService.updateReminder).toHaveBeenCalledWith('r1', { enabled: true });
    expect(scheduleReminder).toHaveBeenCalled();
  });

  it('toggleReminder un-archives if active?', () => {
    // Current toggleReminder only changes 'enabled', it does not unarchive.
    // So this is a documentation check: toggleReminder doesn't unarchive explicitly,
    // but the schedule condition `&& !newR.archived` handles schedule logic.
  });
});
