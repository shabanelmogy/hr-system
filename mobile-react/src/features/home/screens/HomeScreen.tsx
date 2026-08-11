import { router } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth, useCanAccessRoute } from '@/src/features/auth';
import {
  AppCard,
  AppDivider,
  AppIcon,
  type AppIconName,
  AppScreen,
  AppText,
} from '@/src/shared/components';

interface Metric {
  key: 'employees' | 'presentToday' | 'openPositions' | 'pendingRequests';
  value: string;
  icon: AppIconName;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

const metrics: Metric[] = [
  { key: 'employees', value: '1,284', icon: 'people-outline', color: 'primary' },
  { key: 'presentToday', value: '1,106', icon: 'checkmark-circle-outline', color: 'success' },
  { key: 'openPositions', value: '46', icon: 'briefcase-outline', color: 'secondary' },
  { key: 'pendingRequests', value: '18', icon: 'hourglass-outline', color: 'warning' },
];

const quickActions: { key: 'addEmployee' | 'leaveRequest' | 'attendance' | 'approvals'; icon: AppIconName }[] = [
  { key: 'addEmployee', icon: 'person-add-outline' },
  { key: 'leaveRequest', icon: 'calendar-outline' },
  { key: 'attendance', icon: 'time-outline' },
  { key: 'approvals', icon: 'checkmark-done-outline' },
];

const activities: { key: 'activityEmployee' | 'activityLeave' | 'activityPayroll'; time: string; icon: AppIconName }[] = [
  { key: 'activityEmployee', time: 'now', icon: 'person-add-outline' },
  { key: 'activityLeave', time: 'minutesAgo', icon: 'calendar-outline' },
  { key: 'activityPayroll', time: 'hoursAgo', icon: 'wallet-outline' },
];

export function HomeScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { theme } = useAppTheme();
  const { direction, isRTL } = useLocalization();
  const { session } = useAuth();
  const compact = width < 560;
  const canViewBasicData = useCanAccessRoute(ROUTES.basicData.root);
  const canManageTenants = useCanAccessRoute(ROUTES.tenantManagement);
  const userDisplayName =
    [session?.firstName, session?.lastName].filter(Boolean).join(' ') ||
    session?.userName ||
    '';
  const userInitials =
    userDisplayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'U';

  const metricColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
  };

  return (
    <AppScreen edges={['left', 'right']}>
      <View style={[styles.header, { direction }]}>
        <View style={styles.headerText}>
          <AppText color="muted" variant="bodySmall">
            {t('home.greeting')}
          </AppText>
          <AppText variant="title">{t('home.title')}</AppText>
          <AppText color="muted" variant="bodySmall">
            {t('home.subtitle')}
          </AppText>
        </View>
        <View
          accessibilityLabel={userDisplayName}
          style={[
            styles.avatar,
            { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full },
          ]}>
          <AppText align="center" style={{ color: theme.colors.onPrimary }} variant="label">
            {userInitials}
          </AppText>
        </View>
      </View>

      <View style={[styles.metricGrid, { gap: theme.spacing.md }]}>
        {metrics.map((metric) => (
          <AppCard
            key={metric.key}
            style={[styles.metricCard, { width: compact ? '100%' : '48.8%' }]}>
            <View style={[styles.metricTop, { direction }]}>
              <View
                style={[
                  styles.metricIcon,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.radius.sm,
                  },
                ]}>
                <AppIcon color={metricColor[metric.color]} name={metric.icon} size={22} />
              </View>
              <AppText color="muted" variant="bodySmall">
                {t(`home.${metric.key}`)}
              </AppText>
            </View>
            <AppText variant="display">{metric.value}</AppText>
          </AppCard>
        ))}
      </View>

      {canViewBasicData || canManageTenants ? (
        <View style={styles.section}>
          <AppText variant="titleSmall">{t('home.modules')}</AppText>
          {canManageTenants ? (
            <AppCard
              accessibilityLabel={t('navigation.tenantManagement')}
              onPress={() => router.push(asHref(ROUTES.tenantManagement))}
              style={styles.moduleCard}>
              <View style={[styles.moduleRow, { direction }]}>
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
                  ]}>
                  <AppIcon color={theme.colors.accent} name="business-outline" size={25} />
                </View>
                <View style={styles.activityText}>
                  <AppText variant="label">{t('navigation.tenantManagement')}</AppText>
                  <AppText color="muted" variant="bodySmall">
                    {t('tenantManagement.description')}
                  </AppText>
                </View>
                <AppIcon
                  color={theme.colors.textMuted}
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={20}
                />
              </View>
            </AppCard>
          ) : null}
          {canViewBasicData ? (
            <AppCard
              accessibilityLabel={t('navigation.basicData')}
              onPress={() => router.push(asHref(ROUTES.basicData.root))}
              style={styles.moduleCard}>
              <View style={[styles.moduleRow, { direction }]}>
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
                  ]}>
                  <AppIcon color={theme.colors.primary} name="server-outline" size={25} />
                </View>
                <View style={styles.activityText}>
                  <AppText variant="label">{t('navigation.basicData')}</AppText>
                  <AppText color="muted" variant="bodySmall">
                    {t('home.basicDataDescription')}
                  </AppText>
                </View>
                <AppIcon
                  color={theme.colors.textMuted}
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={20}
                />
              </View>
            </AppCard>
          ) : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <AppText variant="titleSmall">{t('home.quickActions')}</AppText>
        <View style={[styles.actions, { direction }]}>
          {quickActions.map((action) => (
            <Pressable
              accessibilityRole="button"
              key={action.key}
              style={({ pressed }) => [
                styles.action,
                {
                  backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                },
              ]}>
              <AppIcon color={theme.colors.primary} name={action.icon} size={24} />
              <AppText align="center" variant="bodySmall" weight="600">
                {t(`home.${action.key}`)}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="titleSmall">{t('home.recentActivity')}</AppText>
        <AppCard style={styles.activityCard}>
          {activities.map((activity, index) => (
            <View key={activity.key}>
              <View style={[styles.activityRow, { direction }]}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
                  ]}>
                  <AppIcon color={theme.colors.secondary} name={activity.icon} size={19} />
                </View>
                <View style={styles.activityText}>
                  <AppText variant="bodySmall" weight="600">
                    {t(`home.${activity.key}`)}
                  </AppText>
                  <AppText color="muted" variant="caption">
                    {activity.time === 'minutesAgo'
                      ? t('home.minutesAgo', { count: 12 })
                      : activity.time === 'hoursAgo'
                        ? t('home.hoursAgo', { count: 2 })
                        : t('home.now')}
                  </AppText>
                </View>
                <AppIcon
                  color={theme.colors.textMuted}
                  name={isRTL ? 'chevron-back' : 'chevron-forward'}
                  size={18}
                />
              </View>
              {index < activities.length - 1 ? <AppDivider /> : null}
            </View>
          ))}
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    minHeight: 128,
    justifyContent: 'space-between',
    gap: 12,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 12,
    marginTop: 28,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  action: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: 88,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  activityCard: {
    paddingVertical: 4,
  },
  activityRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  activityIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
    gap: 2,
  },
  moduleCard: {
    minHeight: 100,
    justifyContent: 'center',
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
