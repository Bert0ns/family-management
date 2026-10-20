import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileJson,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n, getLocalizedCategoryName } from '@/i18n';
import { Card } from '@/components/common/Card';
import { IconHelper } from '@/components/common/IconHelper';
import { CategorySummary } from '@/services/analytics';

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
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

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

        {/* Primary Action Dock */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onQuickAdd}
            accessibilityRole="button"
            accessibilityLabel={t.dashboard.quickAddButton}
            style={{
              flex: 1.35,
              minHeight: 56,
              borderRadius: radius.md,
              backgroundColor: theme.colors.brand,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.md,
              gap: spacing.xs + 2,
            }}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2.8} />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
              }}
              numberOfLines={1}
            >
              {t.dashboard.quickAddButton}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onImport}
            accessibilityRole="button"
            accessibilityLabel={t.dashboard.bulkImportButton}
            style={{
              flex: 1,
              minHeight: 56,
              borderRadius: radius.md,
              backgroundColor: theme.isDark
                ? theme.colors.surfaceContainerHigh
                : theme.colors.surfaceSubtle,
              borderWidth: 1,
              borderColor: theme.colors.borderTactile,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.md,
              gap: spacing.xs + 2,
            }}
          >
            <FileJson size={19} color={theme.colors.textPrimary} strokeWidth={2.2} />
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.sm,
                fontWeight: typography.fontWeights.bold,
              }}
              numberOfLines={1}
            >
              {t.common.import}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2-Column Financial Metrics Strip */}
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
          {topCategories[0] ? (
            <>
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: typography.fontSizes.md,
                  fontWeight: typography.fontWeights.heavy,
                }}
                numberOfLines={1}
              >
                {getLocalizedCategoryName(topCategories[0].category, t)}
              </Text>
              <Text
                style={[
                  {
                    color: topCategories[0].category.color || theme.colors.brand,
                    fontSize: 12,
                    fontWeight: typography.fontWeights.bold,
                    marginTop: 2,
                  },
                  TABULAR_NUMS,
                ]}
                numberOfLines={1}
              >
                {currency}
                {topCategories[0].total.toFixed(0)} ({topCategories[0].percentage.toFixed(0)}%)
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

      {/* Visual Category Allocation Strip & Interactive Top Categories */}
      {categoryBreakdown.length > 0 && (
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
      )}
    </Card>
  );
};
