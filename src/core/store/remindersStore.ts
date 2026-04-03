import { create } from 'zustand';
import type { Category, SoundMode, Character, Schedule, Reminder } from '../../types/nyanudge';

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

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoaded: false,

  setReminders: (reminders) => set({ reminders, isLoaded: true }),

  addReminder: (reminder) =>
    set((state) => ({ reminders: [...state.reminders, reminder] })),

  updateReminder: (id, changes) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...changes, updatedAt: Date.now() } : r
      ),
    })),

  deleteReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    })),

  toggleReminder: (id) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled, updatedAt: Date.now() } : r
      ),
    })),

  setLoaded: (loaded) => set({ isLoaded: loaded }),

  getReminderByCategory: (category) =>
    get().reminders.find((r) => r.category === category),
}));
