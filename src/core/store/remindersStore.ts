import { create } from 'zustand';

export type Category = 'water' | 'meal' | 'exercise' | 'bathroom' | 'medicine';
export type SoundMode = 'sound_vibration' | 'vibration_only' | 'silent';
export type Character = 'mochi' | 'sora' | 'kuro';

export interface Schedule {
  id: string;
  reminderId: string;
  type: 'fixed' | 'interval';
  timeValue?: string;       // "08:00" for fixed; "120" (mins) for interval
  daysOfWeek?: number[];    // [0,1,2,3,4,5,6] — 0=Sunday
  startTime?: string;       // "07:00" — interval window start
  endTime?: string;         // "21:00" — interval window end
  notifId?: number;
}

export interface Reminder {
  id: string;
  category: Category;
  label: string;
  enabled: boolean;
  soundMode: SoundMode;
  snoozeMins: number;
  character: Character;
  customMessage?: string;
  schedules: Schedule[];
  createdAt: number;
  updatedAt: number;
}

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
