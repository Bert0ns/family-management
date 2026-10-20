import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Receipt, Plus } from 'lucide-react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n } from '@/i18n';
import { Card } from '@/components/common/Card';
import { ExpenseItem } from '@/components/ledger/ExpenseItem';
import { Expense, Category, FamilyMember } from '@/types';

export interface GroupedExpenseDay {
  date: string;
  label: string;
  dayTotal: number;
  items: Expense[];
}

export interface RecentExpensesSectionProps {
  groupedRecentExpenses: GroupedExpenseDay[];
  totalExpensesCount: number;
  categoryMap: Map<string, Category>;
  memberMap: Map<string, FamilyMember>;
  currency: string;
  hasMoreTransactions: boolean;
  onOpenFullLedger: () => void;
  onSelectExpense: (expense: Expense) => void;
  onAddFirstExpense: () => void;
}

export const RecentExpensesSection: React.FC<RecentExpensesSectionProps> = ({
  groupedRecentExpenses,
  totalExpensesCount,
  categoryMap,
  memberMap,
  currency,
  hasMoreTransactions,
  onOpenFullLedger,
  onSelectExpense,
  onAddFirstExpense,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.heavy,
            }}
          >
            {t.dashboard.recentExpenses}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onOpenFullLedger}
          accessibilityRole="button"
          accessibilityLabel={t.dashboard.viewAll}
          style={{
            minHeight: 44,
            paddingHorizontal: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Text
            style={{
              color: theme.colors.brand,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {t.dashboard.viewAll} ({totalExpensesCount})
          </Text>
          <ChevronRight size={16} color={theme.colors.brand} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {groupedRecentExpenses.length === 0 ? (
        <Card padding="lg" style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.full,
              backgroundColor: theme.colors.brandLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Receipt size={28} color={theme.colors.brand} strokeWidth={2} />
          </View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              marginBottom: spacing.md,
              textAlign: 'center',
            }}
          >
            {t.dashboard.noExpensesMonth}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAddFirstExpense}
            accessibilityRole="button"
            accessibilityLabel={t.dashboard.addFirstExpense}
            style={{
              minHeight: 48,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: theme.colors.brand,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.xs,
            }}
          >
            <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {t.dashboard.addFirstExpense}
            </Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <View>
          {groupedRecentExpenses.map((group) => (
            <View key={group.date} style={{ marginBottom: spacing.sm }}>
              {/* Date Register Subheader */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: spacing.xs,
                  paddingVertical: 6,
                  marginBottom: 4,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: typography.fontSizes.xs,
                    fontWeight: typography.fontWeights.bold,
                    textTransform: 'capitalize',
                    letterSpacing: 0.2,
                  }}
                >
                  {group.label}
                </Text>
                <Text
                  style={[
                    {
                      color: theme.colors.textMuted,
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.bold,
                    },
                    TABULAR_NUMS,
                  ]}
                >
                  {currency}
                  {group.dayTotal.toFixed(2)}
                </Text>
              </View>

              {group.items.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={categoryMap.get(expense.category_id)}
                  member={memberMap.get(expense.paid_by_member_id)}
                  currency={currency}
                  onPress={onSelectExpense}
                />
              ))}
            </View>
          ))}

          {/* Full-Width Ledger Register Footer Button */}
          {hasMoreTransactions && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onOpenFullLedger}
              accessibilityRole="button"
              accessibilityLabel={t.dashboard.viewAll}
              style={{
                minHeight: 52,
                borderRadius: radius.md,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.cardBorder,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                marginTop: spacing.xs,
              }}
            >
              <Text
                style={{
                  color: theme.colors.brand,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {t.dashboard.viewAll} ({totalExpensesCount} {t.dashboard.totalTransactions})
              </Text>
              <ChevronRight size={18} color={theme.colors.brand} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};
