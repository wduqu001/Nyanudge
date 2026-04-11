import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRemindersStore } from './remindersStore';
import { useStatsStore } from './statsStore';
import { scheduleReminder, cancelReminder } from '../notifications/scheduler';
import { ReminderService } from '../db/ReminderService';

vi.mock('../notifications/scheduler', () => ({
  scheduleReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('../db/ReminderService', () => ({
  ReminderService: {
    addReminder: vi.fn().mockResolvedValue(undefined),
    updateReminder: vi.fn().mockResolvedValue(undefined),
    deleteReminder: vi.fn().mockResolvedValue(undefined),
    addCompletion: vi.fn().mockResolvedValue(undefined),
    getAllReminders: vi.fn().mockResolvedValue([])
  }
}));

const mockReminder: Reminder = {
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

const archivedReminder: Reminder = {
  ...mockReminder,
  id: 'r2',
  archived: true
};

const disabledReminder: Reminder = {
  ...mockReminder,
  id: 'r3',
  enabled: false
};

describe('RemindersStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRemindersStore.setState({ reminders: [], isLoaded: false, pendingNotifAction: null });
    useStatsStore.setState({ stats: {}, recentCompletions: [], isLoaded: false });
  });

  // ── setReminders ───────────────────────────────────────────────────────────

  it('setReminders sets the reminders and schedules active ones', async () => {
    useRemindersStore.getState().setReminders([mockReminder]);

    expect(useRemindersStore.getState().reminders.length).toBe(1);
    expect(useRemindersStore.getState().isLoaded).toBe(true);
    expect(cancelReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));

    await Promise.resolve(); // flush finally() microtask

    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('setReminders does NOT schedule archived reminders', async () => {
    useRemindersStore.getState().setReminders([archivedReminder]);

    await Promise.resolve();

    expect(cancelReminder).toHaveBeenCalled();
    expect(scheduleReminder).not.toHaveBeenCalled();
  });

  it('setReminders does NOT schedule disabled reminders', async () => {
    useRemindersStore.getState().setReminders([disabledReminder]);

    await Promise.resolve();

    expect(cancelReminder).toHaveBeenCalled();
    expect(scheduleReminder).not.toHaveBeenCalled();
  });



  // ── addReminder ────────────────────────────────────────────────────────────

  it('addReminder adds to state, DB, and schedules if active', async () => {
    await useRemindersStore.getState().addReminder(mockReminder);

    expect(useRemindersStore.getState().reminders.length).toBe(1);
    expect(ReminderService.addReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('addReminder does not schedule a disabled reminder', async () => {
    await useRemindersStore.getState().addReminder(disabledReminder);

    expect(scheduleReminder).not.toHaveBeenCalled();
    expect(ReminderService.addReminder).toHaveBeenCalled();
  });

  it('addReminder does not schedule an archived reminder', async () => {
    await useRemindersStore.getState().addReminder(archivedReminder);

    expect(scheduleReminder).not.toHaveBeenCalled();
  });

  // ── updateReminder ─────────────────────────────────────────────────────────

  it('updateReminder updates state, DB, cancels old and schedules new', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().updateReminder('r1', { label: 'Drink More Water', enabled: false });

    const updated = useRemindersStore.getState().reminders[0];
    expect(updated!.label).toBe('Drink More Water');
    expect(updated!.enabled).toBe(false);

    expect(cancelReminder).toHaveBeenCalled();
    expect(ReminderService.updateReminder).toHaveBeenCalledWith('r1', expect.objectContaining({ label: 'Drink More Water' }));
    expect(scheduleReminder).not.toHaveBeenCalled(); // disabled => no schedule
  });

  it('updateReminder schedules when reminder is still enabled', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().updateReminder('r1', { label: 'Updated' });

    expect(scheduleReminder).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('updateReminder for a non-existent id does not throw and does not modify state', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await expect(async () => {
      await useRemindersStore.getState().updateReminder('unknown-id', { label: 'Ghost' });
    }).not.toThrow();

    expect(useRemindersStore.getState().reminders[0]!.label).toBe('Drink Water');
  });

  it('updateReminder stamps updatedAt', async () => {
    const now = 9_999_999;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().updateReminder('r1', { label: 'New Label' });

    expect(useRemindersStore.getState().reminders[0]!.updatedAt).toBe(now);
  });

  // ── deleteReminder ─────────────────────────────────────────────────────────

  it('deleteReminder removes from state, DB and cancels notification', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().deleteReminder('r1');

    expect(useRemindersStore.getState().reminders.length).toBe(0);
    expect(cancelReminder).toHaveBeenCalled();
    expect(ReminderService.deleteReminder).toHaveBeenCalledWith('r1');
  });

  it('deleteReminder for a non-existent id does not modify state', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().deleteReminder('ghost');

    expect(useRemindersStore.getState().reminders.length).toBe(1);
  });

  // ── toggleReminder ─────────────────────────────────────────────────────────

  it('toggleReminder flips the enabled state, updates DB, and schedules/cancels appropriately', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    // Toggle OFF
    await useRemindersStore.getState().toggleReminder('r1');
    expect(useRemindersStore.getState().reminders[0]!.enabled).toBe(false);
    expect(cancelReminder).toHaveBeenCalled();
    expect(ReminderService.updateReminder).toHaveBeenCalledWith('r1', { enabled: false });

    vi.clearAllMocks();

    // Toggle ON
    await useRemindersStore.getState().toggleReminder('r1');
    expect(useRemindersStore.getState().reminders[0]!.enabled).toBe(true);
    expect(ReminderService.updateReminder).toHaveBeenCalledWith('r1', { enabled: true });
    expect(scheduleReminder).toHaveBeenCalled();
  });

  it('toggleReminder on an archived reminder does not schedule even when enabled', async () => {
    useRemindersStore.setState({ reminders: [{ ...archivedReminder, enabled: false }] });

    // Toggle "on" for an archived reminder
    await useRemindersStore.getState().toggleReminder('r2');
    expect(useRemindersStore.getState().reminders[0]!.enabled).toBe(true);
    expect(scheduleReminder).not.toHaveBeenCalled(); // archived guard must hold
  });

  // ── completeReminder ───────────────────────────────────────────────────────

  it('completeReminder adds a completion entry to statsStore', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().completeReminder('r1');

    const completions = useStatsStore.getState().recentCompletions;
    expect(completions.length).toBe(1);
    expect(completions[0]!.reminderId).toBe('r1');
    expect(completions[0]!.category).toBe('water');
    expect(completions[0]!.wasSkipped).toBe(false);
  });

  it('completeReminder increments the streak for the reminder category', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-10T12:00:00Z'));

    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().completeReminder('r1');

    const stats = useStatsStore.getState().stats;
    expect(stats['water']!.currentStreak).toBe(1);
    expect(stats['water']!.lastCompletedDate).toBe('2023-10-10');
    vi.useRealTimers();
  });

  it('completeReminder persists the completion to the DB', async () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().completeReminder('r1');

    expect(ReminderService.addCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ reminderId: 'r1', category: 'water', wasSkipped: false })
    );
  });

  it('completeReminder is a no-op when the reminder does not exist', async () => {
    useRemindersStore.setState({ reminders: [] });

    await expect(async () => {
      await useRemindersStore.getState().completeReminder('non-existent');
    }).not.toThrow();

    expect(useStatsStore.getState().recentCompletions.length).toBe(0);
    expect(ReminderService.addCompletion).not.toHaveBeenCalled();
  });

  it('completeReminder increments streak every time, even on the same day', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-10T08:00:00Z'));

    useRemindersStore.setState({ reminders: [mockReminder] });

    await useRemindersStore.getState().completeReminder('r1');
    vi.setSystemTime(new Date('2023-10-10T20:00:00Z'));
    await useRemindersStore.getState().completeReminder('r1');

    expect(useStatsStore.getState().stats['water']!.currentStreak).toBe(2);
    vi.useRealTimers();
  });

  // ── setPendingNotifAction ──────────────────────────────────────────────────

  it('setPendingNotifAction stores the action and can be cleared', () => {
    const action = { reminderId: 'r1', label: 'Drink Water', category: 'water' as const };

    useRemindersStore.getState().setPendingNotifAction(action);
    expect(useRemindersStore.getState().pendingNotifAction).toEqual(action);

    useRemindersStore.getState().setPendingNotifAction(null);
    expect(useRemindersStore.getState().pendingNotifAction).toBeNull();
  });

  // ── getReminderByCategory ──────────────────────────────────────────────────

  it('getReminderByCategory returns the first matching reminder', () => {
    const mealReminder: Reminder = { ...mockReminder, id: 'r4', category: 'meal' };
    useRemindersStore.setState({ reminders: [mockReminder, mealReminder] });

    const found = useRemindersStore.getState().getReminderByCategory('meal');
    expect(found).toBeDefined();
    expect(found!.id).toBe('r4');
  });

  it('getReminderByCategory returns undefined when no match exists', () => {
    useRemindersStore.setState({ reminders: [mockReminder] });

    const found = useRemindersStore.getState().getReminderByCategory('exercise');
    expect(found).toBeUndefined();
  });

  describe('rehydrateFromDb', () => {
    it('fetches from db and updates store if different', async () => {
      const newReminder = { ...mockReminder, id: 'rnew', label: 'Restored' };
      vi.mocked(ReminderService.getAllReminders).mockResolvedValueOnce([newReminder]);
      
      await useRemindersStore.getState().rehydrateFromDb();
      
      expect(useRemindersStore.getState().reminders.length).toBe(1);
      expect(useRemindersStore.getState().reminders[0]!.id).toBe('rnew');
    });

    it('does not re-trigger schedule if identical to current state', async () => {
      useRemindersStore.setState({ reminders: [mockReminder], isLoaded: true });
      vi.mocked(ReminderService.getAllReminders).mockResolvedValueOnce([mockReminder]);

      await useRemindersStore.getState().rehydrateFromDb();

      expect(useRemindersStore.getState().reminders.length).toBe(1);
      // Since it's identical, setReminders should not be called and scheduler not hit
      const spy = vi.spyOn(useRemindersStore.getState(), 'setReminders');
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
