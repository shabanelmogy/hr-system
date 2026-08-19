import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useHealthCheck } from '@/src/features/platform-tools/hooks/usePlatformTools';
import type {
  HealthCheckEntry,
  HealthStatus,
} from '@/src/features/platform-tools/types/platform-tools';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppCard,
  AppDivider,
  AppIcon,
  type AppIconName,
  AppMetricCard,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';

export function HealthCheckScreen() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const healthQuery = useHealthCheck();
  const report = healthQuery.data;

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void healthQuery.refetch()}
          refreshing={healthQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        subtitle={t('platformTools.healthCheckDescription')}
        title={t('navigation.healthCheck')}
      />
      {healthQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : healthQuery.error || !report ? (
        <AppStateView
          message={getPlatformToolErrorMessage(healthQuery.error, t('states.errorMessage'))}
          onRetry={() => void healthQuery.refetch()}
          state="error"
        />
      ) : (
        <View style={styles.content}>
          <View style={[styles.metrics, { direction }]}>
            <AppMetricCard
              color={getStatusColor(report.status, theme.colors)}
              icon="pulse-outline"
              label={t('platformTools.health.overallStatus')}
              padding="sm"
              style={styles.metricCard}
              value={t(`platformTools.health.${report.status.toLowerCase()}`)}
            />
            <AppMetricCard
              icon="timer-outline"
              label={t('platformTools.health.totalDuration')}
              padding="sm"
              style={styles.metricCard}
              value={report.totalDuration || '—'}
            />
          </View>
          <View style={styles.section}>
            <View style={[styles.sectionTitle, { direction }]}>
              <AppIcon color={theme.colors.primary} name="server-outline" size={22} />
              <AppText variant="titleSmall">{t('platformTools.health.dependencies')}</AppText>
            </View>
            {report.entries.length === 0 ? (
              <AppStateView message={t('platformTools.health.empty')} state="empty" />
            ) : (
              <View style={[styles.dependencies, { direction }]}>
                {report.entries.map((entry) => (
                  <HealthDependencyCard entry={entry} key={entry.name} />
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </AppScreen>
  );
}

function HealthDependencyCard({ entry }: { entry: HealthCheckEntry }) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const statusColor = getStatusColor(entry.status, theme.colors);

  return (
    <AppCard padding="sm" style={styles.dependencyCard} variant="elevated">
      <View style={[styles.dependencyHeader, { direction }]}>
        <View
          style={[
            styles.dependencyIcon,
            { backgroundColor: `${statusColor}1A`, borderRadius: theme.radius.md },
          ]}>
          <AppIcon color={statusColor} name="server-outline" size={23} />
        </View>
        <AppText numberOfLines={2} style={styles.dependencyName} variant="titleSmall">
          {entry.name}
        </AppText>
        <AppStatusBadge
          color={statusColor}
          icon={getStatusIcon(entry.status)}
          label={t(`platformTools.health.${entry.status.toLowerCase()}`)}
        />
      </View>

      <AppDivider />
      <HealthDetailRow
        icon="timer-outline"
        label={t('platformTools.health.duration')}
        value={entry.duration || '—'}
      />
      <HealthDetailRow
        icon="information-circle-outline"
        label={t('platformTools.health.description')}
        value={entry.description || '—'}
      />
    </AppCard>
  );
}

function HealthDetailRow({
  icon,
  label,
  value,
}: {
  icon: AppIconName;
  label: string;
  value: string;
}) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.detailRow, { direction }]}>
      <View
        style={[
          styles.detailIcon,
          { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
        ]}>
        <AppIcon color={theme.colors.primary} name={icon} size={16} />
      </View>
      <View style={styles.detailText}>
        <AppText color="muted" variant="caption" weight="700">{label}</AppText>
        <AppText selectable variant="bodySmall">{value}</AppText>
      </View>
    </View>
  );
}

interface StatusColors {
  success: string;
  warning: string;
  danger: string;
  textMuted: string;
}

function getStatusColor(status: HealthStatus, colors: StatusColors): string {
  if (status === 'Healthy') return colors.success;
  if (status === 'Degraded') return colors.warning;
  if (status === 'Unhealthy') return colors.danger;
  return colors.textMuted;
}

function getStatusIcon(status: HealthStatus): AppIconName {
  if (status === 'Healthy') return 'checkmark-circle-outline';
  if (status === 'Degraded') return 'warning-outline';
  if (status === 'Unhealthy') return 'close-circle-outline';
  return 'help-circle-outline';
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { minWidth: 135, minHeight: 88, flexBasis: 135, gap: 6 },
  section: { gap: 10 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dependencies: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dependencyCard: { minWidth: 280, flexGrow: 1, flexBasis: 300, gap: 10 },
  dependencyHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  dependencyIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  dependencyName: { flex: 1, minWidth: 120 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  detailText: { flex: 1, minWidth: 0, gap: 2 },
});
