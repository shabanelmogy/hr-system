import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';
import { useBackgroundJobs } from '@/src/features/platform-tools/hooks/usePlatformTools';
import { formatPlatformDate, getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import {
  AppAlert,
  AppButton,
  AppMetricCard,
  AppPageHeader,
  AppScreen,
  AppStateView,
  AppText,
  showToast,
} from '@/src/shared/components';

export function HangfireDashboardScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const jobsQuery = useBackgroundJobs();
  const [opening, setOpening] = useState(false);
  const dashboard = jobsQuery.data;

  const openDashboard = async () => {
    setOpening(true);
    try {
      await WebBrowser.openBrowserAsync(platformToolsApi.getHangfireUrl(), {
        showTitle: true,
        toolbarColor: theme.colors.surface,
      });
    } catch (error) {
      showToast.error(error, t('platformTools.hangfire.openFailed'));
    } finally {
      setOpening(false);
    }
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
            <AppMetricCard icon="server-outline" label={t('platformTools.hangfire.servers')} value={dashboard.servers} />
            <AppMetricCard icon="list-outline" label={t('platformTools.hangfire.enqueued')} value={dashboard.enqueued} />
            <AppMetricCard icon="time-outline" label={t('platformTools.hangfire.scheduled')} value={dashboard.scheduled} />
            <AppMetricCard icon="sync-outline" label={t('platformTools.hangfire.processing')} value={dashboard.processing} />
            <AppMetricCard color={theme.colors.success} icon="checkmark-circle-outline" label={t('platformTools.hangfire.succeeded')} value={dashboard.succeeded} />
            <AppMetricCard color={theme.colors.danger} icon="alert-circle-outline" label={t('platformTools.hangfire.failed')} value={dashboard.failed} />
          </View>
          <AppText color="muted" variant="caption">
            {t('platformTools.hangfire.updatedAt', {
              date: formatPlatformDate(dashboard.generatedAt, i18n.language),
            })}
          </AppText>
          <AppButton icon="open-outline" loading={opening} onPress={() => void openDashboard()}>
            {t('platformTools.hangfire.open')}
          </AppButton>
          <AppAlert severity="warning">{t('platformTools.hangfire.browserSessionNote')}</AppAlert>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
