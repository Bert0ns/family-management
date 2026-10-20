import React from 'react';
import { View, Text } from 'react-native';
import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n } from '@/i18n';

export interface StatementSpendHeroProps {
  currency: string;
  transactionCount: number;
  decimalPart: string;
  formattedWhole: string;
  hasPreviousMonthComparison: boolean;
  isPacingHigher: boolean;
  isPacingLower: boolean;
  pacingPct: number;
}

export const StatementSpendHero: React.FC<StatementSpendHeroProps> = ({
  currency,
  transactionCount,
  decimalPart,
  formattedWhole,
  hasPreviousMonthComparison,
  isPacingHigher,
  isPacingLower,
  pacingPct,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  return (
    <>
      {/* Statement Header Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs,
          flexWrap: 'wrap',
          gap: spacing.xs,
        }}
      >
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: typography.fontSizes.sm,
            fontWeight: typography.fontWeights.bold,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}
        >
          {t.dashboard.thisMonthSpending}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            paddingHorizontal: spacing.sm + 2,
            paddingVertical: 4,
            borderRadius: radius.pill,
            backgroundColor: theme.colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: theme.colors.borderTactile,
          }}
        >
          <Receipt size={13} color={theme.colors.textSecondary} strokeWidth={2.2} />
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
            {transactionCount} {t.dashboard.totalTransactions}
          </Text>
        </View>
      </View>

      {/* Editorial Tabular Numeral Display */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginTop: spacing.xxs,
          marginBottom: spacing.md,
          gap: spacing.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 }}>
          <Text
            style={[
              {
                color: theme.colors.textSecondary,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.bold,
                marginRight: 3,
              },
              TABULAR_NUMS,
            ]}
          >
            {currency}
          </Text>
          <Text
            style={[
              {
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.hero,
                fontWeight: typography.fontWeights.heavy,
                letterSpacing: -1,
              },
              TABULAR_NUMS,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {formattedWhole}
          </Text>
          <Text
            style={[
              {
                color: theme.colors.textMuted,
                fontSize: typography.fontSizes.xl,
                fontWeight: typography.fontWeights.bold,
              },
              TABULAR_NUMS,
            ]}
          >
            .{decimalPart}
          </Text>
        </View>

        {/* Month-over-Month Pacing Badge */}
        {hasPreviousMonthComparison && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: spacing.sm,
              paddingVertical: 5,
              borderRadius: radius.sm,
              backgroundColor: isPacingHigher
                ? theme.colors.warningBg
                : isPacingLower
                  ? theme.colors.successBg
                  : theme.colors.surfaceSubtle,
            }}
          >
            {isPacingHigher ? (
              <ArrowUpRight size={15} color={theme.colors.warning} strokeWidth={2.5} />
            ) : isPacingLower ? (
              <ArrowDownRight size={15} color={theme.colors.success} strokeWidth={2.5} />
            ) : null}
            <Text
              style={[
                {
                  color: isPacingHigher
                    ? theme.colors.warning
                    : isPacingLower
                      ? theme.colors.success
                      : theme.colors.textSecondary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.bold,
                },
                TABULAR_NUMS,
              ]}
            >
              {pacingPct > 0 ? '+' : ''}
              {pacingPct.toFixed(0)}% {t.dashboard.vsLastMonth}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};
