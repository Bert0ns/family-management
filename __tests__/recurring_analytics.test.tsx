import {
  detectRecurringFrequency,
  calculateMonthlyNormalizedAmount,
  calculateFixedVsVariableBreakdown,
  calculateHistoricalMonthlyTrends,
} from '@/services/analytics';
import { Expense, Category, FamilyMember } from '@/types';
import { Radius } from '@/theme/tokens';
import { it as itTranslations } from '@/i18n/it';
import { en as enTranslations } from '@/i18n/en';

// Mock native and SVG dependencies
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: (obj: any) => obj.ios || obj.default },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: { create: (styles: any) => styles },
}));

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

jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => null,
  BarChart: () => null,
}));

describe('Issue #69 Recurring Expenses & Subscriptions Analytics', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat_subs',
      family_id: 'fam_1',
      name: 'Abbonamenti',
      icon: 'Film',
      color: '#8B5CF6',
      is_default: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat_utilities',
      family_id: 'fam_1',
      name: 'Utenze',
      icon: 'Zap',
      color: '#3B82F6',
      is_default: true,
      created_at: '2026-01-01',
    },
    {
      id: 'cat_groceries',
      family_id: 'fam_1',
      name: 'Spesa',
      icon: 'ShoppingCart',
      color: '#10B981',
      is_default: true,
      created_at: '2026-01-01',
    },
  ];

  const mockMembers: FamilyMember[] = [
    {
      id: 'mem_1',
      family_id: 'fam_1',
      display_name: 'Alice',
      role: 'ADMIN',
      color_code: '#8B5CF6',
      created_at: '2026-01-01',
    },
    {
      id: 'mem_2',
      family_id: 'fam_1',
      display_name: 'Bob',
      role: 'MEMBER',
      color_code: '#10B981',
      created_at: '2026-01-01',
    },
  ];

  describe('Frequency Detection & Normalization', () => {
    it('respects explicit recurring_frequency property if present', () => {
      const expWeekly: Expense = {
        id: 'e1',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_1',
        category_id: 'cat_subs',
        transaction_date: '2026-10-01',
        merchant_name: 'Box Delivery',
        amount: 25,
        payment_method: 'CREDIT_CARD',
        created_at: '2026-10-01',
        is_recurring: true,
        recurring_frequency: 'weekly',
      };
      expect(detectRecurringFrequency(expWeekly)).toBe('weekly');

      const expQuarterly: Expense = {
        ...expWeekly,
        recurring_frequency: 'quarterly',
      };
      expect(detectRecurringFrequency(expQuarterly)).toBe('quarterly');

      const expYearly: Expense = {
        ...expWeekly,
        recurring_frequency: 'yearly',
      };
      expect(detectRecurringFrequency(expYearly)).toBe('yearly');

      const expMonthly: Expense = {
        ...expWeekly,
        recurring_frequency: 'monthly',
      };
      expect(detectRecurringFrequency(expMonthly)).toBe('monthly');
    });

    it('infers frequency from notes and merchant name heuristically when not explicit', () => {
      const yearlyFromNotes: Expense = {
        id: 'e2',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_1',
        category_id: 'cat_subs',
        transaction_date: '2026-10-01',
        merchant_name: 'Amazon Prime',
        notes: 'Rinnovo annuale abbonamento',
        amount: 49.99,
        payment_method: 'CREDIT_CARD',
        created_at: '2026-10-01',
        is_recurring: true,
      };
      expect(detectRecurringFrequency(yearlyFromNotes)).toBe('yearly');

      const quarterlyFromMerchant: Expense = {
        id: 'e3',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_1',
        category_id: 'cat_utilities',
        transaction_date: '2026-10-01',
        merchant_name: 'Acquedotto Trimestrale',
        amount: 120,
        payment_method: 'BANK_TRANSFER',
        created_at: '2026-10-01',
        is_recurring: true,
      };
      expect(detectRecurringFrequency(quarterlyFromMerchant)).toBe('quarterly');

      const weeklyFromNotes: Expense = {
        id: 'e4',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_2',
        category_id: 'cat_subs',
        transaction_date: '2026-10-01',
        merchant_name: 'Palestra',
        notes: 'Quota settimanale coach',
        amount: 15,
        payment_method: 'CASH',
        created_at: '2026-10-01',
        is_recurring: true,
      };
      expect(detectRecurringFrequency(weeklyFromNotes)).toBe('weekly');

      const fallbackMonthly: Expense = {
        id: 'e5',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_1',
        category_id: 'cat_subs',
        transaction_date: '2026-10-01',
        merchant_name: 'Netflix',
        amount: 17.99,
        payment_method: 'CREDIT_CARD',
        created_at: '2026-10-01',
        is_recurring: true,
      };
      expect(detectRecurringFrequency(fallbackMonthly)).toBe('monthly');
    });

    it('resists false positives on phrases like "settimana bianca" and "anno accademico"', () => {
      // "settimana bianca" should NOT be classified as weekly
      const vacationExpense: Expense = {
        id: 'fp1',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_1',
        category_id: 'cat_subs',
        transaction_date: '2026-10-01',
        merchant_name: 'Hotel Dolomiti',
        notes: 'Caparra settimana bianca in montagna',
        amount: 300,
        payment_method: 'BANK_TRANSFER',
        created_at: '2026-10-01',
        is_recurring: true,
      };
      expect(detectRecurringFrequency(vacationExpense)).toBe('monthly');

      // "anno accademico" should NOT be classified as yearly
      const universityExpense: Expense = {
        id: 'fp2',
        family_id: 'fam_1',
        paid_by_member_id: 'mem_2',
        category_id: 'cat_subs',
        transaction_date: '2026-10-01',
        merchant_name: 'Universita',
        notes: 'Iscrizione anno accademico 2026',
        amount: 500,
        payment_method: 'BANK_TRANSFER',
        created_at: '2026-10-01',
        is_recurring: true,
      };
      expect(detectRecurringFrequency(universityExpense)).toBe('monthly');

      // Explicit flag always overrides text
      const explicitWins: Expense = {
        ...vacationExpense,
        recurring_frequency: 'yearly',
      };
      expect(detectRecurringFrequency(explicitWins)).toBe('yearly');
    });

    it('correctly normalizes monthly amounts using cent-exact arithmetic without float drift', () => {
      // Monthly: amount directly
      expect(calculateMonthlyNormalizedAmount(50, 'monthly')).toBe(50);
      // Yearly: amount in cents / 12
      expect(calculateMonthlyNormalizedAmount(120, 'yearly')).toBe(10);
      expect(calculateMonthlyNormalizedAmount(49.99, 'yearly')).toBe(4.17); // 4999 / 12 = 416.58 -> 417 cents = 4.17
      expect(calculateMonthlyNormalizedAmount(100.05, 'yearly')).toBe(8.34);
      // Quarterly: amount in cents / 3
      expect(calculateMonthlyNormalizedAmount(90, 'quarterly')).toBe(30);
      expect(calculateMonthlyNormalizedAmount(100, 'quarterly')).toBe(33.33);
      // Weekly: (amount in cents * 52) / 12
      expect(calculateMonthlyNormalizedAmount(100, 'weekly')).toBe(433.33);
      expect(calculateMonthlyNormalizedAmount(10.01, 'weekly')).toBe(43.38); // 1001 * 52 / 12 = 4337.66 -> 4338 cents = 43.38
    });
  });

  describe('calculateFixedVsVariableBreakdown Calculation Engine', () => {
    it('returns zeroed breakdown when period has no expenses', () => {
      const breakdown = calculateFixedVsVariableBreakdown(
        [],
        mockCategories,
        mockMembers,
        '2026-10',
      );
      expect(breakdown.period).toBe('2026-10');
      expect(breakdown.totalSpend).toBe(0);
      expect(breakdown.fixedSpend).toBe(0);
      expect(breakdown.variableSpend).toBe(0);
      expect(breakdown.fixedPercentage).toBe(0);
      expect(breakdown.variablePercentage).toBe(0);
      expect(breakdown.recurringCount).toBe(0);
      expect(breakdown.variableCount).toBe(0);
      expect(breakdown.recurringItems).toEqual([]);
      expect(breakdown.categoryBreakdown).toEqual([]);
    });

    it('accurately divides fixed vs variable spending and normalizes recurring items', () => {
      const expenses: Expense[] = [
        // Fixed recurring monthly: Netflix 15.99
        {
          id: 'exp_1',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_1',
          category_id: 'cat_subs',
          transaction_date: '2026-10-02',
          merchant_name: 'Netflix',
          amount: 15.99,
          payment_method: 'CREDIT_CARD',
          created_at: '2026-10-02',
          is_recurring: true,
          recurring_frequency: 'monthly',
        },
        // Fixed recurring yearly: Amazon Prime 48.00 (normalized monthly = 4.00)
        {
          id: 'exp_2',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_2',
          category_id: 'cat_subs',
          transaction_date: '2026-10-05',
          merchant_name: 'Amazon Prime',
          amount: 48.0,
          payment_method: 'CREDIT_CARD',
          created_at: '2026-10-05',
          is_recurring: true,
          recurring_frequency: 'yearly',
        },
        // Variable expense: Supermercato 120.50
        {
          id: 'exp_3',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_1',
          category_id: 'cat_groceries',
          transaction_date: '2026-10-10',
          merchant_name: 'Esselunga',
          amount: 120.5,
          payment_method: 'CREDIT_CARD',
          created_at: '2026-10-10',
          is_recurring: false,
        },
        // Variable expense: Ristorante 50.00
        {
          id: 'exp_4',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_2',
          category_id: 'cat_groceries',
          transaction_date: '2026-10-14',
          merchant_name: 'Pizzeria Da Mario',
          amount: 50.0,
          payment_method: 'DEBIT_CARD',
          created_at: '2026-10-14',
        },
      ];

      const breakdown = calculateFixedVsVariableBreakdown(
        expenses,
        mockCategories,
        mockMembers,
        '2026-10',
      );

      // In period, fixed amounts are 15.99 + 48.00 = 63.99
      expect(breakdown.fixedSpend).toBe(63.99);
      // Variable amounts are 120.50 + 50.00 = 170.50
      expect(breakdown.variableSpend).toBe(170.5);
      // Total = 234.49
      expect(breakdown.totalSpend).toBe(234.49);
      // Strictly reconciles: fixedSpend + variableSpend === totalSpend
      expect(breakdown.fixedSpend + breakdown.variableSpend).toBe(breakdown.totalSpend);

      // Percentages sum to 100%
      expect(breakdown.fixedPercentage + breakdown.variablePercentage).toBeCloseTo(100, 1);
      expect(breakdown.fixedPercentage).toBeCloseTo((63.99 / 234.49) * 100, 1);

      // Counts
      expect(breakdown.recurringCount).toBe(2);
      expect(breakdown.variableCount).toBe(2);

      // Recurring Items normalization
      expect(breakdown.recurringItems).toHaveLength(2);
      const netflixItem = breakdown.recurringItems.find((i) => i.expense.id === 'exp_1');
      expect(netflixItem).toBeDefined();
      expect(netflixItem?.monthlyAmount).toBe(15.99);
      expect(netflixItem?.payer?.display_name).toBe('Alice');

      const primeItem = breakdown.recurringItems.find((i) => i.expense.id === 'exp_2');
      expect(primeItem).toBeDefined();
      expect(primeItem?.monthlyAmount).toBe(4.0); // 48 / 12
      expect(primeItem?.payer?.display_name).toBe('Bob');

      // Monthly normalized fixed spend (Netflix: 15.99 + Prime: 4.00 = 19.99)
      expect(breakdown.monthlyNormalizedFixedSpend).toBe(19.99);

      // Category breakdown for recurring
      expect(breakdown.categoryBreakdown).toHaveLength(1);
      expect(breakdown.categoryBreakdown[0].category.id).toBe('cat_subs');
      expect(breakdown.categoryBreakdown[0].total).toBe(63.99);
      expect(breakdown.categoryBreakdown[0].percentage).toBe(100);
      expect(breakdown.categoryBreakdown[0].count).toBe(2);
    });

    it('correctly updates historical monthly trends with fixed spend breakdowns', () => {
      const expenses: Expense[] = [
        {
          id: 'h1',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_1',
          category_id: 'cat_subs',
          transaction_date: '2026-09-01',
          merchant_name: 'Netflix',
          amount: 20,
          payment_method: 'CREDIT_CARD',
          created_at: '2026-09-01',
          is_recurring: true,
        },
        {
          id: 'h2',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_1',
          category_id: 'cat_groceries',
          transaction_date: '2026-09-05',
          merchant_name: 'Supermercato',
          amount: 80,
          payment_method: 'CREDIT_CARD',
          created_at: '2026-09-05',
          is_recurring: false,
        },
        {
          id: 'h3',
          family_id: 'fam_1',
          paid_by_member_id: 'mem_1',
          category_id: 'cat_subs',
          transaction_date: '2026-10-01',
          merchant_name: 'Netflix',
          amount: 20,
          payment_method: 'CREDIT_CARD',
          created_at: '2026-10-01',
          is_recurring: true,
        },
      ];

      const trends = calculateHistoricalMonthlyTrends(expenses, '2026-10', 2);
      expect(trends).toHaveLength(2);

      const sepTrend = trends.find((t) => t.period === '2026-09');
      expect(sepTrend?.totalSpend).toBe(100);
      expect(sepTrend?.fixedSpend).toBe(20);
      expect(sepTrend?.variableSpend).toBe(80);
      expect(sepTrend?.fixedPercentage).toBe(20);

      const octTrend = trends.find((t) => t.period === '2026-10');
      expect(octTrend?.totalSpend).toBe(20);
      expect(octTrend?.fixedSpend).toBe(20);
      expect(octTrend?.variableSpend).toBe(0);
      expect(octTrend?.fixedPercentage).toBe(100);
    });
  });

  describe('Design System Token Constraints', () => {
    it('verifies that all Radius tokens remain strictly 4px', () => {
      expect(Radius.xs).toBe(4);
      expect(Radius.sm).toBe(4);
      expect(Radius.md).toBe(4);
      expect(Radius.lg).toBe(4);
      expect(Radius.xl).toBe(4);
      expect(Radius.xxl).toBe(4);
      expect(Radius.pill).toBe(4);
      expect(Radius.full).toBe(4);
    });
  });

  describe('Internationalization (i18n) Parity', () => {
    it('ensures all recurring analytics keys are defined in both it and en', () => {
      const requiredKeys = [
        'recurringTab',
        'recurringTitle',
        'recurringSubtitle',
        'fixedVsVariableTitle',
        'fixedVsVariableSubtitle',
        'fixedCosts',
        'variableCosts',
        'fixedShare',
        'variableShare',
        'recurringCountLabel',
        'variableCountLabel',
        'activeRecurringTitle',
        'activeRecurringSubtitle',
        'noRecurringData',
        'noRecurringHint',
        'monthlyAmountLabel',
        'cadenceMonthly',
        'cadenceYearly',
        'cadenceQuarterly',
        'cadenceWeekly',
        'billedOn',
        'viewAllRecurring',
        'recurringByCatTitle',
        'recurringTag',
        'fixedCostBadge',
        'variableCostBadge',
        'actualBilledLabel',
        'monthlyNormalizedTotalLabel',
        'billedThisMonthLabel',
      ] as const;

      for (const key of requiredKeys) {
        expect(itTranslations.analytics[key]).toBeDefined();
        expect(typeof itTranslations.analytics[key]).toBe('string');
        expect(itTranslations.analytics[key].length).toBeGreaterThan(0);

        expect(enTranslations.analytics[key]).toBeDefined();
        expect(typeof enTranslations.analytics[key]).toBe('string');
        expect(enTranslations.analytics[key].length).toBeGreaterThan(0);
      }
    });
  });
});
