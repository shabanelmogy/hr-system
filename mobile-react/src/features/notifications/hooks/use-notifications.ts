import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '@/src/features/notifications/api/notification-api';
import type { NotificationFilter, NotificationQuery } from '@/src/features/notifications/types/notification';

export const notificationKeys = {
  all: ['notifications'] as const,
  pages: () => [...notificationKeys.all, 'page'] as const,
  page: (query: NotificationQuery) => [...notificationKeys.pages(), query] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function notificationFilterStatus(filter: NotificationFilter): 0 | 1 | 2 {
  return filter === 'unread' ? 1 : filter === 'read' ? 2 : 0;
}

export function useNotificationPage(query: NotificationQuery) {
  return useQuery({
    queryKey: notificationKeys.page(query),
    queryFn: () => notificationApi.getPage(query),
    staleTime: 20_000,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationApi.getUnreadCount,
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchOnMount: 'always',
    enabled,
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'active' });
  };

  return {
    markRead: useMutation({ mutationFn: notificationApi.markRead, onSuccess: invalidate }),
    markUnread: useMutation({ mutationFn: notificationApi.markUnread, onSuccess: invalidate }),
    markAllRead: useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate }),
    markAllUnread: useMutation({ mutationFn: notificationApi.markAllUnread, onSuccess: invalidate }),
    dismiss: useMutation({ mutationFn: notificationApi.dismiss, onSuccess: invalidate }),
    dismissAll: useMutation({ mutationFn: notificationApi.dismissAll, onSuccess: invalidate }),
  };
}

/** Call this from a feature-specific realtime listener when one is registered. */
export function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'active' });
}
