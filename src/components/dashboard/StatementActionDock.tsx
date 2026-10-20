import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, FileJson } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useI18n } from '@/i18n';

export interface StatementActionDockProps {
  onQuickAdd: () => void;
  onImport: () => void;
}

export const StatementActionDock: React.FC<StatementActionDockProps> = ({
  onQuickAdd,
  onImport,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  return (
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
  );
};
