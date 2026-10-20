import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Card } from '@/components/common/Card';
import { CategorySummary } from '@/services/analytics';
import { StatementSpendHero } from './StatementSpendHero';
import { StatementActionDock } from './StatementActionDock';
import { StatementMetricsStrip } from './StatementMetricsStrip';
import { StatementCategoryBreakdown } from './StatementCategoryBreakdown';

export interface MonthlyStatementCardProps {
  currency: string;
  transactionCount: number;
  decimalPart: string;
  formattedWhole: string;
  hasPreviousMonthComparison: boolean;
  isPacingHigher: boolean;
  isPacingLower: boolean;
  pacingPct: number;
  dailyAverageBurn: number;
  categoryBreakdown: CategorySummary[];
  topCategories: CategorySummary[];
  onQuickAdd: () => void;
  onImport: () => void;
  onFilterByCategory: (categoryId: string) => void;
}

export const MonthlyStatementCard: React.FC<MonthlyStatementCardProps> = ({
  currency,
  transactionCount,
  decimalPart,
  formattedWhole,
  hasPreviousMonthComparison,
  isPacingHigher,
  isPacingLower,
  pacingPct,
  dailyAverageBurn,
  categoryBreakdown,
  topCategories,
  onQuickAdd,
  onImport,
  onFilterByCategory,
}) => {
  const { theme, spacing } = useTheme();

  return (
    <Card
      padding="none"
      style={{
        marginBottom: spacing.lg,
        overflow: 'hidden',
      }}
    >
      {/* Top Brand Accent Rule */}
      <View
        style={{
          height: 4,
          backgroundColor: theme.colors.brand,
          width: '100%',
        }}
      />

      <View style={{ padding: spacing.lg }}>
        <StatementSpendHero
          currency={currency}
          transactionCount={transactionCount}
          decimalPart={decimalPart}
          formattedWhole={formattedWhole}
          hasPreviousMonthComparison={hasPreviousMonthComparison}
          isPacingHigher={isPacingHigher}
          isPacingLower={isPacingLower}
          pacingPct={pacingPct}
        />

        <StatementActionDock onQuickAdd={onQuickAdd} onImport={onImport} />
      </View>

      {/* 2-Column Financial Metrics Strip */}
      <StatementMetricsStrip
        currency={currency}
        dailyAverageBurn={dailyAverageBurn}
        topCategory={topCategories[0]}
      />

      {/* Visual Category Allocation Strip & Interactive Top Categories */}
      {categoryBreakdown.length > 0 && (
        <StatementCategoryBreakdown
          currency={currency}
          categoryBreakdown={categoryBreakdown}
          topCategories={topCategories}
          onFilterByCategory={onFilterByCategory}
        />
      )}
    </Card>
  );
};
