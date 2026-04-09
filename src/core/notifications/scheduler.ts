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

const CATEGORY_ICONS: Record<string, string> = {
  water:    'ic_stat_water',
  meal:     'ic_stat_meal',
  exercise: 'ic_stat_exercise',
  bathroom: 'ic_stat_bathroom',
  medicine: 'ic_stat_medicine',
};

/** Safe random int that fits in a 32-bit signed int (Android alarm ID limit). */
function randomId(): number {
  return Math.floor(Math.random() * 1_900_000) + 100_000;
}

/**
 * Calculates the next fire time for a given schedule rule.
 */
export function calculateNextFireTime(schedule: Schedule): Date | undefined {
  const now = new Date();

  if (schedule.type === 'fixed' && schedule.timeValue) {
    const parts = schedule.timeValue.split(':');
    const hours   = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return undefined;

    const candidate = new Date();
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 1);
    }

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
    if (isNaN(intervalMins) || intervalMins <= 0) return undefined;

    // Default window: whole day (00:00 – 23:59) unless the user set a window.
    const startParts = (schedule.startTime ?? '00:00').split(':');
    const endParts   = (schedule.endTime   ?? '23:59').split(':');

    const startH = Number(startParts[0]), startM = Number(startParts[1]);
    const endH   = Number(endParts[0]),   endM   = Number(endParts[1]);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return undefined;

    const windowStart = new Date(); windowStart.setHours(startH, startM, 0, 0);
    const windowEnd   = new Date(); windowEnd.setHours(endH, endM, 0, 0);

    // Before window starts today → fire at window start
    if (now < windowStart) return windowStart;

    // Inside window → snap to the next clean slot aligned to windowStart
    if (now <= windowEnd) {
      const elapsedMs   = now.getTime() - windowStart.getTime();
      const intervalMs  = intervalMins * 60_000;
      // How many complete intervals have elapsed since the window opened?
      const slotsElapsed = Math.floor(elapsedMs / intervalMs);
      // Next slot = windowStart + (slotsElapsed + 1) intervals
      const next = new Date(windowStart.getTime() + (slotsElapsed + 1) * intervalMs);
      if (next <= windowEnd) return next;
    }

    // Past window → fire at window start tomorrow
    const tomorrow = new Date(windowStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  return undefined;
}

/** Cancel ALL pending notifications that belong to this reminder by scanning getPending(). */
export async function cancelReminder(reminder: Reminder): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    const toCancel = pending.notifications
      .filter(n => n.extra?.reminderId === reminder.id)
      .map(n => ({ id: n.id }));

    if (toCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: toCancel });
    }
  } catch {
    // Fallback: cancel by stored notifId when getPending is unavailable
    const ids = reminder.schedules
      .filter(s => s.notifId != null)
      .map(s => ({ id: s.notifId as number }));
    if (ids.length > 0) {
      await LocalNotifications.cancel({ notifications: ids }).catch(() => {});
    }
  }
}

/**
 * Schedules active notifications for a reminder.
 * Always generates FRESH random IDs so new batches never collide with
 * the notification currently sitting in the Android tray.
 */
export async function scheduleReminder(reminder: Reminder): Promise<void> {
  if (!reminder.enabled) return;

  const title = i18n.t(`categories.${reminder.category}.name`);
  const cat   = reminder.category as Category;
  const notifications: ScheduleOptions['notifications'] = [];

  const common = {
    title,
    body:         reminder.customMessage ?? pickMessage(reminder.category),
    sound:        reminder.soundMode !== 'silent' ? CATEGORY_SOUND[cat] : undefined,
    smallIcon:    CATEGORY_ICONS[cat],
    channelId:    CATEGORY_CHANNEL[cat],
    actionTypeId: 'NYANUDGE_REMINDER',
    extra: {
      reminderId:   reminder.id,
      category:     reminder.category,
      animationKey: CATEGORY_ANIMATION[cat],
      snoozeMins:   reminder.snoozeMins,
    },
  };

  for (const sched of reminder.schedules) {
    if (sched.type === 'fixed') {
      const fireTime = calculateNextFireTime(sched);
      if (!fireTime) continue;

      // Fixed: use native daily repeat — stable ID is fine (no tray collision risk)
      const notifId = sched.notifId ?? randomId();
      notifications.push({
        ...common,
        id:       notifId,
        schedule: { at: fireTime, repeats: true, every: 'day' },
      });

    } else if (sched.type === 'interval') {
      const intervalMins = parseInt(sched.timeValue ?? '60', 10);
      if (isNaN(intervalMins) || intervalMins <= 0) continue;

      const endParts  = (sched.endTime ?? '23:59').split(':');
      const windowEnd = new Date();
      windowEnd.setHours(Number(endParts[0]), Number(endParts[1]), 0, 0);

      let nextTime = calculateNextFireTime(sched);

      // Schedule next 8 one-shot slots — every slot gets a FRESH random ID
      // so it never overwrites a notification that's already in the tray.
      for (let i = 0; i < 8; i++) {
        if (!nextTime) break;

        notifications.push({
          ...common,
          id:       randomId(),           // <── fresh ID every time
          schedule: { at: new Date(nextTime), repeats: false },
        });

        const after = new Date(nextTime.getTime() + intervalMins * 60_000);
        if (after > windowEnd) break;
        nextTime = after;
      }
    }
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}

/** Reschedule a notification for snooze. */
export async function snoozeReminder(
  notifId: number,
  reminder: Reminder,
): Promise<void> {
  const fireTime = new Date(Date.now() + reminder.snoozeMins * 60_000);
  const cat      = reminder.category as Category;
  const title    = i18n.t(`categories.${reminder.category}.name`);

  await LocalNotifications.schedule({
    notifications: [{
      id:           notifId,  // reuse the same ID so the tray notification is replaced, not duplicated
      title,
      body:         i18n.t(`snooze.${reminder.snoozeMins}`),
      schedule:     { at: fireTime, repeats: false },
      sound:        reminder.soundMode !== 'silent' ? CATEGORY_SOUND[cat] : undefined,
      smallIcon:    CATEGORY_ICONS[cat],
      channelId:    CATEGORY_CHANNEL[cat],
      actionTypeId: 'NYANUDGE_REMINDER',
      extra: {
        reminderId:   reminder.id,
        category:     reminder.category,
        animationKey: CATEGORY_ANIMATION[cat],
        snoozeMins:   reminder.snoozeMins,
        isSnoozed:    true,
      },
    }],
  });
}
