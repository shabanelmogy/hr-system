import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { ManagedUser } from '../../types/administration';
import { AppCard, AppIcon, AppText } from '@/src/shared/components';

interface UserManagementStatsProps {
  users: readonly ManagedUser[];
  layout?: 'horizontal' | 'vertical';
}

export function UserManagementStats({ users, layout = 'horizontal' }: UserManagementStatsProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const stats = useMemo(() => {
    const completedProfiles = users.filter((user) =>
      Boolean(
        user.firstName &&
        user.lastName &&
        user.userName &&
        user.email &&
        user.roles.length > 0,
      )
    ).length;

    return {
      total: users.length,
      active: users.filter((user) => !user.isDisabled).length,
      disabled: users.filter((user) => user.isDisabled).length,
      locked: users.filter((user) => user.isLocked).length,
      admins: users.filter((user) =>
        user.roles.some((role) => role.toLowerCase().includes('admin'))
      ).length,
      completion: users.length === 0
        ? 0
        : Math.round((completedProfiles / users.length) * 100),
    };
  }, [users]);

  const cards = [
    {
      key: 'total',
      icon: 'people-outline' as const,
      label: t('userManagement.dashboard.totalUsers'),
      value: stats.total,
      color: theme.colors.primary,
    },
    {
      key: 'active',
      icon: 'checkmark-circle-outline' as const,
      label: t('userManagement.dashboard.activeUsers'),
      value: stats.active,
      color: theme.colors.success,
    },
    {
      key: 'disabled',
      icon: 'pause-circle-outline' as const,
      label: t('userManagement.dashboard.disabledUsers'),
      value: stats.disabled,
      color: theme.colors.warning,
    },
    {
      key: 'locked',
      icon: 'lock-closed-outline' as const,
      label: t('userManagement.dashboard.lockedUsers'),
      value: stats.locked,
      color: theme.colors.danger,
    },
    {
      key: 'admins',
      icon: 'shield-checkmark-outline' as const,
      label: t('userManagement.dashboard.adminUsers'),
      value: stats.admins,
      color: theme.colors.accent,
    },
    {
      key: 'completion',
      icon: 'speedometer-outline' as const,
      label: t('userManagement.dashboard.profileCompletion'),
      value: `${stats.completion}%`,
      color: stats.completion >= 80
        ? theme.colors.success
        : stats.completion >= 50
          ? theme.colors.warning
          : theme.colors.danger,
    },
  ];

  if (layout === 'vertical') {
    return (
      <View style={[styles.verticalContent, { direction }]}>
        {cards.map((card) => (
          <AppCard key={card.key} style={styles.verticalCard} variant="filled">
            <View style={[styles.verticalCardContent, { direction }]}>
              <View
                style={[
                  styles.verticalIcon,
                  { backgroundColor: `${card.color}1A`, borderRadius: theme.radius.md },
                ]}>
                <AppIcon color={card.color} name={card.icon} size={22} />
              </View>
              <View style={styles.verticalCardText}>
                <AppText color="muted" variant="bodySmall">{card.label}</AppText>
                <AppText variant="titleSmall" weight="800">{card.value}</AppText>
              </View>
            </View>
          </AppCard>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { direction }]}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {cards.map((card) => (
        <AppCard key={card.key} padding="none" style={styles.card} variant="filled">
          <View style={[styles.cardContent, { direction }]}>
            <View
              style={[
                styles.icon,
                { backgroundColor: `${card.color}1A`, borderRadius: theme.radius.sm },
              ]}>
              <AppIcon color={card.color} name={card.icon} size={16} />
            </View>
            <View style={styles.cardText}>
              <AppText numberOfLines={1} style={styles.value} variant="label" weight="800">
                {card.value}
              </AppText>
              <AppText
                color="muted"
                numberOfLines={1}
                style={styles.label}
                variant="caption">
                {card.label}
              </AppText>
            </View>
          </View>
        </AppCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', gap: 4 },
  card: {
    width: 120,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  icon: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, minWidth: 0 },
  value: { fontSize: 16, lineHeight: 19 },
  label: { fontSize: 11, lineHeight: 14 },
  verticalContent: { gap: 10, width: '100%' },
  verticalCard: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  verticalCardContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  verticalIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  verticalCardText: { flex: 1, minWidth: 0, gap: 2 },
});
