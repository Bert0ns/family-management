import React from 'react';
import { View, Text } from 'react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n, getLocalizedCategoryName } from '@/i18n';
import { CategorySummary } from '@/services/analytics';

export interface StatementMetricsStripProps {
  currency: string;
  dailyAverageBurn: number;
  topCategory?: CategorySummary;
}

export const StatementMetricsStrip: React.FC<StatementMetricsStripProps> = ({
  currency,
  dailyAverageBurn,
  topCategory,
}) => {
  const { theme, spacing, typography } = useTheme();
  const { t } = useI18n();

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.isDark ? theme.colors.surfaceSubtle : theme.colors.surfaceElevated,
      }}
    >
      {/* Daily Average */}
      <View
        style={{
          flex: 1,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderRightWidth: 1,
          borderRightColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: typography.fontSizes.xs,
            fontWeight: typography.fontWeights.semibold,
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {t.dashboard.dailyAverage}
        </Text>
        <Text
          style={[
            {
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.lg,
              fontWeight: typography.fontWeights.heavy,
            },
            TABULAR_NUMS,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {currency}
          {dailyAverageBurn.toFixed(2)}
        </Text>
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 11,
            fontWeight: typography.fontWeights.medium,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {t.dashboard.burnRatePerDay}
        </Text>
      </View>

      {/* Top Category */}
      <View
        style={{
          flex: 1,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
        }}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: typography.fontSizes.xs,
            fontWeight: typography.fontWeights.semibold,
            marginBottom: 4,
          }}
          numberOfLines={1}
        >
          {t.expenseDetail.category} #1
        </Text>
        {topCategory ? (
          <>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.heavy,
              }}
              numberOfLines={1}
            >
              {getLocalizedCategoryName(topCategory.category, t)}
            </Text>
            <Text
              style={[
                {
                  color: topCategory.category.color || theme.colors.brand,
                  fontSize: 12,
                  fontWeight: typography.fontWeights.bold,
                  marginTop: 2,
                },
                TABULAR_NUMS,
              ]}
              numberOfLines={1}
            >
              {currency}
              {topCategory.total.toFixed(0)} ({topCategory.percentage.toFixed(0)}%)
            </Text>
          </>
        ) : (
          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            —
          </Text>
        )}
      </View>
    </View>
  );
};
