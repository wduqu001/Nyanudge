import {
  LocalNotifications,
  type ScheduleOptions,
} from '@capacitor/local-notifications';

import { pickMessage } from '../i18n';
import i18n from '../i18n';

const CATEGORY_SOUND: Record<Category, string> = {
  water: 'chime_soft',
  meal: 'bell_gentle',
  exercise: 'bell_gentle',
  bathroom: 'chime_soft',
  medicine: 'chime_persistent',
};

// Android 8+ takes sound and vibration from the channel, not the notification, so each
// sound mode needs its own channel. Channel settings are immutable once created.
const SOUND_CHANNELS = {
  chime_soft: 'nyanudge_chime_soft',
  bell_gentle: 'nyanudge_bell_gentle',
  chime_persistent: 'nyanudge_medication',
} as const;
const VIBRATE_CHANNEL = 'nyanudge_vibrate';
const SILENT_CHANNEL = 'nyanudge_silent';

export function channelFor(category: Category, soundMode: SoundMode): string {
  if (soundMode === 'silent') return SILENT_CHANNEL;
  if (soundMode === 'vibration_only') return VIBRATE_CHANNEL;
  return SOUND_CHANNELS[CATEGORY_SOUND[category] as keyof typeof SOUND_CHANNELS];
}

/** Creates every channel the scheduler can use (idempotent). */
export async function ensureNotificationChannels(): Promise<void> {
  const channels = [
    { id: SOUND_CHANNELS.chime_soft, name: i18n.t('channels.chime_soft'), importance: 4 as const, sound: 'chime_soft', vibration: true },
    { id: SOUND_CHANNELS.bell_gentle, name: i18n.t('channels.bell_gentle'), importance: 4 as const, sound: 'bell_gentle', vibration: true },
    { id: SOUND_CHANNELS.chime_persistent, name: i18n.t('channels.medication'), importance: 5 as const, sound: 'chime_persistent', vibration: true },
    // A silent file: without one Android plays its default sound on a high-importance channel.
    { id: VIBRATE_CHANNEL, name: i18n.t('channels.vibrate'), importance: 4 as const, sound: 'silence', vibration: true },
    { id: SILENT_CHANNEL, name: i18n.t('channels.silent'), importance: 2 as const, vibration: false },
  ];
  await Promise.all(channels.map((c) =>
    LocalNotifications.createChannel({ ...c, visibility: 1 }).catch(() => {}),
  ));
}

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

    const candidate = new Date(now);
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
    const windowStart = new Date(now);
    windowStart.setHours(startH, startM, 0, 0);

    const windowEnd = new Date(now);
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

// Android caps an app at 500 concurrent alarms; the budget is shared by every reminder.
const MAX_TOTAL_SLOTS = 400;
const MAX_SLOTS_PER_REMINDER = 64;
const HORIZON_DAYS = 30;

export interface QuietHours {
  start: string; // 'HH:mm'
  end: string;
}

let quietHours: QuietHours | null = null;

/** Do Not Disturb window applied to every category except medicine. */
export function setQuietHours(hours: QuietHours | null): void {
  quietHours = hours;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function isInQuietHours(date: Date, hours: QuietHours | null): boolean {
  if (!hours) return false;
  const start = toMinutes(hours.start);
  const end = toMinutes(hours.end);
  if (start === end) return false;
  const t = date.getHours() * 60 + date.getMinutes();
  return start < end ? t >= start && t < end : t >= start || t < end;
}

/** Next fire times for a reminder across all its schedules, soonest first, within the horizon. */
export function upcomingFireTimes(reminder: Reminder, now: Date, limit: number): Date[] {
  const horizon = now.getTime() + HORIZON_DAYS * 86_400_000;
  const anchor = Math.floor(Math.max(reminder.updatedAt || 0, reminder.createdAt || 0) / 60_000) * 60_000;
  const quiet = reminder.category === 'medicine' ? null : quietHours;
  const times = new Map<number, Date>();

  for (const sched of reminder.schedules) {
    let pointer = now;
    // Quiet-hour slots are skipped, so scan a bounded number of candidates.
    for (let i = 0; i < limit * 4; i++) {
      const next = calculateNextFireTime(sched, sched.type === 'interval' ? anchor : undefined, pointer);
      if (!next || next.getTime() > horizon) break;
      if (!isInQuietHours(next, quiet)) times.set(next.getTime(), next);
      pointer = new Date(next.getTime() + 60_000);
    }
  }

  return [...times.values()].sort((a, b) => a.getTime() - b.getTime()).slice(0, limit);
}

function baseNotification(reminder: Reminder) {
  const cat = reminder.category as Category;
  return {
    title: i18n.t(`categories.${reminder.category}.name`),
    sound: reminder.soundMode === 'sound_vibration' ? CATEGORY_SOUND[cat] : 'silence',
    smallIcon: CATEGORY_ICONS[cat],
    channelId: channelFor(cat, reminder.soundMode),
    actionTypeId: 'NYANUDGE_REMINDER',
  };
}

function buildNotifications(reminder: Reminder, times: Date[], exact: boolean): ScheduleOptions['notifications'] {
  const base = baseNotification(reminder);
  return times.map((at, i) => ({
    ...base,
    id: hashId(`${reminder.id}-slot-${i}`),
    body: reminder.customMessage || pickMessage(reminder.category),
    // One-shot alarms only: the plugin's `repeats` with `at` repeats every (at - now), not daily.
    schedule: { at, allowWhileIdle: true },
    isExactNotification: exact,
    extra: {
      reminderId: reminder.id,
      category: reminder.category,
      animationKey: CATEGORY_ANIMATION[reminder.category as Category],
      snoozeMins: reminder.snoozeMins,
    },
  }));
}

async function canScheduleExact(): Promise<boolean> {
  try {
    return (await LocalNotifications.checkExactNotificationSetting()).exact_alarm === 'granted';
  } catch {
    return false;
  }
}

async function doReschedule(reminders: Reminder[]): Promise<void> {
  const permission = await LocalNotifications.checkPermissions().catch(() => null);
  // The plugin rejects every schedule() while notifications are disabled.
  if (permission?.display !== 'granted') return;

  const active = reminders.filter((r) => r.enabled && !r.archived);
  const activeIds = new Set(active.map((r) => r.id));

  const pending = await LocalNotifications.getPending().catch(() => ({ notifications: [] }));
  const stale = pending.notifications.filter(
    (n) => !(n.extra?.isSnoozed && activeIds.has(n.extra?.reminderId)),
  );
  if (stale.length > 0) {
    await LocalNotifications.cancel({ notifications: stale.map((n) => ({ id: n.id })) });
  }
  if (active.length === 0) return;

  // Asking for exact alarms without the permission makes the plugin open system settings.
  const exact = await canScheduleExact();
  const perReminder = Math.min(MAX_SLOTS_PER_REMINDER, Math.floor(MAX_TOTAL_SLOTS / active.length));
  const now = new Date();
  const notifications = active.flatMap((r) => buildNotifications(r, upcomingFireTimes(r, now, perReminder), exact));
  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
  lastRescheduleAt = Date.now();
}

let queue: Promise<void> = Promise.resolve();
let lastRescheduleAt = 0;

export function msSinceLastReschedule(): number {
  return Date.now() - lastRescheduleAt;
}

/**
 * Replaces every pending reminder notification with a fresh batch for `reminders`, keeping
 * pending snoozes of active reminders. Calls run one at a time in call order.
 */
export function rescheduleAll(reminders: Reminder[]): Promise<void> {
  queue = queue
    .then(() => doReschedule(reminders))
    .catch((error) => console.error('[Scheduler] Failed to reschedule reminders', error));
  return queue;
}

/** Schedules a one-off snooze; replaces any earlier snooze of the same reminder. */
export async function snoozeReminder(reminder: Reminder): Promise<void> {
  const fireTime = new Date(Date.now() + reminder.snoozeMins * 60_000);
  await LocalNotifications.schedule({
    notifications: [{
      ...baseNotification(reminder),
      id: hashId(`${reminder.id}-snooze`),
      body: i18n.t(`snooze.${reminder.snoozeMins}`),
      schedule: { at: fireTime, allowWhileIdle: true },
      isExactNotification: await canScheduleExact(),
      extra: {
        reminderId: reminder.id,
        category: reminder.category,
        animationKey: CATEGORY_ANIMATION[reminder.category as Category],
        snoozeMins: reminder.snoozeMins,
        isSnoozed: true,
      },
    }],
  });
}
