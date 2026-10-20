import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n, getLocalizedCategoryName } from '@/i18n';
import { IconHelper } from '@/components/common/IconHelper';
import { CategorySummary } from '@/services/analytics';

export interface StatementCategoryBreakdownProps {
  currency: string;
  categoryBreakdown: CategorySummary[];
  topCategories: CategorySummary[];
  onFilterByCategory: (categoryId: string) => void;
}

export const StatementCategoryBreakdown: React.FC<StatementCategoryBreakdownProps> = ({
  currency,
  categoryBreakdown,
  topCategories,
  onFilterByCategory,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.bold,
          }}
        >
          {t.dashboard.whereMoneyWent}
        </Text>
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: typography.fontSizes.xs,
            fontWeight: typography.fontWeights.medium,
          }}
        >
          {t.dashboard.tapToFilter}
        </Text>
      </View>

      {/* Proportional Multi-Segment Category Bar */}
      <View
        style={{
          height: 10,
          borderRadius: radius.xs,
          backgroundColor: theme.colors.surfaceSubtle,
          flexDirection: 'row',
          overflow: 'hidden',
          gap: 2,
          marginBottom: spacing.md,
        }}
      >
        {categoryBreakdown.map((cb) => (
          <View
            key={cb.category.id}
            style={{
              flex: Math.max(cb.percentage, 3),
              height: '100%',
              backgroundColor: cb.category.color || theme.colors.brand,
            }}
          />
        ))}
      </View>

      {/* Interactive Category Rows (Top 4) */}
      <View style={{ gap: spacing.xs + 2 }}>
        {topCategories.map((cb) => {
          const catName = getLocalizedCategoryName(cb.category, t);
          const catColor = cb.category.color || theme.colors.brand;
          return (
            <TouchableOpacity
              key={cb.category.id}
              activeOpacity={0.7}
              onPress={() => onFilterByCategory(cb.category.id)}
              accessibilityRole="button"
              accessibilityLabel={`${catName}, ${currency}${cb.total.toFixed(2)}, ${cb.percentage.toFixed(0)}%`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 48,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs + 2,
                borderRadius: radius.md,
                backgroundColor: theme.isDark
                  ? theme.colors.surfaceSubtle
                  : theme.colors.surfaceElevated,
                borderWidth: 1,
                borderColor: theme.colors.borderSubtle,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: radius.sm,
                    backgroundColor: `${catColor}18`,
                    borderWidth: 1,
                    borderColor: `${catColor}35`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconHelper name={cb.category.icon} size={17} color={catColor} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: typography.fontWeights.bold,
                    }}
                    numberOfLines={1}
                  >
                    {catName}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: typography.fontSizes.xs,
                      fontWeight: typography.fontWeights.medium,
                    }}
                  >
                    {cb.transactionCount} {t.dashboard.txs} • {cb.percentage.toFixed(0)}%
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  marginLeft: spacing.sm,
                }}
              >
                <Text
                  style={[
                    {
                      color: theme.colors.textPrimary,
                      fontSize: typography.fontSizes.md,
                      fontWeight: typography.fontWeights.heavy,
                    },
                    TABULAR_NUMS,
                  ]}
                >
                  {currency}
                  {cb.total.toFixed(2)}
                </Text>
                <ChevronRight size={16} color={theme.colors.textMuted} strokeWidth={2.2} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
