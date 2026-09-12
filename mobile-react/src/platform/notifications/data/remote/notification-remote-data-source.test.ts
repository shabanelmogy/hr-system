import { apiService } from '@/src/core/api';
import { notificationRemoteDataSource } from './notification-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const page = {
  items: [{
    id: 1,
    category: 'users',
    eventType: 'updated',
    severity: 'Info',
    titleKey: 'Notifications.UserChangedTitle',
    messageKey: 'Notifications.UserChangedMessage',
    parameters: { userName: 'Ada' },
    entityType: null,
    entityId: null,
    actionUrl: null,
    actorUserId: null,
    correlationId: '123e4567-e89b-12d3-a456-426614174000',
    createdOn: '2026-08-20T10:00:00Z',
    readOn: null,
    expiresOn: null,
  }],
  metaData: {
    currentPage: 1,
    pageNumber: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  },
};

describe('notification remote data source', () => {
  beforeEach(() => jest.clearAllMocks());

  it('preserves query defaults and validates paged responses', async () => {
    (apiService.get as jest.Mock).mockResolvedValue(page);

    await expect(notificationRemoteDataSource.getPage({ category: 'users' })).resolves.toEqual(page);
    expect(apiService.get).toHaveBeenCalledWith('notifications/getAll', {
      params: {
        pageNumber: 1,
        pageSize: 20,
        status: 0,
        category: 'users',
        severity: undefined,
        columnName: 'CreatedOn',
        sortDirection: 'DESC',
      },
    });
  });

  it('preserves unread count and all mutation endpoints', async () => {
    (apiService.get as jest.Mock).mockResolvedValue(4);

    await expect(notificationRemoteDataSource.getUnreadCount()).resolves.toBe(4);
    await notificationRemoteDataSource.markRead(1);
    await notificationRemoteDataSource.markUnread(1);
    await notificationRemoteDataSource.markAllRead();
    await notificationRemoteDataSource.markAllUnread();
    await notificationRemoteDataSource.dismiss(1);
    await notificationRemoteDataSource.dismissAll();

    expect(apiService.patch).toHaveBeenNthCalledWith(1, 'notifications/markRead/1', undefined);
    expect(apiService.patch).toHaveBeenNthCalledWith(2, 'notifications/markUnread/1', undefined);
    expect(apiService.patch).toHaveBeenNthCalledWith(3, 'notifications/markAllRead', undefined);
    expect(apiService.patch).toHaveBeenNthCalledWith(4, 'notifications/markAllUnread', undefined);
    expect(apiService.delete).toHaveBeenNthCalledWith(1, 'notifications/dismiss/1');
    expect(apiService.delete).toHaveBeenNthCalledWith(2, 'notifications/dismissAll');
  });
});
