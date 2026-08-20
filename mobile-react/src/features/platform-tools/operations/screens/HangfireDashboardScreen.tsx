import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { secureSession } from '@/src/core/storage/secure-storage';
import { operationsApi } from '@/src/features/platform-tools/operations/api';
import { useBackgroundJobs } from '@/src/features/platform-tools/operations/hooks';
import { formatPlatformDate, getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppButton,
  AppCard,
  AppIcon,
  type AppIconName,
  AppModal,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
} from '@/src/shared/components';

export function HangfireDashboardScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const jobsQuery = useBackgroundJobs();
  const dashboardUrl = operationsApi.getHangfireUrl();
  const webViewRef = useRef<WebView>(null);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(false);
  const [dashboardToken, setDashboardToken] = useState<string | null>(null);
  const dashboard = jobsQuery.data;
  const dashboardSource = useMemo(
    () => dashboardToken
      ? { headers: { Authorization: `Bearer ${dashboardToken}` }, uri: dashboardUrl }
      : { uri: dashboardUrl },
    [dashboardToken, dashboardUrl],
  );

  const openDashboard = async () => {
    setDashboardToken(await secureSession.getAccessToken());
    setDashboardError(false);
    setDashboardLoading(true);
    setDashboardVisible(true);
  };

  const retryDashboard = () => {
    setDashboardError(false);
    setDashboardLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={(
        <RefreshControl
          colors={[theme.colors.primary]}
          onRefresh={() => void jobsQuery.refetch()}
          refreshing={jobsQuery.isRefetching}
          tintColor={theme.colors.primary}
        />
      )}>
      <AppPageHeader
        subtitle={t('platformTools.hangfireDashboardDescription')}
        title={t('navigation.hangfireDashboard')}
      />
      {jobsQuery.isLoading ? (
        <AppStateView state="loading" />
      ) : jobsQuery.error || !dashboard ? (
        <AppStateView
          message={getPlatformToolErrorMessage(jobsQuery.error, t('states.errorMessage'))}
          onRetry={() => void jobsQuery.refetch()}
          state="error"
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.metrics}>
            <HangfireMetricCard
              icon="server-outline"
              label={t('platformTools.hangfire.servers')}
              value={dashboard.servers}
            />
            <HangfireMetricCard
              icon="list-outline"
              label={t('platformTools.hangfire.enqueued')}
              value={dashboard.enqueued}
            />
            <HangfireMetricCard
              icon="time-outline"
              label={t('platformTools.hangfire.scheduled')}
              value={dashboard.scheduled}
            />
            <HangfireMetricCard
              icon="sync-outline"
              label={t('platformTools.hangfire.processing')}
              value={dashboard.processing}
            />
            <HangfireMetricCard
              color={theme.colors.success}
              icon="checkmark-circle-outline"
              label={t('platformTools.hangfire.succeeded')}
              value={dashboard.succeeded}
            />
            <HangfireMetricCard
              color={theme.colors.danger}
              icon="alert-circle-outline"
              label={t('platformTools.hangfire.failed')}
              value={dashboard.failed}
            />
          </View>
          <AppText color="muted" variant="caption">
            {t('platformTools.hangfire.updatedAt', {
              date: formatPlatformDate(dashboard.generatedAt, i18n.language),
            })}
          </AppText>
          <AppButton icon="open-outline" onPress={() => void openDashboard()}>
            {t('platformTools.hangfire.open')}
          </AppButton>
        </View>
      )}
      <AppModal
        contentContainerStyle={styles.webViewContent}
        icon="server-outline"
        onClose={() => setDashboardVisible(false)}
        scrollable={false}
        title={t('platformTools.hangfire.open')}
        variant="fullScreen"
        visible={dashboardVisible}>
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            allowsBackForwardNavigationGestures
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            javaScriptEnabled
            onError={() => {
              setDashboardLoading(false);
              setDashboardError(true);
            }}
            onLoadEnd={() => setDashboardLoading(false)}
            onLoadStart={() => {
              setDashboardError(false);
              setDashboardLoading(true);
            }}
            sharedCookiesEnabled
            source={dashboardSource}
            style={styles.webView}
          />
          {dashboardLoading && !dashboardError ? (
            <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
              <AppText color="muted">{t('states.loading')}</AppText>
            </View>
          ) : null}
          {dashboardError ? (
            <View style={[styles.errorOverlay, { backgroundColor: theme.colors.background }]}>
              <AppStateView
                message={t('platformTools.apiEndpoints.webViewError')}
                onRetry={retryDashboard}
                state="error"
              />
            </View>
          ) : null}
        </View>
      </AppModal>
    </AppScreen>
  );
}

function HangfireMetricCard({
  color,
  icon,
  label,
  value,
}: {
  color?: string;
  icon: AppIconName;
  label: string;
  value: number;
}) {
  const { theme } = useAppTheme();
  const resolvedColor = color ?? theme.colors.primary;

  return (
    <AppCard padding="sm" style={styles.metricCard} variant="elevated">
      <View
        style={[
          styles.metricIcon,
          { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
        ]}>
        <AppIcon color={resolvedColor} name={icon} size={23} />
      </View>
      <AppText align="center" numberOfLines={2} style={styles.metricLabel} variant="caption" weight="700">
        {label}
      </AppText>
      <AppText align="center" variant="titleSmall" weight="800">{value}</AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    minWidth: 145,
    minHeight: 112,
    flexGrow: 1,
    flexBasis: 145,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  metricIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { minHeight: 32 },
  webViewContent: { flex: 1, padding: 0 },
  webViewContainer: { flex: 1, position: 'relative' },
  webView: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorOverlay: { ...StyleSheet.absoluteFillObject },
});
