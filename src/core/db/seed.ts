import { v4 as uuidv4 } from 'uuid'; // I might need to install 'uuid' or use a simpler ID generator if not available.
// Since PRD mentioned uuid(), I'll check if 'uuid' package is in package.json.
// Wait, package.json does not have 'uuid'. I'll use crypto.randomUUID() which is modern.

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
