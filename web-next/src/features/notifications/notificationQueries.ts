"use client";

import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { showErrorDialog } from "@/shared/components/feedback";
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
import type {
  AppNotification,
  NotificationFilter,
  NotificationPageResponse,
  NotificationReadStatus,
} from "./types";

type NotificationPages = InfiniteData<NotificationPageResponse, number>;
type NotificationSnapshot = Array<[readonly unknown[], NotificationPages | undefined]>;

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filter: NotificationFilter) =>
    [...notificationKeys.lists(), filter] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
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

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      const snapshot = await takeSnapshot(queryClient);
      const existing = findNotification(queryClient, id);
      const wasUnread = Boolean(existing && !existing.readOn);
      const readOn = new Date().toISOString();
      updateNotificationPages(queryClient, (notification) =>
        notification.id === id ? { ...notification, readOn } : notification,
      );
      removeNotificationFromList(queryClient, "unread", id);
      if (wasUnread) adjustUnreadCount(queryClient, -1);
      return snapshot;
    },
    onError: (error, _id, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      showErrorDialog(error, errorTitle);
    },
    onSettled: () => reconcile(queryClient),
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      const snapshot = await takeSnapshot(queryClient);
      const readOn = new Date().toISOString();
      updateNotificationPages(queryClient, (notification) => ({
        ...notification,
        readOn: notification.readOn ?? readOn,
      }));
      clearNotificationList(queryClient, "unread");
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      return snapshot;
    },
    onError: (error, _variables, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      showErrorDialog(error, errorTitle);
    },
    onSettled: () => reconcile(queryClient),
  });

  const markUnread = useMutation({
    mutationFn: markNotificationUnread,
    onMutate: async (id) => {
      const snapshot = await takeSnapshot(queryClient);
      const existing = findNotification(queryClient, id);
      const wasRead = Boolean(existing?.readOn);
      updateNotificationPages(queryClient, (notification) =>
        notification.id === id ? { ...notification, readOn: null } : notification,
      );
      if (wasRead) adjustUnreadCount(queryClient, 1);
      return snapshot;
    },
    onError: (error, _id, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      showErrorDialog(error, errorTitle);
    },
    onSettled: () => reconcile(queryClient),
  });

  const markAllUnread = useMutation({
    mutationFn: markAllNotificationsUnread,
    onMutate: async () => {
      const snapshot = await takeSnapshot(queryClient);
      updateNotificationPages(queryClient, (notification) => ({
        ...notification,
        readOn: null,
      }));
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        getKnownNotificationTotal(queryClient),
      );
      return snapshot;
    },
    onError: (error, _variables, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      showErrorDialog(error, errorTitle);
    },
    onSettled: () => reconcile(queryClient),
  });

  const dismiss = useMutation({
    mutationFn: dismissNotification,
    onMutate: async (id) => {
      const snapshot = await takeSnapshot(queryClient);
      const existing = findNotification(queryClient, id);
      const wasUnread = Boolean(existing && !existing.readOn);
      removeNotificationFromPages(queryClient, id);
      if (wasUnread) adjustUnreadCount(queryClient, -1);
      return snapshot;
    },
    onError: (error, _id, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      showErrorDialog(error, errorTitle);
    },
    onSettled: () => reconcile(queryClient),
  });

  const dismissAll = useMutation({
    mutationFn: dismissAllNotifications,
    onMutate: async () => {
      const snapshot = await takeSnapshot(queryClient);
      queryClient.setQueriesData<NotificationPages>(
        { queryKey: notificationKeys.lists() },
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: [],
              metaData: {
                ...page.metaData,
                totalCount: 0,
                totalPages: 0,
                hasNext: false,
              },
            })),
          },
      );
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
      return snapshot;
    },
    onError: (error, _variables, snapshot) => {
      restoreSnapshot(queryClient, snapshot);
      showErrorDialog(error, errorTitle);
    },
    onSettled: () => reconcile(queryClient),
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

async function takeSnapshot(queryClient: QueryClient) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: notificationKeys.lists() }),
    queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount() }),
  ]);

  return {
    lists: queryClient.getQueriesData<NotificationPages>({
      queryKey: notificationKeys.lists(),
    }) as NotificationSnapshot,
    unreadCount: queryClient.getQueryData<number>(notificationKeys.unreadCount()),
  };
}

function restoreSnapshot(
  queryClient: QueryClient,
  snapshot:
    | { lists: NotificationSnapshot; unreadCount: number | undefined }
    | undefined,
) {
  if (!snapshot) return;
  snapshot.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
  queryClient.setQueryData(notificationKeys.unreadCount(), snapshot.unreadCount);
}

function updateNotificationPages(
  queryClient: QueryClient,
  update: (notification: AppNotification) => AppNotification,
) {
  queryClient.setQueriesData<NotificationPages>(
    { queryKey: notificationKeys.lists() },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map(update),
        })),
      },
  );
}

function removeNotificationFromPages(queryClient: QueryClient, id: number) {
  queryClient.setQueriesData<NotificationPages>(
    { queryKey: notificationKeys.lists() },
    (data) => {
      if (!data) return data;
      const exists = data.pages.some((page) =>
        page.items.some((item) => item.id === id),
      );
      return {
        ...data,
        pages: data.pages.map((page) => {
          const items = page.items.filter((item) => item.id !== id);
          return {
            ...page,
            items,
            metaData: {
              ...page.metaData,
              totalCount: exists
                ? Math.max(0, page.metaData.totalCount - 1)
                : page.metaData.totalCount,
            },
          };
        }),
      };
    },
  );
}

function removeNotificationFromList(
  queryClient: QueryClient,
  filter: NotificationFilter,
  id: number,
) {
  queryClient.setQueryData<NotificationPages>(
    notificationKeys.list(filter),
    (data) => {
      if (!data) return data;
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.filter((item) => item.id !== id),
          metaData: {
            ...page.metaData,
            totalCount: Math.max(0, page.metaData.totalCount - 1),
          },
        })),
      };
    },
  );
}

function clearNotificationList(
  queryClient: QueryClient,
  filter: NotificationFilter,
) {
  queryClient.setQueryData<NotificationPages>(
    notificationKeys.list(filter),
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: [],
          metaData: {
            ...page.metaData,
            totalCount: 0,
            totalPages: 0,
            hasNext: false,
          },
        })),
      },
  );
}

function findNotification(queryClient: QueryClient, id: number) {
  const lists = queryClient.getQueriesData<NotificationPages>({
    queryKey: notificationKeys.lists(),
  });
  return lists
    .flatMap(([, data]) => data?.pages.flatMap((page) => page.items) ?? [])
    .find((item) => item.id === id);
}

function getKnownNotificationTotal(queryClient: QueryClient) {
  const allNotifications = queryClient.getQueryData<NotificationPages>(
    notificationKeys.list("all"),
  );
  return allNotifications?.pages[0]?.metaData.totalCount ?? 0;
}

function adjustUnreadCount(queryClient: QueryClient, amount: number) {
  queryClient.setQueryData<number>(notificationKeys.unreadCount(), (count) =>
    Math.max(0, (count ?? 0) + amount),
  );
}

function reconcile(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
}
