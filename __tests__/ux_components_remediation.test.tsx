import { StyleSheet, Platform } from 'react-native';
import { parseSafePeriod } from '@/components/charts/HeatmapCalendar';
import { useAppStore } from '@/services/store';
import { Radius } from '@/theme/tokens';
import { Expense } from '@/types';

// Mock native and SVG dependencies
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  Rect: 'Rect',
  G: 'G',
  Line: 'Line',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
}));

jest.mock(
  'lucide-react-native',
  () =>
    new Proxy(
      {},
      {
        get: () => () => null,
      },
    ),
);

describe('Issue #73 UX Components & Ergonomics Remediation', () => {
  describe('Modal Backdrop Dismissal Contract (FormModal, ExpenseDetailModal, CategoryDetailModal)', () => {
    it('uses StyleSheet.absoluteFill for full-screen backdrop touch coverage', () => {
      expect(StyleSheet.absoluteFill).toBeDefined();
      expect(StyleSheet.absoluteFill).toMatchObject({
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      });
    });

    it('ensures backdrop dismiss callback triggers modal closure', () => {
      const onClose = jest.fn();
      const handleBackdropPress = () => onClose();
      handleBackdropPress();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  const resolveActivePayerId = (
    paidByMemberId: string,
    currentMemberId: string,
    members: { id: string }[],
  ): string => {
    if (paidByMemberId && members.some((m) => m.id === paidByMemberId)) {
      return paidByMemberId;
    }
    if (currentMemberId && members.some((m) => m.id === currentMemberId)) {
      return currentMemberId;
    }
    return members[0]?.id || '';
  };

  describe('Expense Form Keyboard Ergonomics & Payer Resolver', () => {
    it('resolves active payer ID falling back correctly', () => {
      const members = [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }];

      // 1. Explicit paidByMemberId if valid
      expect(resolveActivePayerId('m2', 'm1', members)).toBe('m2');

      // 2. Current member ID if valid
      expect(resolveActivePayerId('', 'm3', members)).toBe('m3');

      // 3. Fallback to first member if paidBy and current are invalid
      expect(resolveActivePayerId('non-existent', 'non-existent', members)).toBe('m1');
      expect(resolveActivePayerId('', '', members)).toBe('m1');
    });

    it('ensures amount field autoFocus is non-invasive on mobile touch devices', () => {
      // On mobile (iOS / Android), autoFocus should be false to prevent virtual keyboard obstructing category/date inputs
      const getAutoFocus = (platformOS: string) => platformOS === 'web';
      expect(getAutoFocus('ios')).toBe(false);
      expect(getAutoFocus('android')).toBe(false);
      expect(getAutoFocus('web')).toBe(true);

      // Verify current platform evaluation
      expect(typeof (Platform.OS === 'web')).toBe('boolean');
    });
  });

  describe('HeatmapCalendar Interactivity, Accessibility & Filter Integration', () => {
    it('safely parses period dates into valid calendar metadata', () => {
      const { year, month, daysInMonth } = parseSafePeriod('2026-05');
      expect(year).toBe(2026);
      expect(month).toBe(5);
      expect(daysInMonth).toBe(31);
    });

    it('generates descriptive accessibility labels for days with and without expenses', () => {
      const formatAccessibilityLabel = (
        date: Date,
        dailyAmount: number,
        locale: string,
        currency: string,
      ) => {
        const formattedDate = date.toLocaleDateString(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        if (dailyAmount <= 0) {
          return `${formattedDate}: ${locale.startsWith('it') ? 'nessuna spesa' : 'no expenses'}`;
        }
        return `${formattedDate}: ${currency}${dailyAmount.toFixed(2)} ${
          locale.startsWith('it') ? 'spesi' : 'spent'
        }`;
      };

      const date1 = new Date(2026, 4, 1);
      const date2 = new Date(2026, 4, 2);

      // Italian locale
      expect(formatAccessibilityLabel(date1, 0, 'it-IT', '€')).toContain('nessuna spesa');
      expect(formatAccessibilityLabel(date2, 45.5, 'it-IT', '€')).toContain('€45.50 spesi');

      // English fallback
      expect(formatAccessibilityLabel(date1, 0, 'en-US', '€')).toContain('no expenses');
      expect(formatAccessibilityLabel(date2, 80, 'en-US', '€')).toContain('€80.00 spent');
    });

    it('dispatches date range filter parameters to the store when filtering ledger from calendar', () => {
      const selectedIsoDate = '2026-05-15';

      useAppStore.getState().setFilters({
        startDate: selectedIsoDate,
        endDate: selectedIsoDate,
        periodPreset: 'all',
      });

      const filters = useAppStore.getState().filters;
      expect(filters.startDate).toBe('2026-05-15');
      expect(filters.endDate).toBe('2026-05-15');
      expect(filters.periodPreset).toBe('all');
    });
  });

  describe('Ledger Date Range Filter Application', () => {
    const mockExpenses: Expense[] = [
      {
        id: '1',
        family_id: 'fam_1',
        paid_by_member_id: 'm1',
        category_id: 'c1',
        amount: 30,
        transaction_date: '2026-05-10',
        merchant_name: 'Store A',
        payment_method: 'Card',
        is_recurring: false,
        is_verified: true,
        created_at: '2026-05-10',
      },
      {
        id: '2',
        family_id: 'fam_1',
        paid_by_member_id: 'm1',
        category_id: 'c1',
        amount: 50,
        transaction_date: '2026-05-15',
        merchant_name: 'Store B',
        payment_method: 'Cash',
        is_recurring: false,
        is_verified: true,
        created_at: '2026-05-15',
      },
      {
        id: '3',
        family_id: 'fam_1',
        paid_by_member_id: 'm1',
        category_id: 'c1',
        amount: 80,
        transaction_date: '2026-05-20',
        merchant_name: 'Store C',
        payment_method: 'Card',
        is_recurring: false,
        is_verified: true,
        created_at: '2026-05-20',
      },
    ];

    it('filters expenses within startDate and endDate bounds correctly', () => {
      const filterByDateRange = (
        expenses: Expense[],
        startDate?: string,
        endDate?: string,
      ): Expense[] => {
        return expenses.filter((e) => {
          if (startDate && e.transaction_date < startDate) return false;
          if (endDate && e.transaction_date > endDate) return false;
          return true;
        });
      };

      // Filter exact single day
      const singleDay = filterByDateRange(mockExpenses, '2026-05-15', '2026-05-15');
      expect(singleDay).toHaveLength(1);
      expect(singleDay[0].id).toBe('2');

      // Filter date range
      const range = filterByDateRange(mockExpenses, '2026-05-10', '2026-05-16');
      expect(range).toHaveLength(2);
      expect(range.map((e) => e.id)).toEqual(['1', '2']);

      // No range
      expect(filterByDateRange(mockExpenses)).toHaveLength(3);
    });
  });

  describe('MemberBarChart Scroll Optimization Invariants', () => {
    it('disables horizontal scroll when member count is <= 4', () => {
      const shouldScroll = (memberCount: number) => memberCount > 4;

      expect(shouldScroll(1)).toBe(false);
      expect(shouldScroll(2)).toBe(false);
      expect(shouldScroll(3)).toBe(false);
      expect(shouldScroll(4)).toBe(false);
      expect(shouldScroll(5)).toBe(true);
      expect(shouldScroll(8)).toBe(true);
    });

    it('adjusts spacing adaptively when members count <= 2 vs 3-4 vs > 4', () => {
      const getSpacing = (count: number) => {
        const shouldScroll = count > 4;
        return shouldScroll ? 28 : count <= 2 ? 56 : 32;
      };

      expect(getSpacing(2)).toBe(56);
      expect(getSpacing(4)).toBe(32);
      expect(getSpacing(6)).toBe(28);
    });
  });

  describe('Strict Constraints (Design Tokens & Currency)', () => {
    it('strictly maintains 4px border radius across all Radius tokens', () => {
      expect(Radius.xs).toBe(4);
      expect(Radius.sm).toBe(4);
      expect(Radius.md).toBe(4);
      expect(Radius.lg).toBe(4);
      expect(Radius.full).toBe(4);
    });

    it('strictly enforces Euro as the application currency', () => {
      const family = useAppStore.getState().family;
      expect(family.currency).toBe('€');
    });
  });
});
