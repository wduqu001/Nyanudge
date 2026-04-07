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
    const updated = reminders.map(r => ({
      ...r,
      schedules: r.schedules.map(s => ({ ...s, notifId: s.notifId ?? Math.floor(Math.random() * 2_000_000) }))
    }));
    set({ reminders: updated, isLoaded: true });
    updated.forEach(r => {
      cancelReminder(r).finally(() => {
        if (r.enabled && !r.archived) scheduleReminder(r);
      });
    });
  },

  addReminder: (reminder) => {
    const newReminder = {
      ...reminder,
      schedules: reminder.schedules.map(s => ({ ...s, notifId: s.notifId ?? Math.floor(Math.random() * 2_000_000) }))
    };
    set((state) => ({ reminders: [...state.reminders, newReminder] }));
    ReminderService.addReminder(newReminder).catch(err => console.error('[Store] Error saving reminder:', err));
    if (newReminder.enabled && !newReminder.archived) scheduleReminder(newReminder);
  },

  updateReminder: (id, changes) => {
    const oldR = get().reminders.find((r) => r.id === id);
    if (oldR) cancelReminder(oldR);

    set((state) => ({
      reminders: state.reminders.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...changes, updatedAt: Date.now() };
          updated.schedules = updated.schedules.map(s => ({
            ...s,
            notifId: s.notifId ?? Math.floor(Math.random() * 2_000_000)
          }));
          return updated;
        }
        return r;
      }),
    }));

    ReminderService.updateReminder(id, changes).catch(err => console.error('[Store] Error updating reminder:', err));

    const newR = get().reminders.find((r) => r.id === id);
    if (newR && newR.enabled && !newR.archived) scheduleReminder(newR);
  },

  deleteReminder: (id) => {
    const oldR = get().reminders.find((r) => r.id === id);
    if (oldR) cancelReminder(oldR);
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
    ReminderService.deleteReminder(id).catch(err => console.error('[Store] Error deleting reminder:', err));
  },

  toggleReminder: (id) => {
    const oldR = get().reminders.find((r) => r.id === id);
    if (oldR) cancelReminder(oldR);

    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled, updatedAt: Date.now() } : r
      ),
    }));

    if (oldR) {
      ReminderService.updateReminder(id, { enabled: !oldR.enabled }).catch(err => console.error('[Store] Error toggling reminder:', err));
    }

    const newR = get().reminders.find((r) => r.id === id);
    if (newR && newR.enabled && !newR.archived) scheduleReminder(newR);
  },

  completeReminder: (id: string) => {
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
    ReminderService.addCompletion(entry).catch(err => console.error('[Store] Error saving completion:', err));
  },

  setPendingNotifAction: (action) => set({ pendingNotifAction: action }),

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  getReminderByCategory: (category) =>
    get().reminders.find((r) => r.category === category),
}));
