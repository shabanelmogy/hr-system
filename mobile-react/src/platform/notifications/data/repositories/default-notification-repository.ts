import type { NotificationRepository } from '../../domain/repositories/notification-repository';
import type { NotificationRemoteDataSource } from '../remote/notification-remote-data-source';

export class DefaultNotificationRepository implements NotificationRepository {
  constructor(
    private readonly remote: NotificationRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Notifications require an internet connection.');
  }

  getPage(query?: Parameters<NotificationRepository['getPage']>[0]) {
    this.requireOnline();
    return this.remote.getPage(query);
  }

  getUnreadCount() {
    this.requireOnline();
    return this.remote.getUnreadCount();
  }

  markRead(id: number) {
    this.requireOnline();
    return this.remote.markRead(id);
  }

  markUnread(id: number) {
    this.requireOnline();
    return this.remote.markUnread(id);
  }

  markAllRead() {
    this.requireOnline();
    return this.remote.markAllRead();
  }

  markAllUnread() {
    this.requireOnline();
    return this.remote.markAllUnread();
  }

  dismiss(id: number) {
    this.requireOnline();
    return this.remote.dismiss(id);
  }

  dismissAll() {
    this.requireOnline();
    return this.remote.dismissAll();
  }
}
