import { Expense, Category, FamilyMember, RecurringFrequency } from '@/types';
import {
  IAnalyticsCalculator,
  CategorySummary,
  MemberSummary,
  DailySpendPoint,
  MonthlyKPIMetrics,
  MonthlyTrendPoint,
  ComparativeVelocityData,
  DayOfWeekDistribution,
  DayOfWeekPoint,
  DayKey,
  PaymentMethodSummary,
  RecurringExpenseItem,
  RecurringCategoryShare,
  FixedVsVariableBreakdown,
} from './interfaces';
import { toCents, fromCents, sumBy, roundToTwoDecimals } from '@/utils/numberParser';

export {
  CategorySummary,
  MemberSummary,
  DailySpendPoint,
  MonthlyKPIMetrics,
  MonthlyTrendPoint,
  ComparativeVelocityData,
  DayOfWeekDistribution,
  DayOfWeekPoint,
  DayKey,
  PaymentMethodSummary,
  RecurringExpenseItem,
  RecurringCategoryShare,
  FixedVsVariableBreakdown,
  RecurringFrequency,
};

/**
 * Returns the period immediately preceding the given period (YYYY-MM).
 */
export function getPreviousPeriod(period: string): string {
  const [yearStr, monthStr] = period.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  month -= 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Generates an array of historical periods ending in currentPeriod in chronological order.
 */
export function getHistoricalPeriods(currentPeriod: string, count = 6): string[] {
  const safeCount = Math.max(1, count);
  const periods: string[] = [];
  let curr = currentPeriod;
  for (let i = 0; i < safeCount; i++) {
    periods.unshift(curr);
    curr = getPreviousPeriod(curr);
  }
  return periods;
}

/**
 * Detects recurring cadence from explicit property or textual context in notes/merchant name.
 */
export function detectRecurringFrequency(expense: Expense): RecurringFrequency {
  if (expense.recurring_frequency) {
    return expense.recurring_frequency;
  }
  const text = `${expense.notes || ''} ${expense.merchant_name || ''}`.toLowerCase();
  // Match precise recurrence cadence phrases to prevent false positives (e.g. "settimana bianca", "anno accademico")
  if (
    /\b(annuale|annuali|all'anno|all anno|per anno|yearly|per year|annual|abbonamento annuale|rinnovo annuale|quota annuale|canone annuale)\b/i.test(
      text,
    )
  ) {
    return 'yearly';
  }
  if (
    /\b(trimestrale|trimestrali|ogni 3 mesi|ogni tre mesi|quarterly|per quarter|rinnovo trimestrale|quota trimestrale)\b/i.test(
      text,
    )
  ) {
    return 'quarterly';
  }
  if (
    /\b(settimanale|settimanali|a settimana|alla settimana|per settimana|weekly|per week|quota settimanale|cadenza settimanale)\b/i.test(
      text,
    )
  ) {
    return 'weekly';
  }
  if (
    /\b(mensile|mensili|al mese|per mese|monthly|per month|abbonamento mensile|rinnovo mensile)\b/i.test(
      text,
    )
  ) {
    return 'monthly';
  }
  return 'monthly';
}

/**
 * Normalizes an expense amount to a standard monthly equivalent using cent-exact arithmetic.
 */
export function calculateMonthlyNormalizedAmount(
  amount: number,
  frequency: RecurringFrequency,
): number {
  const amountCents = toCents(amount);
  switch (frequency) {
    case 'yearly':
      return fromCents(Math.round(amountCents / 12));
    case 'quarterly':
      return fromCents(Math.round(amountCents / 3));
    case 'weekly':
      return fromCents(Math.round((amountCents * 52) / 12));
    case 'monthly':
    default:
      return fromCents(amountCents);
  }
}

/**
 * AnalyticsCalculator implements IAnalyticsCalculator following the Single Responsibility Principle.
 */
export class AnalyticsCalculator implements IAnalyticsCalculator {
  calculateMonthlyMetrics(
    expenses: Expense[],
    categories: Category[],
    members: FamilyMember[],
    period: string,
    referenceDate: Date = new Date(),
  ): MonthlyKPIMetrics {
    const periodExpenses = expenses.filter((e) => e.transaction_date.startsWith(period));
    const totalSpend = sumBy(periodExpenses, (e) => e.amount);

    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth() + 1;
    const isCurrentPeriod = year === refYear && month === refMonth;
    const isPastPeriod = year < refYear || (year === refYear && month < refMonth);

    let daysElapsed: number;
    let projectedMonthEnd: number;

    if (isPastPeriod) {
      // Completed month - no projection, use actual total spend
      daysElapsed = totalDaysInMonth;
      projectedMonthEnd = totalSpend;
    } else if (isCurrentPeriod) {
      // Current active month - use actual calendar day of month
      daysElapsed = Math.min(Math.max(referenceDate.getDate(), 1), totalDaysInMonth);
      const dailyAverageBurn = daysElapsed > 0 ? totalSpend / daysElapsed : 0;
      projectedMonthEnd = roundToTwoDecimals(dailyAverageBurn * totalDaysInMonth);
    } else {
      // Future month
      daysElapsed = 1;
      projectedMonthEnd = totalSpend;
    }

    const dailyAverageBurn = daysElapsed > 0 ? totalSpend / daysElapsed : 0;

    const catSummaries = this.calculateCategoryBreakdown(periodExpenses, categories);
    const memSummaries = this.calculateMemberContributions(periodExpenses, members);

    const topCategory =
      catSummaries.length > 0 && catSummaries[0].total > 0 ? catSummaries[0] : undefined;
    const topSpender =
      memSummaries.length > 0 && memSummaries[0].total > 0 ? memSummaries[0] : undefined;

    return {
      totalSpend,
      dailyAverageBurn,
      projectedMonthEnd,
      transactionCount: periodExpenses.length,
      topCategory,
      topSpender,
    };
  }

  calculateCategoryBreakdown(expenses: Expense[], categories: Category[]): CategorySummary[] {
    const totalSpend = sumBy(expenses, (e) => e.amount);
    const catMap = new Map<string, { totalCents: number; count: number }>();

    expenses.forEach((e) => {
      const current = catMap.get(e.category_id) || { totalCents: 0, count: 0 };
      catMap.set(e.category_id, {
        totalCents: current.totalCents + toCents(e.amount),
        count: current.count + 1,
      });
    });

    const summaries: CategorySummary[] = [];
    const seenCategoryIds = new Set<string>();

    categories.forEach((cat) => {
      seenCategoryIds.add(cat.id);
      const data = catMap.get(cat.id);
      if (data && data.totalCents > 0) {
        const catTotal = fromCents(data.totalCents);
        summaries.push({
          category: cat,
          total: catTotal,
          percentage: totalSpend > 0 ? (catTotal / totalSpend) * 100 : 0,
          transactionCount: data.count,
        });
      }
    });

    // Account for orphaned or unmapped category IDs
    catMap.forEach((data, catId) => {
      if (!seenCategoryIds.has(catId) && data.totalCents > 0) {
        const catTotal = fromCents(data.totalCents);
        summaries.push({
          category: {
            id: catId,
            family_id: '',
            name: 'Uncategorized',
            icon: 'HelpCircle',
            color: '#94A3B8',
          },
          total: catTotal,
          percentage: totalSpend > 0 ? (catTotal / totalSpend) * 100 : 0,
          transactionCount: data.count,
        });
      }
    });

    return summaries.sort((a, b) => b.total - a.total);
  }

  calculateMemberContributions(expenses: Expense[], members: FamilyMember[]): MemberSummary[] {
    const totalSpend = sumBy(expenses, (e) => e.amount);
    const memMap = new Map<string, { totalCents: number; count: number }>();

    expenses.forEach((e) => {
      const current = memMap.get(e.paid_by_member_id) || { totalCents: 0, count: 0 };
      memMap.set(e.paid_by_member_id, {
        totalCents: current.totalCents + toCents(e.amount),
        count: current.count + 1,
      });
    });

    const summaries: MemberSummary[] = [];
    const seenMemberIds = new Set<string>();

    members.forEach((mem) => {
      seenMemberIds.add(mem.id);
      const data = memMap.get(mem.id);
      if (data && data.totalCents > 0) {
        const memTotal = fromCents(data.totalCents);
        summaries.push({
          member: mem,
          total: memTotal,
          percentage: totalSpend > 0 ? (memTotal / totalSpend) * 100 : 0,
          transactionCount: data.count,
        });
      } else {
        summaries.push({
          member: mem,
          total: 0,
          percentage: 0,
          transactionCount: 0,
        });
      }
    });

    // Account for former or unknown member IDs
    memMap.forEach((data, memId) => {
      if (!seenMemberIds.has(memId) && data.totalCents > 0) {
        const memTotal = fromCents(data.totalCents);
        summaries.push({
          member: {
            id: memId,
            family_id: '',
            display_name: 'Former / Unknown Member',
            role: 'MEMBER',
            color_code: '#94A3B8',
          },
          total: memTotal,
          percentage: totalSpend > 0 ? (memTotal / totalSpend) * 100 : 0,
          transactionCount: data.count,
        });
      }
    });

    return summaries.sort((a, b) => b.total - a.total);
  }

  calculateSpendingVelocity(expenses: Expense[], period: string): DailySpendPoint[] {
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDays = new Date(year, month, 0).getDate();

    const dayCents = new Map<number, number>();
    expenses
      .filter((e) => e.transaction_date.startsWith(period))
      .forEach((e) => {
        const day = parseInt(e.transaction_date.split('-')[2], 10);
        dayCents.set(day, (dayCents.get(day) || 0) + toCents(e.amount));
      });

    let runningTotalCents = 0;
    const points: DailySpendPoint[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const amountCents = dayCents.get(d) || 0;
      runningTotalCents += amountCents;
      const dateStr = `${period}-${String(d).padStart(2, '0')}`;
      points.push({
        day: d,
        dateStr,
        dailyAmount: fromCents(amountCents),
        cumulativeAmount: fromCents(runningTotalCents),
      });
    }

    return points;
  }

  calculateHistoricalMonthlyTrends(
    expenses: Expense[],
    currentPeriod: string,
    monthsCount = 6,
  ): MonthlyTrendPoint[] {
    const periods = getHistoricalPeriods(currentPeriod, monthsCount);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const periodExpensesMap = new Map<
      string,
      { totalCents: number; fixedCents: number; count: number }
    >();
    expenses.forEach((e) => {
      const p = e.transaction_date.slice(0, 7);
      const current = periodExpensesMap.get(p) || { totalCents: 0, fixedCents: 0, count: 0 };
      const amountCents = toCents(e.amount);
      periodExpensesMap.set(p, {
        totalCents: current.totalCents + amountCents,
        fixedCents: current.fixedCents + (e.is_recurring ? amountCents : 0),
        count: current.count + 1,
      });
    });

    const rawPoints: {
      period: string;
      label: string;
      totalSpend: number;
      fixedSpend: number;
      variableSpend: number;
      fixedPercentage: number;
      transactionCount: number;
      totalCents: number;
    }[] = [];

    periods.forEach((p) => {
      const data = periodExpensesMap.get(p) || { totalCents: 0, fixedCents: 0, count: 0 };
      const [, monthStr] = p.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const label = monthNames[monthIdx] || p;
      const totalSpend = fromCents(data.totalCents);
      const fixedSpend = fromCents(data.fixedCents);
      const variableSpend = fromCents(Math.max(0, data.totalCents - data.fixedCents));
      const fixedPercentage =
        data.totalCents > 0 ? roundToTwoDecimals((data.fixedCents / data.totalCents) * 100) : 0;

      rawPoints.push({
        period: p,
        label,
        totalSpend,
        fixedSpend,
        variableSpend,
        fixedPercentage,
        transactionCount: data.count,
        totalCents: data.totalCents,
      });
    });

    return rawPoints.map((item, idx) => {
      let momGrowthPercentage: number | null = null;
      if (idx > 0) {
        const prevCents = rawPoints[idx - 1].totalCents;
        if (prevCents > 0) {
          momGrowthPercentage = roundToTwoDecimals(
            ((item.totalCents - prevCents) / prevCents) * 100,
          );
        } else if (item.totalCents > 0) {
          momGrowthPercentage = 100;
        } else {
          momGrowthPercentage = 0;
        }
      }

      // 3-month rolling average
      const windowStart = Math.max(0, idx - 2);
      const windowItems = rawPoints.slice(windowStart, idx + 1);
      const windowSumCents = windowItems.reduce((acc, curr) => acc + curr.totalCents, 0);
      const rollingAverage = fromCents(Math.round(windowSumCents / windowItems.length));

      return {
        period: item.period,
        label: item.label,
        totalSpend: item.totalSpend,
        transactionCount: item.transactionCount,
        momGrowthPercentage,
        rollingAverage,
        fixedSpend: item.fixedSpend,
        variableSpend: item.variableSpend,
        fixedPercentage: item.fixedPercentage,
      };
    });
  }

  calculateComparativeSpendingVelocity(
    expenses: Expense[],
    currentPeriod: string,
    referenceDate: Date = new Date(),
  ): ComparativeVelocityData {
    const previousPeriod = getPreviousPeriod(currentPeriod);
    const currentPoints = this.calculateSpendingVelocity(expenses, currentPeriod);
    const previousPoints = this.calculateSpendingVelocity(expenses, previousPeriod);

    const currentTotal =
      currentPoints.length > 0 ? currentPoints[currentPoints.length - 1].cumulativeAmount : 0;
    const previousTotal =
      previousPoints.length > 0 ? previousPoints[previousPoints.length - 1].cumulativeAmount : 0;

    const [yearStr, monthStr] = currentPeriod.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = currentPoints.length;

    const refYear = referenceDate.getFullYear();
    const refMonth = referenceDate.getMonth() + 1;
    const isCurrentActivePeriod = year === refYear && month === refMonth;
    const isPastPeriod = year < refYear || (year === refYear && month < refMonth);

    let currentElapsedDays: number;
    if (isPastPeriod) {
      currentElapsedDays = daysInMonth;
    } else if (isCurrentActivePeriod) {
      currentElapsedDays = Math.min(Math.max(referenceDate.getDate(), 1), daysInMonth);
    } else {
      currentElapsedDays = 1;
    }

    const currentIdx = Math.max(0, currentElapsedDays - 1);
    const prevIdx = Math.min(currentElapsedDays, previousPoints.length) - 1;

    const currentToDate = currentPoints[currentIdx]?.cumulativeAmount || 0;
    const previousToDate = prevIdx >= 0 ? previousPoints[prevIdx]?.cumulativeAmount || 0 : 0;

    let pacingPercentage: number | null = null;
    if (previousToDate > 0) {
      pacingPercentage = roundToTwoDecimals(
        ((currentToDate - previousToDate) / previousToDate) * 100,
      );
    } else if (currentToDate > 0) {
      pacingPercentage = 100;
    } else {
      pacingPercentage = 0;
    }

    return {
      currentPeriod,
      previousPeriod,
      currentPoints,
      previousPoints,
      currentTotal,
      previousTotal,
      currentElapsedDays,
      currentToDate,
      previousToDate,
      pacingPercentage,
      daysInMonth,
    };
  }

  calculateDayOfWeekDistribution(expenses: Expense[], period?: string): DayOfWeekDistribution {
    const filtered = period
      ? expenses.filter((e) => e.transaction_date.startsWith(period))
      : expenses;

    const dayConfigs: { dayOfWeek: number; dayKey: DayKey; isWeekend: boolean }[] = [
      { dayOfWeek: 1, dayKey: 'mon', isWeekend: false },
      { dayOfWeek: 2, dayKey: 'tue', isWeekend: false },
      { dayOfWeek: 3, dayKey: 'wed', isWeekend: false },
      { dayOfWeek: 4, dayKey: 'thu', isWeekend: false },
      { dayOfWeek: 5, dayKey: 'fri', isWeekend: false },
      { dayOfWeek: 6, dayKey: 'sat', isWeekend: true },
      { dayOfWeek: 7, dayKey: 'sun', isWeekend: true },
    ];

    const dayCentsMap = new Map<number, { totalCents: number; count: number }>();
    dayConfigs.forEach((c) => dayCentsMap.set(c.dayOfWeek, { totalCents: 0, count: 0 }));

    filtered.forEach((e) => {
      const [y, m, d] = e.transaction_date.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      const jsDay = date.getDay(); // 0 = Sun .. 6 = Sat
      const isoDay = jsDay === 0 ? 7 : jsDay;
      const data = dayCentsMap.get(isoDay);
      if (data) {
        data.totalCents += toCents(e.amount);
        data.count += 1;
      }
    });

    const totalCents = sumBy(Array.from(dayCentsMap.values()), (v) => v.totalCents);
    const totalAmount = fromCents(totalCents);

    let weekdayCents = 0;
    let weekendCents = 0;

    const days: DayOfWeekPoint[] = dayConfigs.map((cfg) => {
      const data = dayCentsMap.get(cfg.dayOfWeek) || { totalCents: 0, count: 0 };
      const amount = fromCents(data.totalCents);
      const pct = totalCents > 0 ? (data.totalCents / totalCents) * 100 : 0;
      const avg = data.count > 0 ? fromCents(Math.round(data.totalCents / data.count)) : 0;

      if (cfg.isWeekend) {
        weekendCents += data.totalCents;
      } else {
        weekdayCents += data.totalCents;
      }

      return {
        dayOfWeek: cfg.dayOfWeek,
        dayKey: cfg.dayKey,
        totalAmount: amount,
        percentage: roundToTwoDecimals(pct),
        transactionCount: data.count,
        averageTransaction: avg,
        isWeekend: cfg.isWeekend,
      };
    });

    const peakDay =
      days.length > 0
        ? [...days].sort((a, b) => b.totalAmount - a.totalAmount)[0]?.totalAmount > 0
          ? [...days].sort((a, b) => b.totalAmount - a.totalAmount)[0]
          : null
        : null;

    return {
      days,
      totalAmount,
      weekdayTotal: fromCents(weekdayCents),
      weekendTotal: fromCents(weekendCents),
      weekdayPercentage: totalCents > 0 ? roundToTwoDecimals((weekdayCents / totalCents) * 100) : 0,
      weekendPercentage: totalCents > 0 ? roundToTwoDecimals((weekendCents / totalCents) * 100) : 0,
      peakDay,
    };
  }

  calculatePaymentMethodDistribution(expenses: Expense[], period?: string): PaymentMethodSummary[] {
    const filtered = period
      ? expenses.filter((e) => e.transaction_date.startsWith(period))
      : expenses;

    const totalCents = sumBy(filtered, (e) => toCents(e.amount));

    const methodColorMap: Record<string, string> = {
      CREDIT_CARD: '#4F46E5', // Indigo
      DEBIT_CARD: '#059669', // Emerald
      BANK_TRANSFER: '#2563EB', // Blue
      CASH: '#D97706', // Amber
      OTHER: '#64748B', // Slate
    };

    const methodLabelMap: Record<string, string> = {
      CREDIT_CARD: 'Credit Card',
      DEBIT_CARD: 'Debit Card',
      BANK_TRANSFER: 'Bank Transfer',
      CASH: 'Cash',
      OTHER: 'Other',
    };

    const methodMap = new Map<string, { totalCents: number; count: number }>();

    filtered.forEach((e) => {
      const raw = (e.payment_method || '').trim().toUpperCase();
      const methodKey = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER'].includes(raw)
        ? raw
        : 'OTHER';
      const cur = methodMap.get(methodKey) || { totalCents: 0, count: 0 };
      methodMap.set(methodKey, {
        totalCents: cur.totalCents + toCents(e.amount),
        count: cur.count + 1,
      });
    });

    const summaries: PaymentMethodSummary[] = [];

    methodMap.forEach((data, methodKey) => {
      if (data.totalCents > 0) {
        const amount = fromCents(data.totalCents);
        const percentage = totalCents > 0 ? (data.totalCents / totalCents) * 100 : 0;
        const avg = data.count > 0 ? fromCents(Math.round(data.totalCents / data.count)) : 0;

        summaries.push({
          method: methodKey,
          label: methodLabelMap[methodKey] || methodKey,
          totalAmount: amount,
          percentage: roundToTwoDecimals(percentage),
          transactionCount: data.count,
          averageTransaction: avg,
          color: methodColorMap[methodKey] || '#94A3B8',
        });
      }
    });

    return summaries.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  calculateFixedVsVariableBreakdown(
    expenses: Expense[],
    categories: Category[],
    members: FamilyMember[],
    period: string,
  ): FixedVsVariableBreakdown {
    const periodExpenses = expenses.filter((e) => e.transaction_date.startsWith(period));
    const totalCents = sumBy(periodExpenses, (e) => toCents(e.amount));
    const totalSpend = fromCents(totalCents);

    const recurringExpenses = periodExpenses.filter((e) => Boolean(e.is_recurring));
    const variableExpenses = periodExpenses.filter((e) => !e.is_recurring);

    const fixedCents = sumBy(recurringExpenses, (e) => toCents(e.amount));
    const fixedSpend = fromCents(fixedCents);
    const variableSpend = fromCents(Math.max(0, totalCents - fixedCents));

    const fixedPercentage =
      totalCents > 0 ? roundToTwoDecimals((fixedCents / totalCents) * 100) : 0;
    const variablePercentage =
      totalCents > 0 ? roundToTwoDecimals(((totalCents - fixedCents) / totalCents) * 100) : 0;

    const recurringItems: RecurringExpenseItem[] = recurringExpenses
      .map((expense) => {
        const frequency = detectRecurringFrequency(expense);
        const monthlyAmount = calculateMonthlyNormalizedAmount(expense.amount, frequency);
        const category = categories.find((c) => c.id === expense.category_id);
        const payer = members.find((m) => m.id === expense.paid_by_member_id);

        return {
          expense,
          frequency,
          monthlyAmount,
          category,
          payer,
        };
      })
      .sort((a, b) => b.expense.amount - a.expense.amount);

    const monthlyNormalizedFixedSpendCents = recurringItems.reduce(
      (acc, item) => acc + toCents(item.monthlyAmount),
      0,
    );
    const monthlyNormalizedFixedSpend = fromCents(monthlyNormalizedFixedSpendCents);

    // Fixed breakdown by category
    const catCentsMap = new Map<string, { totalCents: number; count: number }>();
    recurringExpenses.forEach((e) => {
      const cur = catCentsMap.get(e.category_id) || { totalCents: 0, count: 0 };
      catCentsMap.set(e.category_id, {
        totalCents: cur.totalCents + toCents(e.amount),
        count: cur.count + 1,
      });
    });

    const categoryBreakdown: RecurringCategoryShare[] = [];
    catCentsMap.forEach((data, catId) => {
      const cat = categories.find((c) => c.id === catId) || {
        id: catId,
        family_id: '',
        name: 'Uncategorized',
        icon: 'Tag',
        color: '#94A3B8',
      };
      const catTotal = fromCents(data.totalCents);
      const percentage =
        fixedCents > 0 ? roundToTwoDecimals((data.totalCents / fixedCents) * 100) : 0;
      categoryBreakdown.push({
        category: cat,
        total: catTotal,
        percentage,
        count: data.count,
      });
    });

    categoryBreakdown.sort((a, b) => b.total - a.total);

    return {
      period,
      totalSpend,
      fixedSpend,
      variableSpend,
      fixedPercentage,
      variablePercentage,
      recurringCount: recurringExpenses.length,
      variableCount: variableExpenses.length,
      monthlyNormalizedFixedSpend,
      recurringItems,
      categoryBreakdown,
    };
  }
}

export const analyticsCalculator = new AnalyticsCalculator();

// Function exports for convenience
export const calculateMonthlyMetrics = (
  expenses: Expense[],
  categories: Category[],
  members: FamilyMember[],
  period: string,
  referenceDate?: Date,
) =>
  analyticsCalculator.calculateMonthlyMetrics(expenses, categories, members, period, referenceDate);

export const calculateCategoryBreakdown = (expenses: Expense[], categories: Category[]) =>
  analyticsCalculator.calculateCategoryBreakdown(expenses, categories);

export const calculateMemberContributions = (expenses: Expense[], members: FamilyMember[]) =>
  analyticsCalculator.calculateMemberContributions(expenses, members);

export const calculateSpendingVelocity = (expenses: Expense[], period: string) =>
  analyticsCalculator.calculateSpendingVelocity(expenses, period);

export const calculateHistoricalMonthlyTrends = (
  expenses: Expense[],
  currentPeriod: string,
  monthsCount?: number,
) => analyticsCalculator.calculateHistoricalMonthlyTrends(expenses, currentPeriod, monthsCount);

export const calculateComparativeSpendingVelocity = (
  expenses: Expense[],
  currentPeriod: string,
  referenceDate?: Date,
) =>
  analyticsCalculator.calculateComparativeSpendingVelocity(expenses, currentPeriod, referenceDate);

export const calculateDayOfWeekDistribution = (expenses: Expense[], period?: string) =>
  analyticsCalculator.calculateDayOfWeekDistribution(expenses, period);

export const calculatePaymentMethodDistribution = (expenses: Expense[], period?: string) =>
  analyticsCalculator.calculatePaymentMethodDistribution(expenses, period);

export const calculateFixedVsVariableBreakdown = (
  expenses: Expense[],
  categories: Category[],
  members: FamilyMember[],
  period: string,
) => analyticsCalculator.calculateFixedVsVariableBreakdown(expenses, categories, members, period);
