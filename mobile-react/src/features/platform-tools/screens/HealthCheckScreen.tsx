import { useMemo } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { useHealthCheck } from '@/src/features/platform-tools/hooks/usePlatformTools';
import type {
  HealthCheckEntry,
  HealthStatus,
} from '@/src/features/platform-tools/types/platform-tools';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppDataTable,
  type AppDataTableColumn,
  AppMetricCard,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';

export function HealthCheckScreen() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const healthQuery = useHealthCheck();
  const columns = useMemo<AppDataTableColumn<HealthCheckEntry>[]>(() => [
    {
      id: 'name',
      header: t('platformTools.health.name'),
      width: 220,
      render: (entry) => <AppText variant="bodySmall">{entry.name}</AppText>,
      sortValue: (entry) => entry.name,
    },
    {
      id: 'status',
      header: t('platformTools.health.status'),
      width: 150,
      align: 'center',
      render: (entry) => (
        <AppStatusBadge
          color={getStatusColor(entry.status, theme.colors)}
          icon={entry.status === 'Healthy' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
          label={t(`platformTools.health.${entry.status.toLowerCase()}`)}
        />
      ),
      sortValue: (entry) => entry.status,
    },
    {
      id: 'duration',
      header: t('platformTools.health.duration'),
      width: 160,
      render: (entry) => <AppText variant="bodySmall">{entry.duration || '—'}</AppText>,
      sortValue: (entry) => entry.duration,
    },
    {
      id: 'description',
      header: t('platformTools.health.description'),
      width: 320,
      render: (entry) => <AppText color="muted" numberOfLines={4} variant="bodySmall">{entry.description || '—'}</AppText>,
      sortValue: (entry) => entry.description,
    },
  ], [t, theme.colors]);
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
          <View style={styles.metrics}>
            <AppMetricCard
              color={getStatusColor(report.status, theme.colors)}
              icon="pulse-outline"
              label={t('platformTools.health.overallStatus')}
              value={t(`platformTools.health.${report.status.toLowerCase()}`)}
            />
            <AppMetricCard
              icon="timer-outline"
              label={t('platformTools.health.totalDuration')}
              value={report.totalDuration || '—'}
            />
            <AppMetricCard
              icon="server-outline"
              label={t('platformTools.health.dependencies')}
              value={report.entries.length}
            />
          </View>
          <AppDataTable
            columns={columns}
            emptyMessage={t('platformTools.health.empty')}
            getRowKey={(entry) => entry.name}
            rows={report.entries}
          />
        </View>
      )}
    </AppScreen>
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

const styles = StyleSheet.create({
  content: { gap: 16 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
