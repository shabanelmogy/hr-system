import { normalizeOfflineScope, offlineScopeKey } from './scope';

describe('offline scope', () => {
  it('normalizes and keys user/tenant/company scope', () => {
    expect(normalizeOfflineScope({ userId: ' user-a ', tenantId: ' tenant-a ', companyId: 7 })).toEqual({
      userId: 'user-a',
      tenantId: 'tenant-a',
      companyId: 7,
    });
    expect(offlineScopeKey({ userId: 'user/a', tenantId: 'tenant/a', companyId: 7 }))
      .toBe('user%2Fa:tenant%2Fa:7');
  });

  it('rejects incomplete scope', () => {
    expect(() => normalizeOfflineScope({ userId: ' ', tenantId: 'tenant-a', companyId: 1 })).toThrow();
    expect(() => normalizeOfflineScope({ userId: 'user-a', tenantId: ' ', companyId: 1 })).toThrow();
    expect(() => normalizeOfflineScope({ userId: 'user-a', tenantId: 'tenant-a', companyId: 0 })).toThrow();
  });
});
