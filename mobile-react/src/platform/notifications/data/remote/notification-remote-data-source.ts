import { apiService } from '@/src/core/api';
import type {
  NotificationPageResponse,
  NotificationQuery,
} from '../../domain/models/notification';
import { notificationEndpoints } from './notification-endpoints';
import {
  notificationPageSchema,
  unreadNotificationCountSchema,
} from './notification-schemas';

const DEFAULT_PAGE_SIZE = 20;

export interface NotificationRemoteDataSource {
  getPage(query?: NotificationQuery): Promise<NotificationPageResponse>;
  getUnreadCount(): Promise<number>;
  markRead(id: number): Promise<void>;
  markUnread(id: number): Promise<void>;
  markAllRead(): Promise<void>;
  markAllUnread(): Promise<void>;
  dismiss(id: number): Promise<void>;
  dismissAll(): Promise<void>;
}

export const notificationRemoteDataSource: NotificationRemoteDataSource = {
  async getPage(query = {}) {
    const response = await apiService.get<unknown>(notificationEndpoints.list, {
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

  async getUnreadCount() {
    return unreadNotificationCountSchema.parse(
      await apiService.get<unknown>(notificationEndpoints.unreadCount),
    );
  },

  async markRead(id) {
    await apiService.patch<unknown, undefined>(notificationEndpoints.markRead(id), undefined);
  },

  async markUnread(id) {
    await apiService.patch<unknown, undefined>(notificationEndpoints.markUnread(id), undefined);
  },

  async markAllRead() {
    await apiService.patch<unknown, undefined>(notificationEndpoints.markAllRead, undefined);
  },

  async markAllUnread() {
    await apiService.patch<unknown, undefined>(notificationEndpoints.markAllUnread, undefined);
  },

  async dismiss(id) {
    await apiService.delete<unknown>(notificationEndpoints.dismiss(id));
  },

  async dismissAll() {
    await apiService.delete<unknown>(notificationEndpoints.dismissAll);
  },
};
