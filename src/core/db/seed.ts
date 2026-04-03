import type { Reminder } from '../../types/nyanudge';

export const defaultReminders: Partial<Reminder>[] = [
  {
    id: 'rem-water-id',
    category: 'water',
    label: 'Drink Water',
    enabled: true,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: 'sched-water-id',
        reminderId: 'rem-water-id',
        type: 'interval',
        timeValue: '120',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: '07:00',
        endTime: '21:00'
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rem-meal-id',
    category: 'meal',
    label: 'Eat Something',
    enabled: true,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: 'sched-meal-id',
        reminderId: 'rem-meal-id',
        type: 'fixed',
        timeValue: '12:30',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rem-exercise-id',
    category: 'exercise',
    label: 'Move Your Body',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: 'sched-exercise-id',
        reminderId: 'rem-exercise-id',
        type: 'fixed',
        timeValue: '10:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'rem-bathroom-id',
    category: 'bathroom',
    label: 'Bathroom Break',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: 'sched-bathroom-id',
        reminderId: 'rem-bathroom-id',
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
    id: 'rem-medicine-id',
    category: 'medicine',
    label: 'Medication',
    enabled: false,
    soundMode: 'sound_vibration',
    snoozeMins: 10,
    character: 'mochi',
    schedules: [
      {
        id: 'sched-medicine-id',
        reminderId: 'rem-medicine-id',
        type: 'fixed',
        timeValue: '08:00',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];
