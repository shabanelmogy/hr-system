import type { NotificationRemoteDataSource } from '../remote/notification-remote-data-source';
import { DefaultNotificationRepository } from './default-notification-repository';

function remoteMock(): jest.Mocked<NotificationRemoteDataSource> {
  return {
    getPage: jest.fn(),
    getUnreadCount: jest.fn(),
    markRead: jest.fn(),
    markUnread: jest.fn(),
    markAllRead: jest.fn(),
    markAllUnread: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
  };
}

describe('DefaultNotificationRepository', () => {
  it('delegates reads and actions directly while online', async () => {
    const remote = remoteMock();
    remote.getUnreadCount.mockResolvedValue(2);
    const repository = new DefaultNotificationRepository(remote, () => true);

    await expect(repository.getUnreadCount()).resolves.toBe(2);
    await repository.markRead(1);

    expect(remote.getUnreadCount).toHaveBeenCalledTimes(1);
    expect(remote.markRead).toHaveBeenCalledWith(1);
  });

  it('fails closed offline and does not queue notification writes', () => {
    const remote = remoteMock();
    const repository = new DefaultNotificationRepository(remote, () => false);

    expect(() => repository.getUnreadCount()).toThrow('require an internet connection');
    expect(() => repository.dismissAll()).toThrow('require an internet connection');
    expect(remote.getUnreadCount).not.toHaveBeenCalled();
    expect(remote.dismissAll).not.toHaveBeenCalled();
  });
});
