import {
  LocalNotifications,
  type ScheduleOptions,
} from '@capacitor/local-notifications';

import { pickMessage } from '../i18n';
import i18n from '../i18n';

// Maps each category to the appropriate sound file and channel
const CATEGORY_CHANNEL: Record<Category, string> = {
  water:    'nyanudge_default',
  meal:     'nyanudge_default',
  exercise: 'nyanudge_default',
  bathroom: 'nyanudge_default',
  medicine: 'nyanudge_medication',
};

const CATEGORY_SOUND: Record<Category, string> = {
  water:    'chime_soft',
  meal:     'bell_gentle',
  exercise: 'bell_gentle',
  bathroom: 'chime_soft',
  medicine: 'chime_persistent',
};

const CATEGORY_ANIMATION: Record<Category, string> = {
  water:    'cat_water',
  meal:     'cat_meal',
  exercise: 'cat_exercise',
  bathroom: 'cat_bathroom',
  medicine: 'cat_medicine',
};

/**
 * Calculates the next fire time for a given schedule rule.
 * Returns undefined if the schedule doesn't fit into today's window.
 */
export function calculateNextFireTime(schedule: Schedule): Date | undefined {
  const now = new Date();

  if (schedule.type === 'fixed' && schedule.timeValue) {
    const parts = schedule.timeValue.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (isNaN(hours) || isNaN(minutes)) return undefined;

    const candidate = new Date();
    candidate.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, push to tomorrow
    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 1);
    }

    // If daysOfWeek is defined, advance to the next valid day
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      let attempts = 0;
      while (!schedule.daysOfWeek.includes(candidate.getDay()) && attempts < 8) {
        candidate.setDate(candidate.getDate() + 1);
        attempts++;
      }
      if (attempts >= 8) return undefined;
    }

    return candidate;
  }

  if (schedule.type === 'interval' && schedule.timeValue) {
    const intervalMins = parseInt(schedule.timeValue, 10);
    const startParts = (schedule.startTime ?? '07:00').split(':');
    const endParts   = (schedule.endTime   ?? '21:00').split(':');

    const startH = Number(startParts[0]);
    const startM = Number(startParts[1]);
    const endH   = Number(endParts[0]);
    const endM   = Number(endParts[1]);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return undefined;

    const windowStart = new Date();
    windowStart.setHours(startH, startM, 0, 0);

    const windowEnd = new Date();
    windowEnd.setHours(endH, endM, 0, 0);

    // Step through slots from windowStart until we find one in the future
    let candidate = new Date(windowStart);
    while (candidate <= now) {
      candidate = new Date(candidate.getTime() + intervalMins * 60_000);
    }

    // If candidate is past the window end, push to start of window tomorrow
    if (candidate > windowEnd) {
      const tomorrow = new Date(windowStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return candidate;
  }

  return undefined;
}

/**
 * Schedules all active notifications for a given reminder.
 * Cancels any previously scheduled notifications for the same reminder first.
 */
export async function scheduleReminder(reminder: Reminder): Promise<void> {
  if (!reminder.enabled) return;

  const title = i18n.t(`categories.${reminder.category}.name`);
  const notifications: ScheduleOptions['notifications'] = [];

  for (const sched of reminder.schedules) {
    const fireTime = calculateNextFireTime(sched);
    if (!fireTime) continue;

    const notifId = sched.notifId ?? Math.floor(Math.random() * 2_000_000);

    notifications.push({
      id: notifId,
      title,
      body: reminder.customMessage ?? pickMessage(reminder.category),
      schedule: { at: fireTime, repeats: false }, // re-schedule on each fire via action handler
      sound: reminder.soundMode !== 'silent' ? CATEGORY_SOUND[reminder.category as Category] : undefined,
      channelId: CATEGORY_CHANNEL[reminder.category as Category],
      extra: {
        reminderId: reminder.id,
        category: reminder.category,
        animationKey: CATEGORY_ANIMATION[reminder.category as Category],
        snoozeMins: reminder.snoozeMins,
      },
    });
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}

/**
 * Cancels all notifications for a given reminder.
 */
export async function cancelReminder(reminder: Reminder): Promise<void> {
  const ids = reminder.schedules
    .filter((s) => s.notifId != null)
    .map((s) => ({ id: s.notifId as number }));

  if (ids.length > 0) {
    await LocalNotifications.cancel({ notifications: ids });
  }
}

/**
 * Reschedules a notification for a snooze (one-shot, fires in `snoozeMins` minutes).
 */
export async function snoozeReminder(
  notifId: number,
  reminder: Reminder,
): Promise<void> {
  const fireTime = new Date(Date.now() + reminder.snoozeMins * 60_000);
  const title = i18n.t(`categories.${reminder.category}.name`);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId,
        title,
        body: i18n.t(`snooze.${reminder.snoozeMins}`),
        schedule: { at: fireTime, repeats: false },
        sound: reminder.soundMode !== 'silent' ? CATEGORY_SOUND[reminder.category as Category] : undefined,
        channelId: CATEGORY_CHANNEL[reminder.category as Category],
        extra: {
          reminderId: reminder.id,
          category: reminder.category,
          animationKey: CATEGORY_ANIMATION[reminder.category as Category],
          snoozeMins: reminder.snoozeMins,
          isSnoozed: true,
        },
      },
    ],
  });
}
