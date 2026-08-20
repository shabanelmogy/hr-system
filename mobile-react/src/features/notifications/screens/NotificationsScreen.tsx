import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { asHref } from '@/src/core/constants/routes';
import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { NotificationRow } from '@/src/features/notifications/components/NotificationRow';
import {
  notificationFilterStatus,
  useNotificationActions,
  useNotificationPage,
  useUnreadNotificationCount,
} from '@/src/features/notifications/hooks/use-notifications';
import type { AppNotification, NotificationFilter } from '@/src/features/notifications/types/notification';
import { resolveNotificationActionRoute } from '@/src/features/notifications/utils/notification-presentation';
import {
  AppButton,
  AppCard,
  AppFilterButton,
  AppIconButton,
  AppPaginationNavigation,
  AppScreen,
  AppStateView,
  AppText,
  ConfirmationDialog,
  showErrorDialog,
} from '@/src/shared/components';

const PAGE_SIZE = 4;

export function NotificationsScreen() {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [pageNumber, setPageNumber] = useState(1);
  const [dismissTarget, setDismissTarget] = useState<AppNotification | 'all' | null>(null);
  const query = useMemo(() => ({
    pageNumber,
    pageSize: PAGE_SIZE,
    status: notificationFilterStatus(filter),
    columnName: 'CreatedOn' as const,
    sortDirection: 'DESC' as const,
  }), [filter, pageNumber]);
  const notificationsQuery = useNotificationPage(query);
  const unreadQuery = useUnreadNotificationCount();
  const actions = useNotificationActions();
  const notifications = notificationsQuery.data?.items ?? [];
  const metadata = notificationsQuery.data?.metaData;
  const mutationBusy = actions.markRead.isPending || actions.markUnread.isPending ||
    actions.markAllRead.isPending || actions.markAllUnread.isPending ||
    actions.dismiss.isPending || actions.dismissAll.isPending;
  const unreadCount = unreadQuery.data ?? 0;
  const emptyMessage = filter === 'unread'
    ? t('notifications.emptyUnread')
    : filter === 'read'
      ? t('notifications.emptyRead')
      : t('notifications.empty');
  const activeFilterLabel = filter === 'unread'
    ? t('notifications.unread')
    : filter === 'read'
      ? t('notifications.read')
      : t('notifications.all');

  const changeFilter = (nextFilter: NotificationFilter) => {
    setFilter(nextFilter);
    setPageNumber(1);
  };
  const refresh = () => Promise.all([notificationsQuery.refetch(), unreadQuery.refetch()]);
  const toggleRead = async (notification: AppNotification) => {
    if (mutationBusy) return;
    try {
      if (notification.readOn) await actions.markUnread.mutateAsync(notification.id);
      else await actions.markRead.mutateAsync(notification.id);
    } catch (error) {
      showErrorDialog(error, t('notifications.actionFailedTitle'));
    }
  };
  const open = async (notification: AppNotification) => {
    if (mutationBusy) return;
    try {
      if (!notification.readOn) await actions.markRead.mutateAsync(notification.id);
      const actionRoute = resolveNotificationActionRoute(notification.actionUrl);
      if (actionRoute) router.push(asHref(actionRoute));
    } catch (error) {
      showErrorDialog(error, t('notifications.actionFailedTitle'));
    }
  };
  const confirmDismiss = async () => {
    try {
      if (dismissTarget === 'all') await actions.dismissAll.mutateAsync();
      else if (dismissTarget) await actions.dismiss.mutateAsync(dismissTarget.id);
      setDismissTarget(null);
    } catch (error) {
      showErrorDialog(error, t('notifications.actionFailedTitle'));
    }
  };

  return (
    <AppScreen
      edges={['left', 'right', 'bottom']}
      refreshControl={<RefreshControl colors={[theme.colors.primary]} onRefresh={() => void refresh()} refreshing={notificationsQuery.isRefetching || unreadQuery.isRefetching} tintColor={theme.colors.primary} />}>
      <AppCard
        accessibilityLiveRegion="polite"
        padding="sm"
        style={styles.summaryCard}
        variant="filled">
        <View style={[styles.summary, { direction }]}> 
          <View style={styles.summaryText}>
            <AppText variant="titleSmall" weight="800">{t('notifications.title')}</AppText>
          </View>
          <View style={[styles.summaryActions, { direction }]}> 
            <AppIconButton
              disabled={notificationsQuery.isFetching}
              icon="refresh-outline"
              label={t('common.retry')}
              onPress={() => void refresh()}
            />
            <AppFilterButton<'unread' | 'read'>
              buttonLabel={t('notifications.filter')}
              buttonSize={44}
              clearLabel={t('notifications.all')}
              description={t('notifications.filterDescription')}
              disabled={notificationsQuery.isFetching}
              modalTitle={t('notifications.filter')}
              onChange={(values) => changeFilter(values[0] ?? 'all')}
              options={[
                {
                  description: t('notifications.unreadFilterDescription'),
                  icon: 'mail-unread-outline',
                  label: t('notifications.unread'),
                  value: 'unread',
                },
                {
                  description: t('notifications.readFilterDescription'),
                  icon: 'mail-open-outline',
                  label: t('notifications.read'),
                  value: 'read',
                },
              ]}
              selectionMode="single"
              values={filter === 'all' ? [] : [filter]}
            />
            <AppIconButton
              color={theme.colors.danger}
              disabled={notifications.length === 0 || mutationBusy}
              icon="trash-outline"
              label={t('notifications.dismissAll')}
              onPress={() => setDismissTarget('all')}
            />
          </View>
        </View>
        <View style={[styles.bulkReadActions, { direction }]}> 
          <AppButton
            accessibilityLabel={t('notifications.markAllRead')}
            disabled={unreadCount === 0 || mutationBusy}
            icon="mail-open-outline"
            loading={actions.markAllRead.isPending}
            onPress={() => {
              void actions.markAllRead.mutateAsync().catch((error: unknown) => {
                showErrorDialog(error, t('notifications.actionFailedTitle'));
              });
            }}
            style={styles.bulkReadButton}
            variant="outline">
            {t('notifications.markAllReadCompact')}
          </AppButton>
          <AppButton
            accessibilityLabel={t('notifications.markAllUnread')}
            disabled={mutationBusy}
            icon="mail-unread-outline"
            loading={actions.markAllUnread.isPending}
            onPress={() => {
              void actions.markAllUnread.mutateAsync().catch((error: unknown) => {
                showErrorDialog(error, t('notifications.actionFailedTitle'));
              });
            }}
            style={styles.bulkReadButton}
            variant="outline">
            {t('notifications.markAllUnreadCompact')}
          </AppButton>
        </View>
      </AppCard>

      <View style={[styles.filterHeader, { direction }]}> 
        <AppText variant="label">{activeFilterLabel}</AppText>
        {metadata ? (
          <AppText color="muted" variant="caption">
            {t('notifications.resultCount', { count: metadata.totalCount })}
          </AppText>
        ) : null}
      </View>
      {notificationsQuery.isLoading ? <AppStateView state="loading" /> : notificationsQuery.error ? (
        <AppStateView message={notificationsQuery.error instanceof Error ? notificationsQuery.error.message : undefined} onRetry={() => void refresh()} state="error" />
      ) : notifications.length === 0 ? (
        <AppStateView message={emptyMessage} state="empty" />
      ) : (
        <View style={styles.list}>
          {notifications.map((notification) => <NotificationRow busy={mutationBusy} key={notification.id} notification={notification} onDismiss={setDismissTarget} onPress={resolveNotificationActionRoute(notification.actionUrl) || !notification.readOn ? open : undefined} onToggleRead={(item) => void toggleRead(item)} />)}
        </View>
      )}
      {metadata && (metadata.hasPrev || metadata.hasNext) ? (
        <AppCard padding="sm" style={styles.paginationCard}>
          <AppPaginationNavigation
            onPageChange={(page) => setPageNumber(page + 1)}
            page={metadata.currentPage - 1}
            pageCount={metadata.totalPages}
          />
        </AppCard>
      ) : null}
      <ConfirmationDialog
        confirmLabel={t('notifications.dismiss')}
        description={dismissTarget === 'all'
          ? t('notifications.dismissAllDescription')
          : t('notifications.dismissDescription')}
        loading={actions.dismiss.isPending || actions.dismissAll.isPending}
        onCancel={() => setDismissTarget(null)}
        onConfirm={confirmDismiss}
        title={dismissTarget === 'all'
          ? t('notifications.dismissAll')
          : t('notifications.dismiss')}
        tone="danger"
        visible={dismissTarget !== null}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { gap: 8 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryText: { flex: 1, minWidth: 70 },
  summaryActions: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  bulkReadActions: { flexDirection: 'row', gap: 6 },
  bulkReadButton: { flex: 1, minHeight: 38, paddingHorizontal: 4 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  list: { gap: 12 },
  paginationCard: { alignItems: 'center', marginTop: 2 },
});
