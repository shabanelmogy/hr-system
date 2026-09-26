import { apiService } from '@/src/core/api';
import { administrationRemoteDataSource } from './administration-remote-data-source';

jest.mock('@/src/core/api', () => ({
  ...jest.requireActual('@/src/core/api'),
  apiService: {
    delete: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

describe('administration remote data source', () => {
  beforeEach(() => jest.clearAllMocks());

  const managedUser = {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    userName: 'test.user',
    email: 'test@example.com',
    isDisabled: false,
    isLocked: false,
    profilePicture: null,
    roles: ['admin'],
    companyIds: [1],
    defaultCompanyId: 1,
    lifecycleStatus: 'active',
    archivedOn: null,
    archiveReason: null,
  } as const;

  it('preserves encoded role and invitation endpoint contracts', async () => {
    (apiService.put as jest.Mock).mockResolvedValue(undefined);
    (apiService.delete as jest.Mock).mockResolvedValue(undefined);

    await administrationRemoteDataSource.toggleRole('role/a');
    await administrationRemoteDataSource.revokeInvitation('invite/a');
    await administrationRemoteDataSource.revokeUserSessions('user+a@example.com');

    expect(apiService.put).toHaveBeenNthCalledWith(1, 'roles/toggle/role%2Fa', undefined);
    expect(apiService.delete).toHaveBeenCalledWith('userinvitations/revoke/invite%2Fa');
    expect(apiService.put).toHaveBeenNthCalledWith(
      2,
      'auth/revokeRefreshTokenByUserId?userId=user%2Ba%40example.com',
      undefined,
    );
  });

  it('rejects malformed managed-user responses at the transport boundary', async () => {
    (apiService.get as jest.Mock).mockResolvedValue([{ id: 'user-1' }]);
    await expect(administrationRemoteDataSource.getUsers()).rejects.toThrow();
  });

  it('accepts stable lifecycle names and rejects numeric lifecycle strings', async () => {
    (apiService.get as jest.Mock).mockResolvedValueOnce([managedUser]);
    await expect(administrationRemoteDataSource.getUsers()).resolves.toEqual([managedUser]);

    (apiService.get as jest.Mock).mockResolvedValueOnce([
      { ...managedUser, lifecycleStatus: '0' },
    ]);
    await expect(administrationRemoteDataSource.getUsers()).rejects.toThrow();
  });
});
