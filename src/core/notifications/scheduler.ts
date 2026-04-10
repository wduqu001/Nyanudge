import {
  LocalNotifications,
  type ScheduleOptions,
} from '@capacitor/local-notifications';

import { pickMessage } from '../i18n';
import i18n from '../i18n';

// Maps each category to the appropriate sound file and channel
const CATEGORY_CHANNEL: Record<Category, string> = {
  water: 'nyanudge_default',
  meal: 'nyanudge_default',
  exercise: 'nyanudge_default',
  bathroom: 'nyanudge_default',
  medicine: 'nyanudge_medication',
};

const CATEGORY_SOUND: Record<Category, string> = {
  water: 'chime_soft',
  meal: 'bell_gentle',
  exercise: 'bell_gentle',
  bathroom: 'chime_soft',
  medicine: 'chime_persistent',
};

const CATEGORY_ANIMATION: Record<Category, string> = {
  water: 'cat_water',
  meal: 'cat_meal',
  exercise: 'cat_exercise',
  bathroom: 'cat_bathroom',
  medicine: 'cat_medicine',
};

const CATEGORY_ICONS: Record<string, string> = {
  water: 'ic_stat_water',
  meal: 'ic_stat_meal',
  exercise: 'ic_stat_exercise',
  bathroom: 'ic_stat_bathroom',
  medicine: 'ic_stat_medicine',
};

/** 
 * Generates a deterministic 32-bit integer ID based on a string seed.
 * This ensures we can cancel the exact notification later without needing 
 * to query the OS for pending notifications.
 */
function hashId(seed: string): number {
  let hash = 0;
  if (seed.length === 0) return hash;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculates the next fire time for a given schedule rule.
 * Handles overnight windows (e.g. 10pm - 6am).
 */
export function calculateNextFireTime(schedule: Schedule, anchor?: number, overrideNow?: Date): Date | undefined {
  const now = overrideNow ?? new Date();

  // --- FIXED SCHEDULE ---
  if (schedule.type === 'fixed' && schedule.timeValue) {
    const parts = schedule.timeValue.split(':');
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return undefined;

    const candidate = new Date();
    candidate.setHours(hours, minutes, 0, 0);

    // If time passed today, start from tomorrow
    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 1);
    }

    // If specific days are selected, scan forward
    if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
      let attempts = 0;
      // Scan up to 7 days ahead to find a matching day
      while (!schedule.daysOfWeek.includes(candidate.getDay()) && attempts < 8) {
        candidate.setDate(candidate.getDate() + 1);
        attempts++;
      }
      if (attempts >= 8) return undefined; // Should not happen with valid data
    }

    return candidate;
  }

  // --- INTERVAL SCHEDULE ---
  if (schedule.type === 'interval' && schedule.timeValue) {
    const intervalMins = parseInt(schedule.timeValue, 10);
    if (isNaN(intervalMins) || intervalMins <= 0) return undefined;

    // Parse window boundaries
    const startParts = (schedule.startTime ?? '00:00').split(':');
    const endParts = (schedule.endTime ?? '23:59').split(':');

    const startH = Number(startParts[0]), startM = Number(startParts[1]);
    const endH = Number(endParts[0]), endM = Number(endParts[1]);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return undefined;

    // Create date objects for the window relative to 'now'
    let windowStart = new Date(now);
    windowStart.setHours(startH, startM, 0, 0);

    let windowEnd = new Date(now);
    windowEnd.setHours(endH, endM, 0, 0);

    // Handle Overnight Window (e.g., 22:00 to 06:00)
    if (windowStart > windowEnd) {
      // If currently past the end time (e.g., 02:00 AM is after 23:59 PM of previous day logic? No.)
      // If now is 02:00 AM:
      // Effective windowStart was 22:00 yesterday. Effective windowEnd is 06:00 today.
      if (now < windowEnd) {
        // We are in the early morning part of the overnight window.
        // Move start back by one day.
        windowStart.setDate(windowStart.getDate() - 1);
      } else if (now >= windowEnd) {
        // We are in the day (e.g. 14:00). The window starts tonight and ends tomorrow morning.
        windowEnd.setDate(windowEnd.getDate() + 1);
      }
    }

    // CASE 1: Current time is before window starts today
    if (now < windowStart) {
      return windowStart;
    }

    // CASE 2: Current time is inside the window
    if (now >= windowStart && now <= windowEnd) {
      const anchorTime = anchor ?? windowStart.getTime();
      const intervalMs = intervalMins * 60_000;

      // Calculate how many intervals have passed since anchor
      const elapsedSince = now.getTime() - anchorTime;
      const slotsPassed = Math.floor(elapsedSince / intervalMs);

      // Calculate next slot
      const next = new Date(anchorTime + (slotsPassed + 1) * intervalMs);

      // If next slot is still inside window, return it
      if (next <= windowEnd) {
        return next;
      }
    }

    // CASE 3: Past window or next slot falls outside window
    // Return start of window tomorrow
    const tomorrowStart = new Date(windowStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // Correction: If it was an overnight window that ended this morning,
    // the next window starts tonight (which is startH today, but date+0 logic above handles it? 
    // No, windowStart might be yesterday. We need 'tomorrow' relative to the START time).

    // Simpler logic for "Tomorrow": Just add 1 day to the calculated windowStart 
    // (which represents the start of the next occurrence of the start-hour)
    const nextValidStart = new Date(windowStart);
    nextValidStart.setDate(nextValidStart.getDate() + 1);

    // If windowStart was shifted back (overnight logic case 1), adding 1 day brings us to today's start time (correct).
    // If windowStart was today (normal logic), adding 1 day brings us to tomorrow (correct).
    return nextValidStart;
  }

  return undefined;
}

/** 
 * Cancels notifications by reconstructing their deterministic IDs.
 * This is faster and more reliable than filtering pending lists.
 */
export async function cancelReminder(reminder: Reminder): Promise<void> {
  // 1. Cancel deterministic future notifications (The "Happy Path")
  // We reconstruct the IDs we *know* we scheduled in scheduleReminder().
  const deterministicIds: { id: number }[] = [];

  reminder.schedules.forEach((_, index) => {
    // We cancel the range of IDs used for batching (fixed days / intervals)
    for (let i = 0; i < 10; i++) {
      const seed = `${reminder.id}-sched-${index}-item-${i}`;
      deterministicIds.push({ id: hashId(seed) });
    }
  });

  if (deterministicIds.length > 0) {
    await LocalNotifications.cancel({ notifications: deterministicIds }).catch(() => { });
  }

  // 2. Cancel dynamic snoozed notifications (The "Edge Case")
  // Snoozed notifications reuse the original fired ID, which we can't predict.
  // We must query the OS for these.
  try {
    const pending = await LocalNotifications.getPending();
    const snoozedToCancel = pending.notifications
      .filter(n => n.extra?.reminderId === reminder.id)
      .map(n => ({ id: n.id }));

    if (snoozedToCancel.length > 0) {
      await LocalNotifications.cancel({ notifications: snoozedToCancel });
    }
  } catch (e) {
    console.warn('Could not perform deep scan for snoozed notifications', e);
  }
}

/**
 * Schedules active notifications for a reminder.
 * Uses deterministic IDs for reliable cancellation and handles 
 * iOS notification limits (64 max).
 */
export async function scheduleReminder(reminder: Reminder): Promise<void> {
  if (!reminder.enabled) return;

  // Ensure old notifications are cleared before scheduling new ones
  await cancelReminder(reminder);

  const title = i18n.t(`categories.${reminder.category}.name`);
  const cat = reminder.category as Category;
  const notifications: ScheduleOptions['notifications'] = [];

  const generateId = (suffix: string | number): number => {
    return hashId(`${reminder.id}-sched-${suffix}`);
  };

  const common = {
    title,
    body: reminder.customMessage ?? pickMessage(reminder.category),
    sound: reminder.soundMode !== 'silent' ? CATEGORY_SOUND[cat] : undefined,
    smallIcon: CATEGORY_ICONS[cat],
    channelId: CATEGORY_CHANNEL[cat],
    actionTypeId: 'NYANUDGE_REMINDER',
    extra: {
      reminderId: reminder.id,
      category: reminder.category,
      animationKey: CATEGORY_ANIMATION[cat],
      snoozeMins: reminder.snoozeMins,
    },
  };

  // A counter to ensure we don't exceed iOS limit of 64 pending notifications
  let totalScheduled = 0;
  const MAX_NOTIFICATIONS = 60; // Safe buffer under 64

  for (const schedIndex in reminder.schedules) {
    if (totalScheduled >= MAX_NOTIFICATIONS) break;

    const sched = reminder.schedules[schedIndex];
    if (!sched) continue;

    if (sched.type === 'fixed') {
      // -------------------------------------------------------
      // CASE 1: FIXED TIME
      // Handle "One-off" or "Daily" (no daysOfWeek specified)
      // -------------------------------------------------------

      if (!sched.daysOfWeek || sched.daysOfWeek.length === 0) {
        // Sub-case 1A: Simple Daily Repeat
        const fireTime = calculateNextFireTime(sched);
        if (!fireTime) continue;

        notifications.push({
          ...common,
          id: generateId(`${schedIndex}-daily`), // Stable ID: e.g. "123-sched-0-daily"
          schedule: { at: fireTime, repeats: true, every: 'day' },
        });
        totalScheduled++;

      } else {
        // Sub-case 1B: Specific Days (Mon, Wed, Fri)
        // MUST schedule individual instances because native 'daily repeat' ignores weekdays

        let pointer = new Date();
        // Schedule the next 10 occurrences to keep the user reminded
        for (let i = 0; i < 10 && totalScheduled < MAX_NOTIFICATIONS; i++) {
          const nextTime = calculateNextFireTime(sched, undefined, pointer);
          if (!nextTime) break;

          notifications.push({
            ...common,
            id: generateId(`${schedIndex}-day-${i}`), // Stable ID: e.g. "123-sched-0-day-0"
            schedule: { at: nextTime, repeats: false },
          });

          // Advance pointer to search for the next valid day
          pointer = new Date(nextTime.getTime() + 24 * 60 * 60 * 1000);
          totalScheduled++;
        }
      }

    } else if (sched.type === 'interval') {
      // -------------------------------------------------------
      // CASE 2: INTERVAL
      // -------------------------------------------------------

      const intervalMins = parseInt(sched.timeValue ?? '60', 10);
      if (isNaN(intervalMins) || intervalMins <= 0) continue;

      // Anchor calculation for drift prevention
      const anchorTs = Math.max(reminder.updatedAt || 0, reminder.createdAt || 0);
      const cleanAnchor = Math.floor(anchorTs / 60000) * 60000;

      let currentPointer: Date | undefined = undefined;

      // Project the next 64 window-aware slots (or until limit reached)
      for (let i = 0; i < 64 && totalScheduled < MAX_NOTIFICATIONS; i++) {
        const nextTime = calculateNextFireTime(sched, cleanAnchor, currentPointer);
        if (!nextTime) break;

        notifications.push({
          ...common,
          id: generateId(`${schedIndex}-int-${i}`), // Stable ID: e.g. "123-sched-1-int-0"
          schedule: { at: nextTime, repeats: false },
        });

        // Advance pointer 1 second past this fire time to find the next slot
        currentPointer = new Date(nextTime.getTime() + 1000);
        totalScheduled++;
      }
    }
  }

  if (notifications.length > 0) {
    try {
      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error(`Failed to schedule reminder ${reminder.id}`, error);
    }
  }
}

/** Reschedule a notification for snooze. */
export async function snoozeReminder(
  notifId: number,
  reminder: Reminder,
): Promise<void> {
  const fireTime = new Date(Date.now() + reminder.snoozeMins * 60_000);
  const cat = reminder.category as Category;
  const title = i18n.t(`categories.${reminder.category}.name`);

  // We intentionally use the provided 'notifId' to replace the existing 
  // tray notification instead of creating a duplicate.
  await LocalNotifications.schedule({
    notifications: [{
      id: notifId,
      title,
      body: i18n.t(`snooze.${reminder.snoozeMins}`),
      schedule: { at: fireTime, repeats: false },
      sound: reminder.soundMode !== 'silent' ? CATEGORY_SOUND[cat] : undefined,
      smallIcon: CATEGORY_ICONS[cat],
      channelId: CATEGORY_CHANNEL[cat],
      actionTypeId: 'NYANUDGE_REMINDER',
      extra: {
        reminderId: reminder.id,
        category: reminder.category,
        animationKey: CATEGORY_ANIMATION[cat],
        snoozeMins: reminder.snoozeMins,
        isSnoozed: true,
      },
    }],
  });
}
