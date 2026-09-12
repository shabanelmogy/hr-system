import type {
  NotificationPageResponse,
  NotificationQuery,
} from '../models/notification';

export interface NotificationRepository {
  getPage(query?: NotificationQuery): Promise<NotificationPageResponse>;
  getUnreadCount(): Promise<number>;
  markRead(id: number): Promise<void>;
  markUnread(id: number): Promise<void>;
  markAllRead(): Promise<void>;
  markAllUnread(): Promise<void>;
  dismiss(id: number): Promise<void>;
  dismissAll(): Promise<void>;
}
