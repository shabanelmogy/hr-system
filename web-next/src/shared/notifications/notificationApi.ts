import apiClient from "@/lib/api/client";
import { apiRoutes } from "@/config/api";
import type {
  NotificationPageResponse,
  NotificationReadStatus,
} from "./types";

const PAGE_SIZE = 10;

export function getNotifications(
  pageNumber: number,
  status: NotificationReadStatus,
) {
  return apiClient.get<NotificationPageResponse>(apiRoutes.notifications.list, {
    pageNumber,
    pageSize: PAGE_SIZE,
    status,
    columnName: "CreatedOn",
    sortDirection: "DESC",
  });
}

export function getUnreadNotificationCount() {
  return apiClient.get<number>(apiRoutes.notifications.unreadCount);
}

export function markNotificationRead(id: number) {
  return apiClient.patch<void>(apiRoutes.notifications.markRead(id));
}

export function markAllNotificationsRead() {
  return apiClient.patch<void>(apiRoutes.notifications.markAllRead);
}

export function markNotificationUnread(id: number) {
  return apiClient.patch<void>(apiRoutes.notifications.markUnread(id));
}

export function markAllNotificationsUnread() {
  return apiClient.patch<void>(apiRoutes.notifications.markAllUnread);
}

export function dismissNotification(id: number) {
  return apiClient.delete<void>(apiRoutes.notifications.dismiss(id));
}

export function dismissAllNotifications() {
  return apiClient.delete<void>(apiRoutes.notifications.dismissAll);
}
