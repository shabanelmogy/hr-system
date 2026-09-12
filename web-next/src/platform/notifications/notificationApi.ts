import apiClient from "@/lib/api/client";
import { notifications as notificationRoutes } from "./apiRoutes";
import type {
  NotificationPageResponse,
  NotificationReadStatus,
} from "./types";

const PAGE_SIZE = 10;

export function getNotifications(
  pageNumber: number,
  status: NotificationReadStatus,
) {
  return apiClient.get<NotificationPageResponse>(notificationRoutes.list, {
    pageNumber,
    pageSize: PAGE_SIZE,
    status,
    columnName: "CreatedOn",
    sortDirection: "DESC",
  });
}

export function getUnreadNotificationCount() {
  return apiClient.get<number>(notificationRoutes.unreadCount);
}

export function markNotificationRead(id: number) {
  return apiClient.patch<void>(notificationRoutes.markRead(id));
}

export function markAllNotificationsRead() {
  return apiClient.patch<void>(notificationRoutes.markAllRead);
}

export function markNotificationUnread(id: number) {
  return apiClient.patch<void>(notificationRoutes.markUnread(id));
}

export function markAllNotificationsUnread() {
  return apiClient.patch<void>(notificationRoutes.markAllUnread);
}

export function dismissNotification(id: number) {
  return apiClient.delete<void>(notificationRoutes.dismiss(id));
}

export function dismissAllNotifications() {
  return apiClient.delete<void>(notificationRoutes.dismissAll);
}
