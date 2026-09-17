"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { showErrorDialog } from "@/shared/components/feedback/transient";
import {
  dismissAllNotifications,
  dismissNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markAllNotificationsUnread,
  markNotificationRead,
  markNotificationUnread,
} from "./notificationApi";
import type { NotificationFilter, NotificationReadStatus } from "./types";
import { notificationKeys } from "./notificationQueryKeys";

export { notificationKeys } from "./notificationQueryKeys";

export function useUnreadNotificationCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled: options?.enabled ?? true,
    staleTime: 20_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });
}

export function useNotificationList(
  filter: NotificationFilter,
  enabled: boolean,
) {
  const status: NotificationReadStatus = filter === "unread" ? 1 : 0;

  return useInfiniteQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: ({ pageParam }) => getNotifications(pageParam, status),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.metaData.hasNext ? lastPage.metaData.currentPage + 1 : undefined,
    enabled,
    staleTime: 20_000,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const errorTitle = t("notifications.errorTitle");
  const handleError = (error: Error) => showErrorDialog(error, errorTitle);
  const refreshAuthoritativeState = () => reconcile(queryClient);

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onError: handleError,
    onSuccess: refreshAuthoritativeState,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onError: handleError,
    onSuccess: refreshAuthoritativeState,
  });

  const markUnread = useMutation({
    mutationFn: markNotificationUnread,
    onError: handleError,
    onSuccess: refreshAuthoritativeState,
  });

  const markAllUnread = useMutation({
    mutationFn: markAllNotificationsUnread,
    onError: handleError,
    onSuccess: refreshAuthoritativeState,
  });

  const dismiss = useMutation({
    mutationFn: dismissNotification,
    onError: handleError,
    onSuccess: refreshAuthoritativeState,
  });

  const dismissAll = useMutation({
    mutationFn: dismissAllNotifications,
    onError: handleError,
    onSuccess: refreshAuthoritativeState,
  });

  return {
    markRead,
    markUnread,
    markAllRead,
    markAllUnread,
    dismiss,
    dismissAll,
  };
}

function reconcile(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
}
