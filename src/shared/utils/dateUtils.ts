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
