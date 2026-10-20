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
 * Safely parses an ISO date string (YYYY-MM-DD or full ISO 8601), timestamp, or Date object into a valid Date object.
 * Returns null for invalid dates, empty strings, partial formats, or NaN timestamps to prevent runtime crashes.
 */
export function parseIsoDate(dateInput?: string | number | Date | null): Date | null {
  if (dateInput === null || dateInput === undefined) return null;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // Strict check for full YYYY-MM-DD format (prevents partial formats like '2026' or '2026-10')
    const ymdMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (ymdMatch) {
      const y = parseInt(ymdMatch[1], 10);
      const m = parseInt(ymdMatch[2], 10);
      const d = parseInt(ymdMatch[3], 10);
      if (m < 1 || m > 12 || d < 1 || d > 31) return null;
      const candidate = new Date(y, m - 1, d);
      // Ensure day didn't rollover (e.g. Feb 31 -> Mar 3)
      if (
        candidate.getFullYear() !== y ||
        candidate.getMonth() !== m - 1 ||
        candidate.getDate() !== d
      ) {
        return null;
      }
      return candidate;
    }

    // Explicitly reject partial dates like '2026', '2026-10', etc.
    if (/^\d{4}$/.test(trimmed) || /^\d{4}-\d{2}$/.test(trimmed)) {
      return null;
    }

    const candidate = new Date(trimmed);
    if (isNaN(candidate.getTime())) return null;
    return candidate;
  }

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : new Date(dateInput.getTime());
  }

  if (typeof dateInput === 'number') {
    if (isNaN(dateInput) || !isFinite(dateInput)) return null;
    const candidate = new Date(dateInput);
    return isNaN(candidate.getTime()) ? null : candidate;
  }

  return null;
}

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
  const parsed = parseIsoDate(dateStr);
  if (!parsed) return dateStr || '';
  const formatter = locale === 'it' ? GROUP_DATE_FORMATTERS.it : GROUP_DATE_FORMATTERS.en;
  try {
    return formatter.format(parsed);
  } catch {
    return dateStr;
  }
}

/**
 * Formats an expense transaction date (e.g. "12 ott" / "Oct 12").
 */
export function formatExpenseDate(dateStr: string, locale: string = 'it'): string {
  const parsed = parseIsoDate(dateStr);
  if (!parsed) return dateStr || '';
  const formatter = locale === 'it' ? DATE_FORMATTERS.it : DATE_FORMATTERS.en;
  try {
    return formatter.format(parsed);
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
  date: string | number | Date | null | undefined,
  locale: string = 'it',
  options?: Intl.DateTimeFormatOptions,
  fallback?: string,
): string {
  const parsed = parseIsoDate(date);
  if (!parsed) {
    return fallback !== undefined ? fallback : date ? String(date) : '';
  }
  try {
    const dateLocale = locale === 'it' ? 'it-IT' : 'en-US';
    return parsed.toLocaleDateString(dateLocale, options);
  } catch {
    return fallback !== undefined ? fallback : date ? String(date) : '';
  }
}
