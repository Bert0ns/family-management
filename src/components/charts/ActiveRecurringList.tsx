import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n, getLocalizedCategoryName } from '@/i18n';
import { Expense, RecurringFrequency } from '@/types';
import { FixedVsVariableBreakdown } from '@/services/interfaces';
import { Card } from '@/components/common/Card';
import { IconHelper } from '@/components/common/IconHelper';
import { Repeat } from 'lucide-react-native';

interface ActiveRecurringListProps {
  breakdown: FixedVsVariableBreakdown;
  currency?: string;
  onSelectExpense?: (expense: Expense) => void;
}

export const ActiveRecurringList: React.FC<ActiveRecurringListProps> = ({
  breakdown,
  currency = '€',
  onSelectExpense,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  const getFrequencyLabel = (freq: RecurringFrequency): string => {
    switch (freq) {
      case 'yearly':
        return t.analytics.cadenceYearly;
      case 'quarterly':
        return t.analytics.cadenceQuarterly;
      case 'weekly':
        return t.analytics.cadenceWeekly;
      case 'monthly':
      default:
        return t.analytics.cadenceMonthly;
    }
  };

  if (breakdown.recurringItems.length === 0) {
    return (
      <Card padding="lg">
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.md,
              backgroundColor: `${theme.colors.brand}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.md,
            }}
          >
            <Repeat size={24} color={theme.colors.brand} />
          </View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              textAlign: 'center',
              marginBottom: spacing.xs,
            }}
          >
            {t.analytics.noRecurringData}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              textAlign: 'center',
              maxWidth: 280,
            }}
          >
            {t.analytics.noRecurringHint}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {/* Active Recurring Expenses Card */}
      <Card padding="lg">
        {/* Section Header */}
        <View style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: radius.xs,
                backgroundColor: `${theme.colors.brand}15`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Repeat size={14} color={theme.colors.brand} />
            </View>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.heavy,
              }}
            >
              {t.analytics.activeRecurringTitle}
            </Text>
          </View>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              marginTop: 2,
            }}
          >
            {t.analytics.activeRecurringSubtitle}
          </Text>
        </View>

        {/* Transparency summary banner */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.surfaceSubtle,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: radius.xs,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
            {t.analytics.billedThisMonthLabel}:{' '}
            <Text
              style={[
                { color: theme.colors.textPrimary, fontWeight: typography.fontWeights.bold },
                TABULAR_NUMS,
              ]}
            >
              {currency}
              {breakdown.fixedSpend.toFixed(2)}
            </Text>
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
            {t.analytics.monthlyNormalizedTotalLabel}:{' '}
            <Text
              style={[
                { color: theme.colors.brand, fontWeight: typography.fontWeights.bold },
                TABULAR_NUMS,
              ]}
            >
              {currency}
              {breakdown.monthlyNormalizedFixedSpend.toFixed(2)}/
              {t.analytics.cadenceMonthly.toLowerCase()}
            </Text>
          </Text>
        </View>

        {/* Recurring Items List */}
        <View style={{ gap: spacing.sm }}>
          {breakdown.recurringItems.map((item) => {
            const expense = item.expense;
            const category = item.category;
            const catColor = category?.color || theme.colors.brand;
            const catIcon = category?.icon || 'Tag';
            const catName = category ? getLocalizedCategoryName(category, t) : t.categories.other;
            const payerName = item.payer?.display_name || '?';
            const payerColor = item.payer?.color_code || theme.colors.brand;

            return (
              <TouchableOpacity
                key={expense.id}
                onPress={() => onSelectExpense?.(expense)}
                disabled={!onSelectExpense}
                accessibilityRole="button"
                accessibilityLabel={`${expense.merchant_name}, ${currency}${expense.amount.toFixed(2)}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.colors.surfaceSubtle,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                {/* Left: Icon & Description */}
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: radius.sm,
                      backgroundColor: `${catColor}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconHelper name={catIcon} size={18} color={catColor} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          color: theme.colors.textPrimary,
                          fontSize: typography.fontSizes.sm,
                          fontWeight: typography.fontWeights.bold,
                        }}
                        numberOfLines={1}
                      >
                        {expense.merchant_name}
                      </Text>
                      {/* Frequency Badge */}
                      <View
                        style={{
                          backgroundColor: `${theme.colors.brand}18`,
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                          borderRadius: radius.xs,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.brand,
                            fontSize: 10,
                            fontWeight: typography.fontWeights.bold,
                          }}
                        >
                          {getFrequencyLabel(item.frequency)}
                        </Text>
                      </View>
                    </View>

                    {/* Metadata line: Category & Payer */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.xs,
                        marginTop: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          fontSize: 11,
                        }}
                        numberOfLines={1}
                      >
                        {catName}
                      </Text>
                      <Text style={{ color: theme.colors.border, fontSize: 10 }}>•</Text>
                      {/* Payer Dot & Name */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: radius.xs,
                            backgroundColor: payerColor,
                          }}
                        />
                        <Text
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: 11,
                          }}
                        >
                          {payerName}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right: Amounts */}
                <View style={{ alignItems: 'flex-end', marginLeft: spacing.sm }}>
                  <Text
                    style={[
                      {
                        color: theme.colors.textPrimary,
                        fontSize: typography.fontSizes.sm,
                        fontWeight: typography.fontWeights.heavy,
                      },
                      TABULAR_NUMS,
                    ]}
                  >
                    {currency}
                    {item.monthlyAmount.toFixed(2)}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: 10,
                    }}
                  >
                    {t.analytics.monthlyAmountLabel}
                  </Text>
                  <Text
                    style={[
                      {
                        color: theme.colors.textSecondary,
                        fontSize: 10,
                        marginTop: 1,
                      },
                      TABULAR_NUMS,
                    ]}
                  >
                    {item.frequency === 'monthly'
                      ? t.analytics.billedThisMonthLabel
                      : `${t.analytics.actualBilledLabel}: ${currency}${expense.amount.toFixed(2)}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Breakdown by Category Card */}
      {breakdown.categoryBreakdown.length > 0 && (
        <Card padding="lg">
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.heavy,
              }}
            >
              {t.analytics.recurringByCatTitle}
            </Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            {breakdown.categoryBreakdown.map((share) => {
              const cat = share.category;
              const catName = getLocalizedCategoryName(cat, t);

              return (
                <View key={cat.id} style={{ gap: 4 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: radius.xs,
                          backgroundColor: cat.color,
                        }}
                      />
                      <Text
                        style={{
                          color: theme.colors.textPrimary,
                          fontSize: typography.fontSizes.xs,
                          fontWeight: typography.fontWeights.bold,
                        }}
                      >
                        {catName}
                      </Text>
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          fontSize: 11,
                        }}
                      >
                        ({share.count})
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <Text
                        style={[
                          {
                            color: theme.colors.textPrimary,
                            fontSize: typography.fontSizes.xs,
                            fontWeight: typography.fontWeights.bold,
                          },
                          TABULAR_NUMS,
                        ]}
                      >
                        {currency}
                        {share.total.toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          {
                            color: theme.colors.textSecondary,
                            fontSize: 11,
                          },
                          TABULAR_NUMS,
                        ]}
                      >
                        {share.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View
                    style={{
                      height: 6,
                      backgroundColor: theme.colors.surfaceSubtle,
                      borderRadius: radius.xs,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.min(Math.max(share.percentage, 1), 100)}%`,
                        backgroundColor: cat.color,
                        borderRadius: radius.xs,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      )}
    </View>
  );
};
