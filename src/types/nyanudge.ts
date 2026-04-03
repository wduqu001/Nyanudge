
export type Category = 'water' | 'meal' | 'exercise' | 'bathroom' | 'medicine';
export type SoundMode = 'sound_vibration' | 'vibration_only' | 'silent';
export type Character = 'mochi' | 'sora' | 'kuro';
export type Theme = 'system' | 'light' | 'dark';
export type NotificationStyle = 'standard' | 'compact';

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

export interface Preferences {
  // Notifications
  defaultSoundMode: SoundMode;
  notificationStyle: NotificationStyle;
  dndStart: string;   // "22:00"
  dndEnd: string;     // "07:00"

  // Appearance
  theme: Theme;
  character: Character;
  language: string;   // BCP-47 code: 'en' | 'pt-BR' | 'ja' | 'es-ES'

  // Reminders
  defaultSnoozeMins: number;
  markAsDoneOnOpen: boolean;
  isOnboardingComplete: boolean;
}

export interface DefaultReminder {
  id: string;
  category: Category;
  label: string;
  enabled: boolean;
  soundMode: SoundMode;
  snoozeMins: number;
  character: Character;
  createdAt: number;
  updatedAt: number;
}
