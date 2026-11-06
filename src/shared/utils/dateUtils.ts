/**
 * Formats a HH:mm time string according to the user's locale.
 * @param timeStr "08:00"
 * @param locale "en-US", "pt-BR", etc.
 */
export const formatLocalizedTime = (timeStr: string | undefined, locale: string | undefined): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const [hStr, mStr] = parts;
  if (!hStr || !mStr) return timeStr;
  
  const date = new Date();
  date.setHours(parseInt(hStr, 10));
  date.setMinutes(parseInt(mStr, 10));
  
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Returns a list of localized weekday initials starting from Sunday.
 */
export const getLocalizedWeekdays = (locale: string | undefined): string[] => {
  const baseDate = new Date(2024, 0, 7); // Jan 7, 2024 is a Sunday
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    weekDays.push(d.toLocaleDateString(locale, { weekday: 'narrow' }));
  }
  return weekDays;
};

/** Localized short duration for a countdown, e.g. "5 min", "2 hr 5 min", "3 days" (pt-BR: "3 dias"). */
export const formatDuration = (minutes: number, locale: string | undefined): string => {
  const unit = (u: 'minute' | 'hour' | 'day', n: number) =>
    new Intl.NumberFormat(locale, { style: 'unit', unit: u, unitDisplay: 'short' }).format(n);
  if (minutes < 60) return unit('minute', minutes);
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${unit('hour', hours)} ${unit('minute', rest)}` : unit('hour', hours);
  }
  return unit('day', Math.floor(minutes / 1440));
};

/** Time of the next fire: just the time when it is today, otherwise with the weekday. */
export const formatNextFire = (date: Date, now: Date, locale: string | undefined): string =>
  date.toDateString() === now.toDateString()
    ? date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleString(locale, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
