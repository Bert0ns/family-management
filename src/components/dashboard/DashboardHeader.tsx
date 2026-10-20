import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';
import { PeriodSelector } from '@/components/common/PeriodSelector';
import { SyncBadge } from '@/components/common/SyncBadge';

interface DashboardHeaderProps {
  familyName: string;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  familyName,
  selectedPeriod,
  onPeriodChange,
}) => {
  const { theme, spacing, typography } = useTheme();
  const { t } = useI18n();

  return (
    <>
      {/* Household Masthead */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, marginRight: spacing.sm }}>
          <Text
            style={{
              color: theme.colors.brand,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.bold,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            {t.dashboard.householdOverview}
          </Text>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.xl,
              fontWeight: typography.fontWeights.heavy,
              letterSpacing: -0.3,
            }}
            numberOfLines={1}
          >
            {familyName}
          </Text>
        </View>

        <SyncBadge />
      </View>

      {/* Month Stepper */}
      <View style={{ marginBottom: spacing.md }}>
        <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={onPeriodChange} />
      </View>
    </>
  );
};
