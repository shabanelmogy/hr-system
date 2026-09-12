import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { NotificationFilter, NotificationQuery } from '../../domain/models/notification';
import { useNotificationUseCases } from '../../composition/use-notification-use-cases';

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
  const useCases = useNotificationUseCases();
  return useQuery({
    queryKey: notificationKeys.page(query),
    queryFn: () => useCases.getPage(query),
    staleTime: 20_000,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  const useCases = useNotificationUseCases();
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => useCases.getUnreadCount(),
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchOnMount: 'always',
    enabled,
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const useCases = useNotificationUseCases();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'active' });
  };

  return {
    markRead: useMutation({ mutationFn: (id: number) => useCases.markRead(id), onSuccess: invalidate }),
    markUnread: useMutation({ mutationFn: (id: number) => useCases.markUnread(id), onSuccess: invalidate }),
    markAllRead: useMutation({ mutationFn: () => useCases.markAllRead(), onSuccess: invalidate }),
    markAllUnread: useMutation({ mutationFn: () => useCases.markAllUnread(), onSuccess: invalidate }),
    dismiss: useMutation({ mutationFn: (id: number) => useCases.dismiss(id), onSuccess: invalidate }),
    dismissAll: useMutation({ mutationFn: () => useCases.dismissAll(), onSuccess: invalidate }),
  };
}

/** Call this from a feature-specific realtime listener when one is registered. */
export function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: notificationKeys.all, refetchType: 'active' });
}
