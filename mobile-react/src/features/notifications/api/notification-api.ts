import { apiService } from '@/src/core/api';
import type {
  NotificationPageResponse,
  NotificationQuery,
} from '@/src/features/notifications/types/notification';
import {
  notificationPageSchema,
  unreadNotificationCountSchema,
} from '@/src/features/notifications/api/notification-schemas';

const endpoints = {
  list: 'notifications/getAll',
  unreadCount: 'notifications/getUnreadCount',
  markRead: (id: number) => `notifications/markRead/${id}`,
  markUnread: (id: number) => `notifications/markUnread/${id}`,
  markAllRead: 'notifications/markAllRead',
  markAllUnread: 'notifications/markAllUnread',
  dismiss: (id: number) => `notifications/dismiss/${id}`,
  dismissAll: 'notifications/dismissAll',
} as const;

const DEFAULT_PAGE_SIZE = 20;

export const notificationApi = {
  async getPage(query: NotificationQuery = {}): Promise<NotificationPageResponse> {
    const response = await apiService.get<unknown>(endpoints.list, {
      params: {
        pageNumber: query.pageNumber ?? 1,
        pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
        status: query.status ?? 0,
        category: query.category,
        severity: query.severity,
        columnName: query.columnName ?? 'CreatedOn',
        sortDirection: query.sortDirection ?? 'DESC',
      },
    });
    return notificationPageSchema.parse(response);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<unknown>(endpoints.unreadCount);
    return unreadNotificationCountSchema.parse(response);
  },

  async markRead(id: number): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markRead(id), undefined); },
  async markUnread(id: number): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markUnread(id), undefined); },
  async markAllRead(): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markAllRead, undefined); },
  async markAllUnread(): Promise<void> { await apiService.patch<unknown, undefined>(endpoints.markAllUnread, undefined); },
  async dismiss(id: number): Promise<void> { await apiService.delete<unknown>(endpoints.dismiss(id)); },
  async dismissAll(): Promise<void> { await apiService.delete<unknown>(endpoints.dismissAll); },
};
