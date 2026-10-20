import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, TABULAR_NUMS } from '@/theme';
import { useI18n } from '@/i18n';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { FamilyMember } from '@/types';

export interface MemberContribution {
  member: FamilyMember;
  total: number;
  percentage: number;
}

export interface MemberLedgerCardProps {
  memberContributions: MemberContribution[];
  currentMemberId?: string;
  currency: string;
  onNavigateToFamily: () => void;
  onFilterByMember: (memberId: string) => void;
}

export const MemberLedgerCard: React.FC<MemberLedgerCardProps> = ({
  memberContributions,
  currentMemberId,
  currency,
  onNavigateToFamily,
  onFilterByMember,
}) => {
  const { theme, spacing, radius, typography } = useTheme();
  const { t } = useI18n();

  if (memberContributions.length === 0) {
    return null;
  }

  return (
    <Card
      padding="none"
      style={{
        marginBottom: spacing.lg,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.isDark ? theme.colors.surfaceSubtle : theme.colors.surfaceElevated,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <View>
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontSize: typography.fontSizes.md,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {t.dashboard.whoPaidWhat}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
              marginTop: 1,
            }}
          >
            {t.dashboard.familyMembers} ({memberContributions.length})
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNavigateToFamily}
          accessibilityRole="button"
          accessibilityLabel={t.tabs.family}
          style={{
            minHeight: 40,
            paddingHorizontal: spacing.sm + 2,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: theme.colors.brand,
              fontSize: typography.fontSizes.sm,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {t.tabs.family}
          </Text>
        </TouchableOpacity>
      </View>

      {memberContributions.map((mc, index) => {
        const memberColor = mc.member.color_code || theme.colors.brand;
        const isCurrentUser = mc.member.id === currentMemberId;
        return (
          <TouchableOpacity
            key={mc.member.id}
            activeOpacity={0.7}
            onPress={() => onFilterByMember(mc.member.id)}
            accessibilityRole="button"
            accessibilityLabel={`${mc.member.display_name}, ${currency}${mc.total.toFixed(2)}, ${mc.percentage.toFixed(0)}% ${t.dashboard.ofTotal}`}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              minHeight: 64,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                flex: 1,
                minWidth: 0,
                marginRight: spacing.sm,
              }}
            >
              <Avatar
                name={mc.member.display_name}
                avatarUrl={mc.member.avatar_url}
                colorCode={memberColor}
                size="md"
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                    gap: spacing.xs,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.xs,
                      flexShrink: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontSize: typography.fontSizes.md,
                        fontWeight: typography.fontWeights.bold,
                      }}
                      numberOfLines={1}
                    >
                      {mc.member.display_name}
                    </Text>
                    {isCurrentUser && (
                      <View
                        style={{
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                          borderRadius: radius.xs,
                          backgroundColor: theme.colors.brandLight,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.brand,
                            fontSize: 10,
                            fontWeight: typography.fontWeights.bold,
                            textTransform: 'uppercase',
                          }}
                        >
                          {t.family.currentUser}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      {
                        color: theme.colors.textSecondary,
                        fontSize: typography.fontSizes.xs,
                        fontWeight: typography.fontWeights.semibold,
                      },
                      TABULAR_NUMS,
                    ]}
                  >
                    {mc.percentage.toFixed(0)}% {t.dashboard.ofTotal}
                  </Text>
                </View>

                {/* Tactile Share Bar */}
                <View
                  style={{
                    height: 6,
                    backgroundColor: theme.colors.surfaceSubtle,
                    borderRadius: radius.xs,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${Math.min(mc.percentage, 100)}%`,
                      backgroundColor: memberColor,
                      borderRadius: radius.xs,
                    }}
                  />
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                flexShrink: 0,
                marginLeft: spacing.xs,
              }}
            >
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
              >
                {currency}
                {mc.total.toFixed(2)}
              </Text>
              <ChevronRight size={18} color={theme.colors.textMuted} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        );
      })}
    </Card>
  );
};
