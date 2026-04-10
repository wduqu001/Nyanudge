import { create } from 'zustand';
import { useStatsStore } from './statsStore';
import { scheduleReminder, cancelReminder } from '../notifications/scheduler';
import { ReminderService } from '../db/ReminderService';

export interface NotifTapAction {
  reminderId: string;
  label: string;
  category: Category;
}

interface RemindersState {
  reminders: Reminder[];
  isLoaded: boolean;
  /** Set when user taps a notification body — HomeScreen shows a modal. */
  pendingNotifAction: NotifTapAction | null;

  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, changes: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  setPendingNotifAction: (action: NotifTapAction | null) => void;
  setLoaded: (loaded: boolean) => void;
  getReminderByCategory: (category: Category) => Reminder | undefined;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoaded: false,
  pendingNotifAction: null,

  setReminders: (reminders) => {
    set({ reminders, isLoaded: true });
    reminders.forEach(r => {
      // local reference to avoid race conditions if 'r' changes
      const current = r;
      cancelReminder(current).finally(() => {
        if (current.enabled && !current.archived) scheduleReminder(current);
      });
    });
  },

  addReminder: async (reminder) => {
    // Persist first to ensure data safety
    try {
      await ReminderService.addReminder(reminder);
    } catch (err) {
      console.error('[Store] Error saving reminder:', err);
      return; // prevent adding state if DB fails
    }

    set((state) => ({ reminders: [...state.reminders, reminder] }));

    // schedule
    if (reminder.enabled && !reminder.archived) {
      scheduleReminder(reminder);
    }
  },

  updateReminder: async (id, changes) => {
    const oldR = get().reminders.find((r) => r.id === id);

    // optimistic UI update
    set((state) => ({
      reminders: state.reminders.map((r) => {
        if (r.id === id) {
          return { ...r, ...changes, updatedAt: Date.now() };
        }
        return r;
      }),
    }));

    // cancel old notifications to prevent ghosts
    if (oldR) cancelReminder(oldR);

    try {
      await ReminderService.updateReminder(id, changes);
    } catch (err) {
      console.error('[Store] Error updating reminder:', err);
      // Optional: Consider a rollback state if DB write fails
    }

    // Reschedule if needed
    const newR = get().reminders.find((r) => r.id === id);
    if (newR && newR.enabled && !newR.archived) {
      scheduleReminder(newR);
    }
  },

  deleteReminder: async (id) => {
    const oldR = get().reminders.find((r) => r.id === id);

    // optimistic UI removal
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));

    if (oldR) cancelReminder(oldR);

    try {
      await ReminderService.deleteReminder(id);
    } catch (err) {
      console.error('[Store] Error deleting reminder:', err);
    }
  },

  toggleReminder: async (id) => {
    const oldR = get().reminders.find((r) => r.id === id);
    if (!oldR) return;

    const newEnabledState = !oldR.enabled;

    // cancel existing
    cancelReminder(oldR);

    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, enabled: newEnabledState, updatedAt: Date.now() } : r
      ),
    }));

    try {
      await ReminderService.updateReminder(id, { enabled: newEnabledState });
    } catch (err) {
      console.error('[Store] Error toggling reminder:', err);
    }

    // Reschedule if enabling
    if (newEnabledState) {
      const newR = get().reminders.find((r) => r.id === id);
      if (newR && newR.enabled && !newR.archived) scheduleReminder(newR);
    }
  },

  completeReminder: async (id: string) => {
    const r = get().reminders.find(rem => rem.id === id);
    if (!r) return;

    const { addCompletion, incrementStreak } = useStatsStore.getState();
    const entry = {
      id: Math.random().toString(36).substring(7),
      reminderId: r.id,
      category: r.category,
      completedAt: Date.now(),
      wasSkipped: false
    };

    addCompletion(entry);
    incrementStreak(r.category);

    // Update reminder anchor so the next interval starts from NOW
    const now = Date.now();
    set((state) => ({
      reminders: state.reminders.map((rem) =>
        rem.id === id ? { ...rem, updatedAt: now } : rem
      ),
    }));

    // Persist Completion & Anchor
    ReminderService.addCompletion(entry).catch(err => console.error('[Store] Error saving completion:', err));
    ReminderService.updateReminder(id, { updatedAt: now }).catch(() => { }); // Anchor it in DB too

    // Reschedule
    // only reschedule if the reminder has interval types. Fixed reminders don't need reescheduling
    const hasInterval = r.schedules.some(s => s.type === 'interval');

    if (hasInterval && r.enabled && !r.archived) {
      const updatedR = get().reminders.find(rem => rem.id === id);
      if (updatedR) {
        scheduleReminder(updatedR);
      }
    }
  },

  setPendingNotifAction: (action) => set({ pendingNotifAction: action }),

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  getReminderByCategory: (category) =>
    get().reminders.find((r) => r.category === category),
}));
