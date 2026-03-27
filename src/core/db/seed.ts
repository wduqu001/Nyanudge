
export interface DefaultReminder {
  id: string;
  category: string;
  label: string;
  enabled: boolean;
  soundMode: string;
  snoozeMins: number;
  character: string;
  createdAt: number;
  updatedAt: number;
}

export const defaultReminders: DefaultReminder[] = [
  {
    id: crypto.randomUUID(),
    category: 'water',
    label: 'Drink Water',
    enabled: true,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    category: 'meal',
    label: 'Eat Something',
    enabled: true,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    category: 'exercise',
    label: 'Move Your Body',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    category: 'bathroom',
    label: 'Bathroom Break',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: crypto.randomUUID(),
    category: 'medicine',
    label: 'Medication',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];
