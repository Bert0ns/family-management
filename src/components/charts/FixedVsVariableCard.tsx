import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n } from '@/i18n';
import { FixedVsVariableBreakdown } from '@/services/interfaces';
import { Card } from '@/components/common/Card';
import { Repeat, ChevronRight, ShoppingBag } from 'lucide-react-native';

interface FixedVsVariableCardProps {
  data: FixedVsVariableBreakdown;
  currency?: string;
  onViewDetails?: () => void;
}

export const FixedVsVariableCard: React.FC<FixedVsVariableCardProps> = ({
  data,
  currency = '€',
  onViewDetails,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  const fixedColor = theme.colors.brand;
  const variableColor = theme.colors.brandSecondary;
  const subtleFixed = `${fixedColor}15`;
  const subtleVariable = `${variableColor}15`;

  const total = data.totalSpend;
  const fixedPct = data.fixedPercentage;
  const variablePct = data.variablePercentage;

  return (
    <Card padding="lg">
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: radius.xs,
                backgroundColor: subtleFixed,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Repeat size={14} color={fixedColor} />
            </View>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.heavy,
              }}
            >
              {t.analytics.fixedVsVariableTitle}
            </Text>
          </View>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              marginTop: 2,
            }}
          >
            {t.analytics.fixedVsVariableSubtitle}
          </Text>
        </View>

        {onViewDetails && (
          <TouchableOpacity
            onPress={onViewDetails}
            accessibilityRole="button"
            accessibilityLabel={t.analytics.viewAllRecurring}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              backgroundColor: theme.colors.surfaceSubtle,
              borderRadius: radius.xs,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                color: theme.colors.brand,
                fontSize: typography.fontSizes.xs,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {t.analytics.recurringTab}
            </Text>
            <ChevronRight size={14} color={theme.colors.brand} />
          </TouchableOpacity>
        )}
      </View>

      {/* Proportional Comparison Bar */}
      <View style={{ marginBottom: spacing.md }}>
        <View
          style={{
            height: 12,
            width: '100%',
            backgroundColor: theme.colors.surfaceSubtle,
            borderRadius: radius.xs,
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {total > 0 ? (
            <>
              {fixedPct > 0 && (
                <View
                  style={{
                    width: `${fixedPct}%`,
                    backgroundColor: fixedColor,
                  }}
                />
              )}
              {variablePct > 0 && (
                <View
                  style={{
                    width: `${variablePct}%`,
                    backgroundColor: variableColor,
                  }}
                />
              )}
            </>
          ) : (
            <View
              style={{
                width: '100%',
                backgroundColor: theme.colors.border,
              }}
            />
          )}
        </View>
      </View>

      {/* Metrics Columns */}
      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        {/* Fixed Spend Box */}
        <View
          style={{
            flex: 1,
            backgroundColor: subtleFixed,
            padding: spacing.md,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: `${fixedColor}30`,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Repeat size={12} color={fixedColor} />
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {t.analytics.fixedCosts}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: `${fixedColor}25`,
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: radius.xs,
              }}
            >
              <Text
                style={{
                  color: fixedColor,
                  fontSize: 10,
                  fontWeight: typography.fontWeights.heavy,
                }}
              >
                {fixedPct.toFixed(0)}%
              </Text>
            </View>
          </View>

          <Text
            style={[
              {
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.heavy,
              },
              TABULAR_NUMS,
            ]}
          >
            {currency}
            {data.fixedSpend.toFixed(2)}
          </Text>

          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            {data.recurringCount} {t.analytics.recurringCountLabel} •{' '}
            {t.analytics.billedThisMonthLabel}
          </Text>
        </View>

        {/* Variable Spend Box */}
        <View
          style={{
            flex: 1,
            backgroundColor: subtleVariable,
            padding: spacing.md,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: `${variableColor}30`,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ShoppingBag size={12} color={variableColor} />
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {t.analytics.variableCosts}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: `${variableColor}25`,
                paddingHorizontal: 6,
                paddingVertical: 1,
                borderRadius: radius.xs,
              }}
            >
              <Text
                style={{
                  color: variableColor,
                  fontSize: 10,
                  fontWeight: typography.fontWeights.heavy,
                }}
              >
                {variablePct.toFixed(0)}%
              </Text>
            </View>
          </View>

          <Text
            style={[
              {
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.lg,
                fontWeight: typography.fontWeights.heavy,
              },
              TABULAR_NUMS,
            ]}
          >
            {currency}
            {data.variableSpend.toFixed(2)}
          </Text>

          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            {data.variableCount} {t.analytics.variableCountLabel}
          </Text>
        </View>
      </View>
    </Card>
  );
};
