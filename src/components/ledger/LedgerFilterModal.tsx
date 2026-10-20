import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Filter, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useI18n, getLocalizedCategoryName } from '@/i18n';
import { useAppStore } from '@/services/store';
import { Avatar } from '@/components/common/Avatar';
import { IconHelper } from '@/components/common/IconHelper';
import { FormModal } from '@/components/common/FormModal';
import { PeriodPreset, AmountBracket } from '@/types';

export interface LedgerFilterModalProps {
  visible: boolean;
  onClose: () => void;
  periodOptions: { key: PeriodPreset; label: string }[];
  amountOptions: { key: AmountBracket; label: string }[];
  activePeriodPreset: PeriodPreset;
  activeAmountBracket: AmountBracket;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const LedgerFilterModal: React.FC<LedgerFilterModalProps> = ({
  visible,
  onClose,
  periodOptions,
  amountOptions,
  activePeriodPreset,
  activeAmountBracket,
  hasActiveFilters,
  onResetFilters,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  const members = useAppStore((s) => s.members);
  const categories = useAppStore((s) => s.categories);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);

  return (
    <FormModal
      visible={visible}
      title={t.ledger.filtersTitle}
      icon={<Filter size={24} color={theme.colors.brand} strokeWidth={2.5} />}
      onClose={onClose}
      onSubmit={onClose}
      submitTitle={t.ledger.applyFilters}
      cancelTitle={t.common.close}
    >
      <View style={{ gap: spacing.xl, paddingVertical: spacing.xs }}>
        {/* Period Section */}
        <View>
          <Text
            style={{
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              color: theme.colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            {t.expenseDetail.date}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {periodOptions.map((opt) => {
              const isSelected = activePeriodPreset === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.75}
                  onPress={() => setFilters({ periodPreset: opt.key })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    minHeight: 48,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: isSelected
                      ? theme.colors.brand
                      : theme.isDark
                        ? theme.colors.surfaceContainerHigh
                        : theme.colors.surfaceSubtle,
                    borderWidth: 1.5,
                    borderColor: isSelected ? theme.colors.brand : theme.colors.borderTactile,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: typography.fontWeights.bold,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amount Bracket Section */}
        <View>
          <Text
            style={{
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              color: theme.colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            {t.addExpense.amountLabel}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {amountOptions.map((opt) => {
              const isSelected = activeAmountBracket === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.75}
                  onPress={() => setFilters({ amountBracket: opt.key })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    minHeight: 48,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: isSelected
                      ? theme.colors.brand
                      : theme.isDark
                        ? theme.colors.surfaceContainerHigh
                        : theme.colors.surfaceSubtle,
                    borderWidth: 1.5,
                    borderColor: isSelected ? theme.colors.brand : theme.colors.borderTactile,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? '#FFFFFF' : theme.colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: typography.fontWeights.bold,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filter by Member */}
        <View>
          <Text
            style={{
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              color: theme.colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            {t.ledger.filterByMember}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setFilters({ selectedMemberId: undefined })}
              accessibilityRole="button"
              accessibilityState={{ selected: !filters.selectedMemberId }}
              style={{
                minHeight: 50,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                backgroundColor: !filters.selectedMemberId
                  ? theme.colors.brand
                  : theme.isDark
                    ? theme.colors.surfaceContainerHigh
                    : theme.colors.surfaceSubtle,
                borderWidth: 1.5,
                borderColor: !filters.selectedMemberId
                  ? theme.colors.brand
                  : theme.colors.borderTactile,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: !filters.selectedMemberId ? '#FFFFFF' : theme.colors.textPrimary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {t.ledger.allMembers}
              </Text>
            </TouchableOpacity>

            {members.map((m) => {
              const isSelected = filters.selectedMemberId === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.75}
                  onPress={() => setFilters({ selectedMemberId: m.id })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    minHeight: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: isSelected
                      ? `${m.color_code}25`
                      : theme.isDark
                        ? theme.colors.surfaceContainerHigh
                        : theme.colors.surfaceSubtle,
                    borderWidth: 1.5,
                    borderColor: isSelected ? m.color_code : theme.colors.borderTactile,
                  }}
                >
                  <Avatar
                    name={m.display_name}
                    avatarUrl={m.avatar_url}
                    colorCode={m.color_code}
                    size="sm"
                  />
                  <Text
                    style={{
                      color: isSelected ? m.color_code : theme.colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: isSelected
                        ? typography.fontWeights.heavy
                        : typography.fontWeights.semibold,
                    }}
                  >
                    {m.display_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Filter by Category */}
        <View>
          <Text
            style={{
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
              color: theme.colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            {t.ledger.filterByCategory}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setFilters({ selectedCategoryId: undefined })}
              accessibilityRole="button"
              accessibilityState={{ selected: !filters.selectedCategoryId }}
              style={{
                minHeight: 50,
                paddingHorizontal: spacing.md,
                borderRadius: radius.md,
                backgroundColor: !filters.selectedCategoryId
                  ? theme.colors.brand
                  : theme.isDark
                    ? theme.colors.surfaceContainerHigh
                    : theme.colors.surfaceSubtle,
                borderWidth: 1.5,
                borderColor: !filters.selectedCategoryId
                  ? theme.colors.brand
                  : theme.colors.borderTactile,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: !filters.selectedCategoryId ? '#FFFFFF' : theme.colors.textPrimary,
                  fontSize: typography.fontSizes.sm,
                  fontWeight: typography.fontWeights.bold,
                }}
              >
                {t.ledger.allCategories}
              </Text>
            </TouchableOpacity>

            {categories.map((c) => {
              const isSelected = filters.selectedCategoryId === c.id;
              const catDisplayName = getLocalizedCategoryName(c, t);
              return (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.75}
                  onPress={() => setFilters({ selectedCategoryId: c.id })}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={{
                    minHeight: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: isSelected
                      ? `${c.color}25`
                      : theme.isDark
                        ? theme.colors.surfaceContainerHigh
                        : theme.colors.surfaceSubtle,
                    borderWidth: 1.5,
                    borderColor: isSelected ? c.color : theme.colors.borderTactile,
                  }}
                >
                  <IconHelper name={c.icon} size={18} color={c.color} />
                  <Text
                    style={{
                      color: isSelected ? c.color : theme.colors.textPrimary,
                      fontSize: typography.fontSizes.sm,
                      fontWeight: isSelected
                        ? typography.fontWeights.heavy
                        : typography.fontWeights.semibold,
                    }}
                  >
                    {catDisplayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reset All Button */}
        {hasActiveFilters && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              onResetFilters();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel={t.ledger.clearFilters}
            style={{
              minHeight: 50,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              backgroundColor: theme.colors.dangerBg,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: theme.colors.danger,
            }}
          >
            <RotateCcw size={18} color={theme.colors.danger} strokeWidth={2.5} />
            <Text
              style={{
                color: theme.colors.danger,
                fontSize: typography.fontSizes.md,
                fontWeight: typography.fontWeights.bold,
              }}
            >
              {t.ledger.clearFilters}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </FormModal>
  );
};
