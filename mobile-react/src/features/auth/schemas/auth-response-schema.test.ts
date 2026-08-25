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
