import {
  parseAuthResponse,
  parseLoginOutcome,
  parseSessionResponse,
} from './auth-response-schema';

const company = {
  id: 7,
  companyCode: 'COMP-7',
  nameAr: 'الشركة السابعة',
  nameEn: 'Company Seven',
};

describe('authentication response contracts', () => {
  it('accepts system sessions and rejects borrowed company scope', () => {
    const system = { sessionScope: 'system', userId: 'super', userName: 'super',
      email: 'super@example.test', firstName: '', lastName: '',
      tenantId: '', tenantName: '', tenantPlanName: '', companyId: 0, companyCode: '',
      companyNameAr: '', companyNameEn: '', companies: [], roles: ['super_admin'], permissions: [],
      tenantSubscriptionStatus: '', tenantSubscriptionEndsOn: null, tenantReadOnly: false,
      expiresAt: Date.now() + 60_000 };
    expect(parseSessionResponse(system).sessionScope).toBe('system');
    for (const change of [{ tenantId: 'borrowed' }, { companyId: 1 }, { roles: ['admin'] }, { sessionScope: 'unknown' }])
      expect(() => parseSessionResponse({ ...system, ...change })).toThrow();
    expect(parseAuthResponse({ ...system, id: 'super', token: 'test', refreshToken: 'test',
      tokenExpiration: '2026-11-10T00:00:00Z', refreshTokenExpiration: '2026-11-20T00:00:00Z' }).companyId).toBe(0);
  });
  it('parses company identity from an authenticated response', () => {
    expect(parseAuthResponse({
      id: 'user-id',
      userName: 'user',
      firstName: 'Test',
      lastName: 'User',
      tenantId: 'tenant-id',
      tenantName: 'Tenant',
      tenantPlanName: 'Professional',
      companyId: company.id,
      companyCode: company.companyCode,
      companyNameAr: company.nameAr,
      companyNameEn: company.nameEn,
      token: 'access-token',
      tokenExpiration: '2026-08-25T12:00:00Z',
      refreshToken: 'refresh-token',
      refreshTokenExpiration: '2026-09-25T12:00:00Z',
    }).companyCode).toBe(company.companyCode);
  });

  it('requires company codes in a company-selection challenge', () => {
    expect(() => parseLoginOutcome({
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: 'selection-token',
      companySelectionTokenExpiration: '2026-08-25T12:00:00Z',
      companies: [
        { id: 1, nameAr: 'الأولى', nameEn: 'First' },
        { id: 2, nameAr: 'الثانية', nameEn: 'Second' },
      ],
    })).toThrow();
  });

  it('parses a tenant-selection challenge with one tenant', () => {
    expect(parseLoginOutcome({
      isAuthenticated: false,
      requiresTenantSelection: true,
      tenantSelectionToken: 'selection-token',
      tenantSelectionTokenExpiration: '2026-08-25T12:00:00Z',
      tenants: [{ id: 'tenant-id', identifier: 'TENANT', name: 'Tenant' }],
    })).toMatchObject({
      kind: 'tenant-selection',
    });
  });

  it('parses a company-selection challenge with one company', () => {
    expect(parseLoginOutcome({
      isAuthenticated: false,
      requiresCompanySelection: true,
      companySelectionToken: 'selection-token',
      companySelectionTokenExpiration: '2026-08-25T12:00:00Z',
      companies: [company],
    })).toMatchObject({
      kind: 'company-selection',
    });
  });

  it('requires the current company in a unique available-company list', () => {
    const session = {
      userId: 'user-id',
      tenantId: 'tenant-id',
      tenantName: 'Tenant',
      tenantPlanName: 'Professional',
      companyId: company.id,
      companyCode: company.companyCode,
      companyNameAr: company.nameAr,
      companyNameEn: company.nameEn,
      companies: [company],
      userName: 'user',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['Manager'],
      permissions: ['Users:View'],
      tenantSubscriptionStatus: 'active',
      tenantSubscriptionEndsOn: null,
      tenantReadOnly: false,
      expiresAt: Date.now() + 60_000,
    };

    expect(parseSessionResponse(session).companyId).toBe(company.id);
    expect(() => parseSessionResponse({
      ...session,
      companies: [{ ...company, id: 8 }],
    })).toThrow();
    expect(() => parseSessionResponse({
      ...session,
      companies: [company, company],
    })).toThrow();
  });
});
