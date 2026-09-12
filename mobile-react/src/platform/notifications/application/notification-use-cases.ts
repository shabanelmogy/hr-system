import type { NotificationQuery } from '../domain/models/notification';
import type { NotificationRepository } from '../domain/repositories/notification-repository';

export function createNotificationUseCases(repository: NotificationRepository) {
  return {
    getPage: (query?: NotificationQuery) => repository.getPage(query),
    getUnreadCount: () => repository.getUnreadCount(),
    markRead: (id: number) => repository.markRead(id),
    markUnread: (id: number) => repository.markUnread(id),
    markAllRead: () => repository.markAllRead(),
    markAllUnread: () => repository.markAllUnread(),
    dismiss: (id: number) => repository.dismiss(id),
    dismissAll: () => repository.dismissAll(),
  };
}

export type NotificationUseCases = ReturnType<typeof createNotificationUseCases>;
