import { create } from 'zustand';




interface RemindersState {
  reminders: Reminder[];
  isLoaded: boolean;

  // Actions
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, changes: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  setLoaded: (loaded: boolean) => void;
  getReminderByCategory: (category: Category) => Reminder | undefined;
}

import { scheduleReminder, cancelReminder } from '../notifications/scheduler';
import { ReminderService } from '../db/ReminderService';

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoaded: false,

  setReminders: (reminders) => {
    // Ensure notifId on everything and schedule enabled ones
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

    if (newReminder.enabled && !newReminder.archived) {
      scheduleReminder(newReminder);
    }
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
    if (newR && newR.enabled && !newR.archived) {
      scheduleReminder(newR);
    }
  },

  deleteReminder: (id) => {
    const oldR = get().reminders.find((r) => r.id === id);
    if (oldR) cancelReminder(oldR);
    
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));

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
      ReminderService.updateReminder(id, { enabled: !oldR.enabled }).catch(err => console.error('[Store] Error toggling UI reminder:', err));
    }

    const newR = get().reminders.find((r) => r.id === id);
    if (newR && newR.enabled && !newR.archived) {
      scheduleReminder(newR);
    }
  },

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  getReminderByCategory: (category) =>
    get().reminders.find((r) => r.category === category),
}));

