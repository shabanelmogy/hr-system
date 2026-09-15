import { loadOfflineSessionLease, saveOfflineSessionLease } from './offline-session-lease';

const mockRecordPut = jest.fn();
const mockRecordGet = jest.fn();
const mockPointerGet = jest.fn();
const mockPointerSet = jest.fn();
const mockPointerClear = jest.fn();

jest.mock('@/src/core/offline', () => ({
  ScopedRecordStore: jest.fn().mockImplementation(() => ({ put: mockRecordPut, get: mockRecordGet })),
}));

jest.mock('@/src/core/storage/secure-storage', () => ({
  secureSession: {
    getOfflineSessionPointer: (...args: unknown[]) => mockPointerGet(...args),
    setOfflineSessionPointer: (...args: unknown[]) => mockPointerSet(...args),
    clearOfflineSessionPointer: (...args: unknown[]) => mockPointerClear(...args),
  },
}));

const session = {
  userId: 'user-a', tenantId: 'tenant-a', companyId: 3,
  tenantName: 'Tenant', tenantPlanName: 'Plan', companyCode: 'C3',
  companyNameAr: 'شركة', companyNameEn: 'Company', companies: [],
  userName: 'user', email: 'user@example.com', firstName: 'A', lastName: 'B',
  roles: ['manager'], permissions: ['workforce.view'],
  tenantSubscriptionStatus: 'active', tenantSubscriptionEndsOn: null,
  tenantReadOnly: false, expiresAt: Date.now() - 1,
} as const;

describe('offline session lease', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPointerGet.mockResolvedValue(null);
    mockPointerSet.mockResolvedValue(undefined);
    mockPointerClear.mockResolvedValue(undefined);
  });

  it('persists a scoped lease and pointer even when the access token is expired', async () => {
    await saveOfflineSessionLease({} as never, session);
    expect(mockRecordPut).toHaveBeenCalledWith(expect.objectContaining({
      namespace: 'auth.session-lease',
      value: expect.objectContaining({ version: 1, session }),
    }));
    expect(mockRecordPut.mock.calls[0]?.[0]).not.toHaveProperty('isProtected');
    expect(mockPointerSet).toHaveBeenCalledWith(expect.stringContaining('tenant-a'));
  });

  it('rejects a wrong-scope pointer before exposing cached permissions', async () => {
    mockPointerGet.mockResolvedValue(JSON.stringify({
      version: 1,
      scope: { userId: 'other', tenantId: 'tenant-a', companyId: 3 },
      validUntil: new Date(Date.now() + 10_000).toISOString(),
    }));
    mockRecordGet.mockResolvedValue({ value: { version: 1, scope: { userId: 'user-a', tenantId: 'tenant-a', companyId: 3 } } });
    await expect(loadOfflineSessionLease({} as never)).resolves.toBeNull();
    expect(mockRecordGet).toHaveBeenCalledWith(
      { userId: 'other', tenantId: 'tenant-a', companyId: 3 },
      'auth.session-lease',
      'current',
    );
  });

  it('rejects a pointer whose expiry does not exactly match the encrypted lease', async () => {
    const pointerExpiry = new Date(Date.now() + 10_000).toISOString();
    mockPointerGet.mockResolvedValue(JSON.stringify({
      version: 1,
      scope: { userId: 'user-a', tenantId: 'tenant-a', companyId: 3 },
      validUntil: pointerExpiry,
    }));
    mockRecordGet.mockResolvedValue({ value: {
      version: 1,
      scope: { userId: 'user-a', tenantId: 'tenant-a', companyId: 3 },
      validatedAt: new Date(Date.now() - 1_000).toISOString(),
      validUntil: new Date(Date.now() + 20_000).toISOString(),
      session,
    } });
    await expect(loadOfflineSessionLease({} as never)).resolves.toBeNull();
  });

  it('rejects and clears an expired pointer before reading the local database', async () => {
    mockPointerGet.mockResolvedValue(JSON.stringify({
      version: 1,
      scope: { userId: 'user-a', tenantId: 'tenant-a', companyId: 3 },
      validUntil: new Date(Date.now() - 1_000).toISOString(),
    }));
    await expect(loadOfflineSessionLease({} as never)).resolves.toBeNull();
    expect(mockRecordGet).not.toHaveBeenCalled();
    expect(mockPointerClear).toHaveBeenCalledTimes(1);
  });
});
