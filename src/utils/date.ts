/**
 * Centralized Date Utilities & Formatters
 *
 * Provides locale-aware date formatting, period manipulation, and
 * timezone-safe local ISO string generators.
 */

export const GROUP_DATE_FORMATTERS: Record<string, Intl.DateTimeFormat> = {
  it: new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }),
  en: new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }),
};

export const DATE_FORMATTERS: Record<string, Intl.DateTimeFormat> = {
  it: new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }),
  en: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }),
};

/**
 * Returns a timezone-safe ISO date string (YYYY-MM-DD) for local time.
 */
export const getTodayLocalIso = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns a timezone-safe ISO date string (YYYY-MM-DD) for yesterday in local time.
 */
export const getYesterdayLocalIso = (d: Date = new Date()): string => {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() - 1);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, '0');
  const day = String(copy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string (YYYY-MM-DD) as a localized register group header
 * (e.g. "lun 12 ottobre" or "Mon, Oct 12").
 */
export function formatGroupDateHeader(dateStr: string, locale: string = 'it'): string {
  const formatter = locale === 'it' ? GROUP_DATE_FORMATTERS.it : GROUP_DATE_FORMATTERS.en;
  try {
    const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
    if (y && m && d) {
      return formatter.format(new Date(y, m - 1, d));
    }
    return formatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Formats an expense transaction date (e.g. "12 ott" / "Oct 12").
 */
export function formatExpenseDate(dateStr: string, locale: string = 'it'): string {
  const formatter = locale === 'it' ? DATE_FORMATTERS.it : DATE_FORMATTERS.en;
  try {
    return formatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Parses a YYYY-MM period string safely into 1-indexed year and month numbers.
 */
export function parsePeriod(period?: string): { year: number; month: number } {
  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const [yearStr, monthStr] = period.split('-');
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr, 10) };
}

/**
 * Formats a YYYY-MM period string into a human-readable month/year label
 * (e.g. "ottobre 2026" or "October 2026").
 */
export function formatPeriodLabel(period: string, locale: string = 'it'): string {
  try {
    const { year, month } = parsePeriod(period);
    const dateLocale = locale === 'it' ? 'it-IT' : 'en-US';
    return new Date(year, month - 1, 1).toLocaleDateString(dateLocale, {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return period;
  }
}

/**
 * Calculates the adjacent YYYY-MM period offset by delta (-1 or +1).
 */
export function getAdjacentPeriod(period: string, delta: -1 | 1): string {
  const { year, month } = parsePeriod(period);
  let newMonth = month + delta;
  let newYear = year;
  if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  } else if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  }
  return `${newYear}-${String(newMonth).padStart(2, '0')}`;
}

/**
 * Formats any ISO date string, timestamp, or Date object into localized text.
 */
export function formatIsoDate(
  date: string | number | Date,
  locale: string = 'it',
  options?: Intl.DateTimeFormatOptions,
): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return String(date);
    const dateLocale = locale === 'it' ? 'it-IT' : 'en-US';
    return d.toLocaleDateString(dateLocale, options);
  } catch {
    return String(date);
  }
}
