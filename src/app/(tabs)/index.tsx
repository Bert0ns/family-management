import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/services/store';
import {
  calculateMonthlyMetrics,
  calculateMemberContributions,
  calculateCategoryBreakdown,
  calculateComparativeSpendingVelocity,
} from '@/services/analytics';
import { ExpenseDetailModal } from '@/components/ledger/ExpenseDetailModal';
import { EditExpenseModal } from '@/components/ledger/EditExpenseModal';
import { Expense } from '@/types';
import { useTabScroll } from '@/context/TabScrollContext';
import { formatGroupDateHeader } from '@/utils/date';
import {
  DashboardHeader,
  MonthlyStatementCard,
  MemberLedgerCard,
  RecentExpensesSection,
  type GroupedExpenseDay,
} from '@/components/dashboard';

export default function DashboardScreen() {
  const router = useRouter();
  const { theme, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { locale } = useI18n();
  const { handleTabScroll } = useTabScroll();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<Expense | null>(null);

  const family = useAppStore((s) => s.family);
  const members = useAppStore((s) => s.members);
  const categories = useAppStore((s) => s.categories);
  const expenses = useAppStore((s) => s.expenses);
  const currentMemberId = useAppStore((s) => s.currentMemberId);
  const selectedPeriod = useAppStore((s) => s.selectedPeriod);
  const setSelectedPeriod = useAppStore((s) => s.setSelectedPeriod);
  const setFilters = useAppStore((s) => s.setFilters);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const deleteExpense = useAppStore((s) => s.deleteExpense);
  const updateExpense = useAppStore((s) => s.updateExpense);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => setRefreshing(false), 600);
  }, []);

  const metrics = useMemo(
    () => calculateMonthlyMetrics(expenses, categories, members, selectedPeriod),
    [expenses, categories, members, selectedPeriod],
  );

  const periodExpensesAll = useMemo(
    () => expenses.filter((e) => e.transaction_date.startsWith(selectedPeriod)),
    [expenses, selectedPeriod],
  );

  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(periodExpensesAll, categories),
    [periodExpensesAll, categories],
  );

  const memberContributions = useMemo(
    () => calculateMemberContributions(periodExpensesAll, members),
    [periodExpensesAll, members],
  );

  const velocity = useMemo(
    () => calculateComparativeSpendingVelocity(expenses, selectedPeriod),
    [expenses, selectedPeriod],
  );

  // Filter expenses for selected period, sorted newest first, top 6
  const periodExpenses = useMemo(
    () =>
      [...periodExpensesAll]
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        .slice(0, 6),
    [periodExpensesAll],
  );

  // Group recent expenses by date for scannable register display
  const groupedRecentExpenses = useMemo(() => {
    const groups: GroupedExpenseDay[] = [];
    for (const exp of periodExpenses) {
      const dateKey = exp.transaction_date.slice(0, 10);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === dateKey) {
        lastGroup.items.push(exp);
        lastGroup.dayTotal += exp.amount;
      } else {
        groups.push({
          date: dateKey,
          label: formatGroupDateHeader(dateKey, locale),
          dayTotal: exp.amount,
          items: [exp],
        });
      }
    }
    return groups;
  }, [periodExpenses, locale]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const handleSelectExpense = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedExpense(null);
  }, []);

  const handleDeleteExpense = useCallback(
    (id: string) => {
      deleteExpense(id);
      setSelectedExpense(null);
    },
    [deleteExpense],
  );

  const handleFilterByCategory = useCallback(
    (categoryId: string) => {
      resetFilters();
      setFilters({ selectedCategoryId: categoryId });
      router.push('/(tabs)/ledger');
    },
    [resetFilters, setFilters, router],
  );

  const handleFilterByMember = useCallback(
    (memberId: string) => {
      resetFilters();
      setFilters({ selectedMemberId: memberId });
      router.push('/(tabs)/ledger');
    },
    [resetFilters, setFilters, router],
  );

  const handleOpenFullLedger = useCallback(() => {
    resetFilters();
    router.push('/(tabs)/ledger');
  }, [resetFilters, router]);

  // Split totalSpend into integer and decimal parts for editorial typographic rendering
  const formattedTotal = metrics.totalSpend.toFixed(2);
  const [wholePart, decimalPart] = formattedTotal.split('.');
  const formattedWhole = Number(wholePart).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US');

  const topCategories = categoryBreakdown.slice(0, 4);
  const pacingPct = velocity.pacingPercentage ?? 0;
  const hasPreviousMonthComparison =
    velocity.previousToDate > 0 && velocity.pacingPercentage !== null;
  const isPacingHigher = pacingPct > 2;
  const isPacingLower = pacingPct < -2;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingTop: Math.max(insets.top, spacing.md),
        paddingBottom: 132,
        maxWidth: 780,
        width: '100%',
        alignSelf: 'center',
      }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      onScroll={handleTabScroll}
      scrollEventThrottle={16}
    >
      {/* 1. Household Masthead & 2. Month Stepper */}
      <DashboardHeader
        familyName={family.name}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* 3. Household Monthly Statement Sheet */}
      <MonthlyStatementCard
        currency={family.currency}
        transactionCount={metrics.transactionCount}
        decimalPart={decimalPart}
        formattedWhole={formattedWhole}
        hasPreviousMonthComparison={hasPreviousMonthComparison}
        isPacingHigher={isPacingHigher}
        isPacingLower={isPacingLower}
        pacingPct={pacingPct}
        dailyAverageBurn={metrics.dailyAverageBurn}
        categoryBreakdown={categoryBreakdown}
        topCategories={topCategories}
        onQuickAdd={() => router.push('/expense/add')}
        onImport={() => router.push('/(tabs)/import')}
        onFilterByCategory={handleFilterByCategory}
      />

      {/* 4. Interactive Family Member Ledger ("Who Paid What") */}
      <MemberLedgerCard
        memberContributions={memberContributions}
        currentMemberId={currentMemberId}
        currency={family.currency}
        onNavigateToFamily={() => router.push('/(tabs)/family')}
        onFilterByMember={handleFilterByMember}
      />

      {/* 5. Date-Grouped Recent Activity Register */}
      <RecentExpensesSection
        groupedRecentExpenses={groupedRecentExpenses}
        totalExpensesCount={periodExpensesAll.length}
        categoryMap={categoryMap}
        memberMap={memberMap}
        currency={family.currency}
        hasMoreTransactions={periodExpensesAll.length > periodExpenses.length}
        onOpenFullLedger={handleOpenFullLedger}
        onSelectExpense={handleSelectExpense}
        onAddFirstExpense={() => router.push('/expense/add')}
      />

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <ExpenseDetailModal
          visible={Boolean(selectedExpense)}
          expense={selectedExpense}
          category={categoryMap.get(selectedExpense.category_id)}
          member={memberMap.get(selectedExpense.paid_by_member_id)}
          currency={family.currency}
          onClose={handleCloseModal}
          onDelete={handleDeleteExpense}
          onEdit={(exp) => setSelectedExpenseForEdit(exp)}
        />
      )}

      {/* Edit Expense Modal */}
      {selectedExpenseForEdit && (
        <EditExpenseModal
          visible={!!selectedExpenseForEdit}
          expense={selectedExpenseForEdit}
          categories={categories}
          members={members}
          currency={family.currency}
          onClose={() => setSelectedExpenseForEdit(null)}
          onSave={async (id, updates) => {
            await updateExpense(id, updates);
            setSelectedExpenseForEdit(null);
          }}
        />
      )}
    </ScrollView>
  );
}
