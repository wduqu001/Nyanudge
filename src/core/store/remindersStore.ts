import { create } from 'zustand';
import { useStatsStore } from './statsStore';
import { rescheduleAll, msSinceLastReschedule } from '../notifications/scheduler';
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
  addReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (id: string, changes: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  setPendingNotifAction: (action: NotifTapAction | null) => void;
  setLoaded: (loaded: boolean) => void;
  getReminderByCategory: (category: Category) => Reminder | undefined;
  rehydrateFromDb: () => Promise<void>;
  /** Re-plans every notification; with `ifOlderThanMs`, only when the last plan is older. */
  syncNotifications: (options?: { ifOlderThanMs?: number }) => Promise<void>;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoaded: false,
  pendingNotifAction: null,

  setReminders: (reminders) => {
    set({ reminders, isLoaded: true });
    get().syncNotifications();
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
    get().syncNotifications();
  },

  updateReminder: async (id, changes) => {
    // optimistic UI update
    set((state) => ({
      reminders: state.reminders.map((r) => {
        if (r.id === id) {
          return { ...r, ...changes, updatedAt: Date.now() };
        }
        return r;
      }),
    }));

    try {
      await ReminderService.updateReminder(id, changes);
    } catch (err) {
      console.error('[Store] Error updating reminder:', err);
      // Optional: Consider a rollback state if DB write fails
    }

    get().syncNotifications();
  },

  deleteReminder: async (id) => {
    // optimistic UI removal
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    get().syncNotifications();

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

    get().syncNotifications();
  },

  completeReminder: async (id: string) => {
    const r = get().reminders.find(rem => rem.id === id);
    if (!r) return;

    const { addCompletion, recordCompletion } = useStatsStore.getState();
    const entry = {
      id: Math.random().toString(36).substring(7),
      reminderId: r.id,
      category: r.category,
      completedAt: Date.now(),
      wasSkipped: false
    };

    addCompletion(entry);
    recordCompletion(r.category, entry.completedAt);

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

    // Interval slots are anchored to the last completion, so they move.
    if (r.schedules.some(s => s.type === 'interval')) get().syncNotifications();
  },

  setPendingNotifAction: (action) => set({ pendingNotifAction: action }),

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  getReminderByCategory: (category) =>
    get().reminders.find((r) => r.category === category),

  syncNotifications: async (options) => {
    if (!get().isLoaded) return;
    if (options?.ifOlderThanMs !== undefined && msSinceLastReschedule() < options.ifOlderThanMs) return;
    await rescheduleAll(get().reminders);
  },

  rehydrateFromDb: async () => {
    try {
      const dbReminders = await ReminderService.getAllReminders();
      const current = get().reminders;
      // Reconcile and only reschedule if changed (simplified hydration)
      if (JSON.stringify(dbReminders) !== JSON.stringify(current)) {
        get().setReminders(dbReminders);
      } else {
        // Top up the rolling window of one-shot alarms when the app comes back.
        await get().syncNotifications({ ifOlderThanMs: 6 * 60 * 60 * 1000 });
      }
    } catch (e) {
      console.error('[Store] Hydration failed', e);
    }
  }
}));
