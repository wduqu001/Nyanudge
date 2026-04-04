

const waterId = crypto.randomUUID();
const mealId = crypto.randomUUID();
const exerciseId = crypto.randomUUID();
const bathroomId = crypto.randomUUID();
const medicineId = crypto.randomUUID();


export const defaultReminders: Partial<Reminder>[] = [
  {
    id: waterId,
    category: 'water',
    label: 'Drink Water',
    enabled: true,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: crypto.randomUUID(),
        reminderId: waterId,
        type: 'fixed',
        timeValue: '09:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      },
      {
        id: crypto.randomUUID(),
        reminderId: waterId,
        type: 'fixed',
        timeValue: '12:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      },
      {
        id: crypto.randomUUID(),
        reminderId: waterId,
        type: 'fixed',
        timeValue: '15:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: mealId,
    category: 'meal',
    label: 'Eat Something',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: crypto.randomUUID(),
        reminderId: mealId,
        type: 'fixed',
        timeValue: '12:30',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: exerciseId,
    category: 'exercise',
    label: 'Move Your Body',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: crypto.randomUUID(),
        reminderId: exerciseId,
        type: 'fixed',
        timeValue: '10:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: bathroomId,
    category: 'bathroom',
    label: 'Bathroom Break',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: crypto.randomUUID(),
        reminderId: bathroomId,
        type: 'interval',
        timeValue: '180',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '08:00',
        endTime: '22:00'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: medicineId,
    category: 'medicine',
    label: 'Medication',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: crypto.randomUUID(),
        reminderId: medicineId,
        type: 'fixed',
        timeValue: '08:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];

export const mockStats = {
  water: {
    category: 'water',
    currentStreak: 5,
    longestStreak: 12,
    lastCompletedDate: new Date().toISOString().slice(0, 10),
    completionRateLast7Days: 0.85,
  },
  meal: {
    category: 'meal',
    currentStreak: 3,
    longestStreak: 7,
    lastCompletedDate: new Date().toISOString().slice(0, 10),
    completionRateLast7Days: 0.70,
  },
  exercise: {
    category: 'exercise',
    currentStreak: 0,
    longestStreak: 4,
    lastCompletedDate: null,
    completionRateLast7Days: 0.20,
  },
} as any;

export const mockRecentCompletions = [
  { id: crypto.randomUUID(), reminderId: waterId, category: 'water', completedAt: Date.now() - 1000 * 60 * 60 * 2, wasSkipped: false },
  { id: crypto.randomUUID(), reminderId: mealId, category: 'meal', completedAt: Date.now() - 1000 * 60 * 60 * 5, wasSkipped: false },
  { id: crypto.randomUUID(), reminderId: waterId, category: 'water', completedAt: Date.now() - 1000 * 60 * 60 * 24, wasSkipped: false },
  { id: crypto.randomUUID(), reminderId: waterId, category: 'water', completedAt: Date.now() - 1000 * 60 * 60 * 48, wasSkipped: false },
  { id: crypto.randomUUID(), reminderId: mealId, category: 'meal', completedAt: Date.now() - 1000 * 60 * 60 * 50, wasSkipped: false },
] as any;
