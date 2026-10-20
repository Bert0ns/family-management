import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';
import { formatPeriodLabel, getAdjacentPeriod } from '@/utils/date';

interface PeriodSelectorProps {
  selectedPeriod: string; // YYYY-MM
  onPeriodChange: (newPeriod: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const { theme, spacing, radius, typography, touchTargets } = useTheme();
  const { t, locale } = useI18n();

  const formattedPeriod = formatPeriodLabel(selectedPeriod, locale);

  const handlePrev = () => {
    onPeriodChange(getAdjacentPeriod(selectedPeriod, -1));
  };

  const handleNext = () => {
    onPeriodChange(getAdjacentPeriod(selectedPeriod, 1));
  };

  const chevronButtonDimension = Math.max(48, touchTargets.sm);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.card,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.cardBorder,
        paddingHorizontal: spacing.xs + 2,
        paddingVertical: spacing.xs,
        minHeight: Math.max(56, chevronButtonDimension + spacing.xs * 2),
        gap: spacing.xs,
      }}
    >
      <TouchableOpacity
        onPress={handlePrev}
        activeOpacity={0.7}
        accessibilityLabel={t.common.previousMonth}
        style={{
          width: chevronButtonDimension,
          height: chevronButtonDimension,
          borderRadius: radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surfaceSubtle,
          borderWidth: 1.5,
          borderColor: theme.colors.borderTactile,
          flexShrink: 0,
        }}
      >
        <ChevronLeft size={20} color={theme.colors.textPrimary} strokeWidth={2.5} />
      </TouchableOpacity>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs + 2,
          flex: 1,
          minWidth: 0,
          paddingHorizontal: spacing.xs,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.sm,
            backgroundColor: theme.colors.brandLight,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Calendar size={16} color={theme.colors.brand} strokeWidth={2.5} />
        </View>
        <Text
          style={{
            color: theme.colors.textPrimary,
            fontSize: typography.fontSizes.md,
            fontWeight: typography.fontWeights.bold,
            textTransform: 'capitalize',
            flexShrink: 1,
            textAlign: 'center',
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {formattedPeriod}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.7}
        accessibilityLabel={t.common.nextMonth}
        style={{
          width: chevronButtonDimension,
          height: chevronButtonDimension,
          borderRadius: radius.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surfaceSubtle,
          borderWidth: 1.5,
          borderColor: theme.colors.borderTactile,
          flexShrink: 0,
        }}
      >
        <ChevronRight size={20} color={theme.colors.textPrimary} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};
