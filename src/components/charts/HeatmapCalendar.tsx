import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Filter, X } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/services/store';
import { DailySpendPoint } from '@/services/analytics';
import { Card } from '@/components/common/Card';
import { hexToRgba } from '@/utils/color';

interface HeatmapCalendarProps {
  data: DailySpendPoint[];
  period: string; // YYYY-MM
  currency?: string;
  onSelectDay?: (date: string, amount: number) => void;
  onFilterLedger?: (date: string) => void;
}

export function parseSafePeriod(period?: string): {
  year: number;
  month: number;
  daysInMonth: number;
  adjustedFirstDay: number;
} {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  if (period && typeof period === 'string') {
    const trimmed = period.trim();
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(trimmed)) {
      const [yearStr, monthStr] = trimmed.split('-');
      const parsedYear = parseInt(yearStr, 10);
      const parsedMonth = parseInt(monthStr, 10);
      if (!isNaN(parsedYear) && !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
        year = parsedYear;
        month = parsedMonth;
      }
    }
  }

  const rawFirstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const rawDaysInMonth = new Date(year, month, 0).getDate();

  const adjustedFirstDay = isNaN(rawFirstDay)
    ? 0
    : rawFirstDay === 0
      ? 6
      : Math.max(0, Math.min(6, rawFirstDay - 1));
  const daysInMonth = isNaN(rawDaysInMonth) ? 30 : Math.max(1, Math.min(31, rawDaysInMonth));

  return { year, month, daysInMonth, adjustedFirstDay };
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  data,
  period,
  currency = '€',
  onSelectDay,
  onFilterLedger,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t, locale } = useI18n();
  const setFilters = useAppStore((s) => s.setFilters);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const maxDaily = data.reduce((max, d) => Math.max(max, d.dailyAmount), 10);

  const getHeatColor = (amount: number) => {
    if (amount === 0) return theme.colors.surfaceSubtle;
    const ratio = amount / maxDaily;
    if (ratio < 0.25) return hexToRgba(theme.colors.brand, 0.2);
    if (ratio < 0.5) return hexToRgba(theme.colors.brand, 0.45);
    if (ratio < 0.75) return hexToRgba(theme.colors.brand, 0.7);
    return theme.colors.brand;
  };

  const { year, month, adjustedFirstDay, daysInMonth } = parseSafePeriod(period);

  const dateLocale = locale === 'it' ? 'it-IT' : 'en-US';
  const dayHeaders = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(2024, 0, 1 + i);
    return d.toLocaleDateString(dateLocale, { weekday: 'narrow' });
  });
  const colWidth = `${100 / 7}%` as const;

  const selectedDayData =
    selectedDay !== null ? data.find((d) => d.day === selectedDay) : undefined;
  const selectedAmount = selectedDayData ? selectedDayData.dailyAmount : 0;
  const selectedIsoDate =
    selectedDay !== null
      ? selectedDayData?.dateStr || `${period}-${String(selectedDay).padStart(2, '0')}`
      : '';
  const selectedFormattedDate =
    selectedDay !== null
      ? new Date(year, month - 1, selectedDay).toLocaleDateString(dateLocale, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '';

  const handleDayPress = (dayNum: number, amount: number, isoDate: string) => {
    if (selectedDay === dayNum) {
      setSelectedDay(null);
    } else {
      setSelectedDay(dayNum);
      onSelectDay?.(isoDate, amount);
    }
  };

  const handleFilterLedger = (isoDate: string) => {
    setFilters({
      startDate: isoDate,
      endDate: isoDate,
      periodPreset: 'all',
    });
    if (onFilterLedger) {
      onFilterLedger(isoDate);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { router } = require('expo-router');
      router.push('/(tabs)/ledger');
    } catch {
      // Safe fallback in test environments
    }
  };

  return (
    <Card padding="md">
      <Text
        style={{
          color: theme.colors.textPrimary,
          fontSize: typography.fontSizes.lg,
          fontWeight: typography.fontWeights.bold,
          marginBottom: spacing.md,
        }}
      >
        {t.analytics.heatmapTitle}
      </Text>

      {/* Weekday headers */}
      <View style={{ flexDirection: 'row', marginBottom: spacing.xs }}>
        {dayHeaders.map((dh, i) => (
          <View key={i} style={{ width: colWidth, alignItems: 'center' }}>
            <Text
              style={{
                textAlign: 'center',
                color: theme.colors.textMuted,
                fontSize: typography.fontSizes.xs,
                fontWeight: typography.fontWeights.semibold,
              }}
            >
              {dh}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Empty placeholder cells for start offset */}
        {Array.from({ length: adjustedFirstDay }).map((_, i) => (
          <View key={`empty-${i}`} style={{ width: colWidth, height: 34, padding: 2 }} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayData = data.find((d) => d.day === dayNum);
          const amount = dayData ? dayData.dailyAmount : 0;
          const cellBg = getHeatColor(amount);
          const isHigh = amount > maxDaily * 0.5;
          const isSelected = selectedDay === dayNum;
          const isoDate = dayData?.dateStr || `${period}-${String(dayNum).padStart(2, '0')}`;

          const dateObj = new Date(year, month - 1, dayNum);
          const formattedDate = dateObj.toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          const accessibilityLabel =
            amount > 0
              ? locale === 'it'
                ? `${formattedDate}: ${currency}${amount.toFixed(2)} spesi`
                : `${formattedDate}: ${currency}${amount.toFixed(2)} spent`
              : locale === 'it'
                ? `${formattedDate}: nessuna spesa`
                : `${formattedDate}: no expenses`;

          return (
            <View
              key={`day-${dayNum}`}
              style={{
                width: colWidth,
                height: 34,
                padding: 2,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleDayPress(dayNum, amount, isoDate)}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityState={{ selected: isSelected }}
                accessibilityHint={
                  amount > 0
                    ? locale === 'it'
                      ? 'Tocca per visualizzare il totale o filtrare il ledger'
                      : 'Tap to view total or filter ledger'
                    : undefined
                }
                style={{
                  flex: 1,
                  borderRadius: radius.xs,
                  backgroundColor: cellBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: isSelected ? theme.colors.textPrimary : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: isSelected
                      ? typography.fontWeights.heavy
                      : typography.fontWeights.semibold,
                    color: isHigh ? theme.colors.textInverse : theme.colors.textPrimary,
                  }}
                >
                  {dayNum}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Interactive Day Details Popover / Tooltip */}
      {selectedDay !== null && (
        <View
          style={{
            marginTop: spacing.md,
            padding: spacing.md,
            backgroundColor: theme.isDark
              ? theme.colors.surfaceContainerHigh
              : theme.colors.surfaceSubtle,
            borderRadius: radius.sm,
            borderWidth: 1.5,
            borderColor: theme.colors.borderTactile,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.sm,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: typography.fontSizes.xs,
                fontWeight: typography.fontWeights.medium,
                textTransform: 'capitalize',
              }}
              numberOfLines={1}
            >
              {selectedFormattedDate}
            </Text>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.heavy,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {selectedAmount > 0
                ? `${currency}${selectedAmount.toFixed(2)}`
                : locale === 'it'
                  ? 'Nessuna spesa'
                  : 'No expenses'}
            </Text>
          </View>

          {selectedAmount > 0 && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleFilterLedger(selectedIsoDate)}
              accessibilityRole="button"
              accessibilityLabel={locale === 'it' ? 'Filtra nel ledger' : 'Filter ledger'}
              style={{
                paddingHorizontal: spacing.sm + 4,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: theme.colors.brand,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Filter size={14} color="#FFFFFF" strokeWidth={2.5} />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: typography.fontSizes.xs,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {locale === 'it' ? 'Filtra nel ledger' : 'Filter ledger'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setSelectedDay(null)}
            accessibilityRole="button"
            accessibilityLabel={t.common.close}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              padding: spacing.xxs,
            }}
          >
            <X size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: spacing.md,
          gap: spacing.xs,
        }}
      >
        <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{t.analytics.less}</Text>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: radius.xs,
            backgroundColor: theme.colors.surfaceSubtle,
          }}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: radius.xs,
            backgroundColor: hexToRgba(theme.colors.brand, 0.2),
          }}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: radius.xs,
            backgroundColor: hexToRgba(theme.colors.brand, 0.45),
          }}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: radius.xs,
            backgroundColor: hexToRgba(theme.colors.brand, 0.7),
          }}
        />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: radius.xs,
            backgroundColor: theme.colors.brand,
          }}
        />
        <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>{t.analytics.more}</Text>
      </View>
    </Card>
  );
};
