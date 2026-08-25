import { useMemo } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ApiError } from '@/src/core/api';
import { asHref, ROUTES } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useTenants } from '@/src/features/tenants/hooks/useTenants';
import {
  subscriptionStatuses,
  type SubscriptionStatus,
  type TenantManagementResponse,
} from '@/src/features/tenants/types/tenant';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppDivider,
  type AppIconName,
  AppMetricCard,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';

const EXPIRING_WINDOW_DAYS = 30;
const statusIcons = {
  free: 'gift-outline',
  trial: 'flask-outline',
  active: 'checkmark-circle-outline',
  pastDue: 'time-outline',
  suspended: 'pause-circle-outline',
  expired: 'hourglass-outline',
  cancelled: 'close-circle-outline',
} as const satisfies Record<SubscriptionStatus, AppIconName>;

export function TenantDashboardScreen() {
  const { t, i18n } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const tenantsQuery = useTenants();
  const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);
  const summary = useMemo(() => summarizeTenants(tenants), [tenants]);
  const compact = width < 620;

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void tenantsQuery.refetch()}
          refreshing={tenantsQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      }>
      <View style={[styles.heading, { direction }]}>
        <View style={styles.headingText}>
          <AppText variant="title">{t('superAdminDashboard.title')}</AppText>
          <AppText color="muted" variant="bodySmall">
            {t('superAdminDashboard.subtitle')}
          </AppText>
        </View>
      </View>

      <View
        accessibilityRole="toolbar"
        style={[
          styles.headerActions,
          compact && styles.compactHeaderActions,
          { direction },
        ]}>
        <AppButton
          icon="earth-outline"
          onPress={() => router.push(asHref(ROUTES.basicData.geographicalInformation))}
          style={[styles.headerAction, compact && styles.compactHeaderAction]}
          variant="outline">
          {t('superAdminDashboard.manageGlobalGeography')}
        </AppButton>
        <AppButton
          icon="business-outline"
          onPress={() => router.push(asHref(ROUTES.tenantManagement))}
          style={[styles.headerAction, compact && styles.compactHeaderAction]}>
          {t('superAdminDashboard.manageTenants')}
        </AppButton>
      </View>

      {tenantsQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : tenantsQuery.isError ? (
        <AppStateView
          message={getErrorMessage(tenantsQuery.error, t('feedback.unknownError'))}
          onRetry={() => void tenantsQuery.refetch()}
          state="error"
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.metricGrid}>
            <AppMetricCard
              color={theme.colors.primary}
              icon="business-outline"
              label={t('superAdminDashboard.totalTenants')}
              style={{ width: compact ? '100%' : '31.6%' }}
              value={summary.totalTenants}
            />
            <AppMetricCard
              color={theme.colors.success}
              icon="checkmark-circle-outline"
              label={t('superAdminDashboard.enabledTenants')}
              style={{ width: compact ? '100%' : '31.6%' }}
              value={summary.enabledTenants}
            />
            <AppMetricCard
              color={theme.colors.secondary}
              icon="shield-checkmark-outline"
              label={t('superAdminDashboard.totalAdmins')}
              style={{ width: compact ? '100%' : '31.6%' }}
              value={summary.admins}
            />
            <AppMetricCard
              color={theme.colors.primary}
              icon="people-outline"
              label={t('superAdminDashboard.totalUsers')}
              style={{ width: compact ? '100%' : '31.6%' }}
              value={summary.users}
            />
            <AppMetricCard
              color={theme.colors.accent}
              icon="briefcase-outline"
              label={t('superAdminDashboard.totalCompanies')}
              style={{ width: compact ? '100%' : '31.6%' }}
              value={summary.companies}
            />
            <AppMetricCard
              color={theme.colors.warning}
              icon="calendar-outline"
              label={t('superAdminDashboard.expiringSoon')}
              style={{ width: compact ? '100%' : '31.6%' }}
              value={summary.expiringSoon.length}
            />
          </View>

          <View style={[styles.twoColumnGrid, compact && styles.singleColumnGrid]}>
            <AppCard style={[styles.sectionCard, compact ? styles.fullCard : styles.halfCard]}>
              <AppText variant="titleSmall">{t('superAdminDashboard.accountCapacity')}</AppText>
              <CapacityRow
                label={t('tenantManagement.admins')}
                limit={summary.maxAdmins}
                used={summary.admins}
              />
              <CapacityRow
                label={t('tenantManagement.users')}
                limit={summary.maxUsers}
                used={summary.users}
              />
            </AppCard>

            <AppCard style={[styles.sectionCard, compact ? styles.fullCard : styles.halfCard]}>
              <AppText variant="titleSmall">
                {t('superAdminDashboard.subscriptionOverview')}
              </AppText>
              <View style={styles.statusList}>
                {subscriptionStatuses.map((status, index) => (
                  <View key={status}>
                    <View style={[styles.statusRow, { direction }]}>
                      <TenantStatusBadge status={status} />
                      <AppText variant="label" weight="800">
                        {summary.statusCounts[status]}
                      </AppText>
                    </View>
                    {index < subscriptionStatuses.length - 1 ? <AppDivider /> : null}
                  </View>
                ))}
              </View>
            </AppCard>
          </View>

          <View style={[styles.twoColumnGrid, compact && styles.singleColumnGrid]}>
            <AppCard style={[styles.sectionCard, compact ? styles.fullCard : styles.halfCard]}>
              <AppText variant="titleSmall">
                {t('superAdminDashboard.expiringSubscriptions')}
              </AppText>
              {summary.expiringSoon.length ? (
                <View style={styles.tenantList}>
                  {summary.expiringSoon.slice(0, 5).map((tenant, index) => (
                    <View key={tenant.id}>
                      <View style={[styles.tenantRow, { direction }]}>
                        <View style={styles.tenantText}>
                          <AppText numberOfLines={1} variant="label">{tenant.name}</AppText>
                          <AppText color="muted" numberOfLines={1} variant="caption">
                            {tenant.planName || t('tenantManagement.noPlan')}
                          </AppText>
                        </View>
                        <View style={styles.endDate}>
                          <AppText
                            align={direction === 'rtl' ? 'left' : 'right'}
                            color="warning"
                            variant="caption"
                            weight="700">
                            {t('superAdminDashboard.daysRemaining', {
                              count: getDaysUntil(tenant.subscriptionEndsOn),
                            })}
                          </AppText>
                          <AppText
                            align={direction === 'rtl' ? 'left' : 'right'}
                            color="muted"
                            variant="caption">
                            {formatDate(tenant.subscriptionEndsOn, i18n.language)}
                          </AppText>
                        </View>
                      </View>
                      {index < Math.min(summary.expiringSoon.length, 5) - 1 ? (
                        <AppDivider />
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : (
                <AppAlert severity="success">
                  {t('superAdminDashboard.noExpiringSubscriptions')}
                </AppAlert>
              )}
            </AppCard>

            <AppCard style={[styles.sectionCard, compact ? styles.fullCard : styles.halfCard]}>
              <AppText variant="titleSmall">{t('superAdminDashboard.recentTenants')}</AppText>
              {summary.recentTenants.length ? (
                <View style={styles.tenantList}>
                  {summary.recentTenants.map((tenant, index) => (
                    <View key={tenant.id}>
                      <View style={[styles.tenantRow, { direction }]}>
                        <View style={styles.tenantText}>
                          <AppText numberOfLines={1} variant="label">{tenant.name}</AppText>
                          <AppText color="muted" numberOfLines={1} variant="caption">
                            {tenant.identifier}
                          </AppText>
                        </View>
                        <TenantStatusBadge status={tenant.subscriptionStatus} />
                      </View>
                      {index < summary.recentTenants.length - 1 ? <AppDivider /> : null}
                    </View>
                  ))}
                </View>
              ) : (
                <AppText color="muted" style={styles.emptyText} variant="bodySmall">
                  {t('superAdminDashboard.noTenants')}
                </AppText>
              )}
            </AppCard>
          </View>
        </View>
      )}
    </AppScreen>
  );
}

function CapacityRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const fillColor = percent >= 90 ? theme.colors.warning : theme.colors.primary;

  return (
    <View style={styles.capacityRow}>
      <View style={[styles.capacityLabels, { direction }]}>
        <AppText variant="label">{label}</AppText>
        <AppText color="muted" variant="caption">
          {t('superAdminDashboard.seatsUsed', { used, limit })}
        </AppText>
      </View>
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.full },
        ]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: fillColor,
              borderRadius: theme.radius.full,
              width: `${percent}%` as `${number}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

function TenantStatusBadge({ status }: { status: SubscriptionStatus }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const color = getStatusColor(status, theme.colors);

  return (
    <AppStatusBadge
      color={color}
      icon={statusIcons[status]}
      label={t(`tenantManagement.statuses.${status}`)}
    />
  );
}

function summarizeTenants(tenants: TenantManagementResponse[]) {
  const now = Date.now();
  const expiringThreshold = now + EXPIRING_WINDOW_DAYS * 86_400_000;
  const statusCounts = Object.fromEntries(
    subscriptionStatuses.map((status) => [status, 0]),
  ) as Record<SubscriptionStatus, number>;

  for (const tenant of tenants) statusCounts[tenant.subscriptionStatus] += 1;

  return {
    totalTenants: tenants.length,
    enabledTenants: tenants.filter((tenant) => tenant.isActive).length,
    admins: tenants.reduce((total, tenant) => total + tenant.adminCount, 0),
    users: tenants.reduce((total, tenant) => total + tenant.userCount, 0),
    companies: tenants.reduce((total, tenant) => total + tenant.companyCount, 0),
    maxAdmins: tenants.reduce((total, tenant) => total + tenant.maxAdmins, 0),
    maxUsers: tenants.reduce((total, tenant) => total + tenant.maxUsers, 0),
    statusCounts,
    expiringSoon: tenants
      .filter((tenant) => {
        if (!tenant.subscriptionEndsOn) return false;
        const endsOn = new Date(tenant.subscriptionEndsOn).getTime();
        return endsOn >= now && endsOn <= expiringThreshold;
      })
      .sort((left, right) =>
        new Date(left.subscriptionEndsOn!).getTime() - new Date(right.subscriptionEndsOn!).getTime()
      ),
    recentTenants: [...tenants]
      .sort((left, right) =>
        new Date(right.createdOn).getTime() - new Date(left.createdOn).getTime()
      )
      .slice(0, 5),
  };
}

function getDaysUntil(value: string | null): number {
  if (!value) return 0;
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));
}

function formatDate(value: string | null, locale: string): string {
  if (!value) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

function getStatusColor(
  status: SubscriptionStatus,
  colors: {
    textMuted: string;
    success: string;
    secondary: string;
    warning: string;
    danger: string;
  },
): string {
  if (status === 'active') return colors.success;
  if (status === 'trial') return colors.secondary;
  if (status === 'pastDue') return colors.warning;
  if (status === 'suspended' || status === 'expired' || status === 'cancelled') {
    return colors.danger;
  }
  return colors.textMuted;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  headingText: {
    flex: 1,
    minWidth: 220,
    gap: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginBottom: 20,
    width: '100%',
  },
  compactHeaderActions: {
    flexDirection: 'column',
  },
  headerAction: {
    flex: 1,
  },
  compactHeaderAction: {
    flex: 0,
    width: '100%',
  },
  content: {
    gap: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  singleColumnGrid: {
    flexDirection: 'column',
  },
  sectionCard: {
    gap: 18,
  },
  halfCard: {
    flex: 1,
    minWidth: 0,
  },
  fullCard: {
    width: '100%',
  },
  capacityRow: {
    gap: 8,
  },
  capacityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  statusList: {
    marginTop: -4,
  },
  statusRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tenantList: {
    marginTop: -4,
  },
  tenantRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  tenantText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  endDate: {
    maxWidth: 150,
    gap: 1,
  },
  emptyText: {
    paddingVertical: 8,
  },
});
