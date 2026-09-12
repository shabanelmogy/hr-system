import type { NotificationRepository } from '../domain/repositories/notification-repository';
import { createNotificationUseCases } from './notification-use-cases';

function repositoryMock(): jest.Mocked<NotificationRepository> {
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

describe('notification application use cases', () => {
  it('delegates reads through the repository port', async () => {
    const repository = repositoryMock();
    repository.getPage.mockResolvedValue({ items: [], metaData: {} as never });
    repository.getUnreadCount.mockResolvedValue(3);
    const useCases = createNotificationUseCases(repository);
    const query = { pageNumber: 2 };

    await useCases.getPage(query);
    await expect(useCases.getUnreadCount()).resolves.toBe(3);

    expect(repository.getPage).toHaveBeenCalledWith(query);
    expect(repository.getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it('preserves all notification actions', async () => {
    const repository = repositoryMock();
    const useCases = createNotificationUseCases(repository);

    await useCases.markRead(1);
    await useCases.markUnread(1);
    await useCases.markAllRead();
    await useCases.markAllUnread();
    await useCases.dismiss(1);
    await useCases.dismissAll();

    expect(repository.markRead).toHaveBeenCalledWith(1);
    expect(repository.markUnread).toHaveBeenCalledWith(1);
    expect(repository.markAllRead).toHaveBeenCalledTimes(1);
    expect(repository.markAllUnread).toHaveBeenCalledTimes(1);
    expect(repository.dismiss).toHaveBeenCalledWith(1);
    expect(repository.dismissAll).toHaveBeenCalledTimes(1);
  });
});
