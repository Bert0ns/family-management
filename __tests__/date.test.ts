import {
  getTodayLocalIso,
  getYesterdayLocalIso,
  GROUP_DATE_FORMATTERS,
  DATE_FORMATTERS,
  formatGroupDateHeader,
  formatExpenseDate,
  parsePeriod,
  formatPeriodLabel,
  getAdjacentPeriod,
  formatIsoDate,
  parseIsoDate,
} from '@/utils/date';

describe('Date Utilities & Formatters', () => {
  describe('getTodayLocalIso and getYesterdayLocalIso', () => {
    it('returns ISO date formatted string in local time', () => {
      const fixedDate = new Date(2026, 9, 20, 15, 30, 0); // October 20, 2026 (month is 0-indexed)
      expect(getTodayLocalIso(fixedDate)).toBe('2026-10-20');
    });

    it('returns yesterday formatted string correctly across month boundaries', () => {
      const firstOfMonth = new Date(2026, 9, 1, 10, 0, 0); // October 1, 2026
      expect(getYesterdayLocalIso(firstOfMonth)).toBe('2026-09-30');
    });

    it('returns yesterday formatted string correctly across year boundaries', () => {
      const newYearDay = new Date(2026, 0, 1, 8, 0, 0); // January 1, 2026
      expect(getYesterdayLocalIso(newYearDay)).toBe('2025-12-31');
    });

    it('defaults to current date when no argument is supplied', () => {
      const result = getTodayLocalIso();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('parsePeriod', () => {
    it('parses valid YYYY-MM period strings', () => {
      expect(parsePeriod('2026-05')).toEqual({ year: 2026, month: 5 });
      expect(parsePeriod('2026-12')).toEqual({ year: 2026, month: 12 });
    });

    it('falls back to current year and month for invalid periods', () => {
      const now = new Date();
      expect(parsePeriod('')).toEqual({ year: now.getFullYear(), month: now.getMonth() + 1 });
      expect(parsePeriod('invalid')).toEqual({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      });
    });
  });

  describe('formatPeriodLabel', () => {
    it('formats period string for Italian locale', () => {
      const label = formatPeriodLabel('2026-10', 'it');
      expect(label.toLowerCase()).toContain('ottobre');
      expect(label).toContain('2026');
    });

    it('formats period string for English locale', () => {
      const label = formatPeriodLabel('2026-10', 'en');
      expect(label.toLowerCase()).toContain('october');
      expect(label).toContain('2026');
    });

    it('returns original input if formatting fails', () => {
      expect(formatPeriodLabel('bad')).toBeDefined();
    });
  });

  describe('getAdjacentPeriod', () => {
    it('increments month within the same year', () => {
      expect(getAdjacentPeriod('2026-03', 1)).toBe('2026-04');
    });

    it('decrements month within the same year', () => {
      expect(getAdjacentPeriod('2026-03', -1)).toBe('2026-02');
    });

    it('rolls over from December to January of next year', () => {
      expect(getAdjacentPeriod('2026-12', 1)).toBe('2027-01');
    });

    it('rolls over from January to December of previous year', () => {
      expect(getAdjacentPeriod('2026-01', -1)).toBe('2025-12');
    });
  });

  describe('formatGroupDateHeader', () => {
    it('formats YYYY-MM-DD date header correctly', () => {
      const itHeader = formatGroupDateHeader('2026-10-15', 'it');
      expect(itHeader.toLowerCase()).toContain('ottobre');
      expect(itHeader).toContain('15');

      const enHeader = formatGroupDateHeader('2026-10-15', 'en');
      expect(enHeader.toLowerCase()).toContain('oct');
      expect(enHeader).toContain('15');
    });

    it('safely handles non-standard date strings', () => {
      expect(formatGroupDateHeader('2026-10', 'it')).toBeDefined();
    });
  });

  describe('formatExpenseDate', () => {
    it('formats expense date correctly', () => {
      const itDate = formatExpenseDate('2026-10-15', 'it');
      expect(itDate.toLowerCase()).toContain('ott');
      expect(itDate).toContain('15');

      const enDate = formatExpenseDate('2026-10-15', 'en');
      expect(enDate.toLowerCase()).toContain('oct');
      expect(enDate).toContain('15');
    });
  });

  describe('parseIsoDate', () => {
    it('returns null for null, undefined, empty, or whitespace strings', () => {
      expect(parseIsoDate(null)).toBeNull();
      expect(parseIsoDate(undefined)).toBeNull();
      expect(parseIsoDate('')).toBeNull();
      expect(parseIsoDate('   ')).toBeNull();
    });

    it('returns null for partial date strings (e.g. YYYY or YYYY-MM)', () => {
      expect(parseIsoDate('2026')).toBeNull();
      expect(parseIsoDate('2026-10')).toBeNull();
    });

    it('returns null for invalid or non-date strings', () => {
      expect(parseIsoDate('not-a-date')).toBeNull();
      expect(parseIsoDate('2026-02-31')).toBeNull();
      expect(parseIsoDate('2026-13-01')).toBeNull();
      expect(parseIsoDate('2026-00-10')).toBeNull();
    });

    it('returns valid Date for valid YYYY-MM-DD date strings', () => {
      const parsed = parseIsoDate('2026-10-15');
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(9); // 0-indexed October
      expect(parsed?.getDate()).toBe(15);
    });

    it('returns valid Date for valid ISO 8601 timestamps and numbers', () => {
      const parsedTs = parseIsoDate('2026-10-15T12:00:00.000Z');
      expect(parsedTs).not.toBeNull();
      expect(parsedTs?.toISOString()).toBe('2026-10-15T12:00:00.000Z');

      const numTs = new Date(2026, 9, 15).getTime();
      const parsedNum = parseIsoDate(numTs);
      expect(parsedNum).not.toBeNull();
      expect(parsedNum?.getTime()).toBe(numTs);
    });

    it('returns null for invalid Date instances or NaN numbers', () => {
      expect(parseIsoDate(new Date('invalid'))).toBeNull();
      expect(parseIsoDate(NaN)).toBeNull();
      expect(parseIsoDate(Infinity)).toBeNull();
    });
  });

  describe('formatIsoDate', () => {
    it('formats date with custom options', () => {
      const formatted = formatIsoDate('2026-10-15T12:00:00Z', 'it', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/10/);
      expect(formatted).toMatch(/2026/);
    });

    it('returns raw string for invalid date', () => {
      expect(formatIsoDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('GROUP_DATE_FORMATTERS and DATE_FORMATTERS', () => {
    it('exports pre-instantiated formatters', () => {
      expect(GROUP_DATE_FORMATTERS.it).toBeDefined();
      expect(GROUP_DATE_FORMATTERS.en).toBeDefined();
      expect(DATE_FORMATTERS.it).toBeDefined();
      expect(DATE_FORMATTERS.en).toBeDefined();
    });
  });
});
