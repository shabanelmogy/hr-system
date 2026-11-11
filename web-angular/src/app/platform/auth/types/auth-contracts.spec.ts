import { sessionSchema } from './auth-contracts';
import { sessionFixture } from '../auth.fixture';

describe('system session contract', () => {
  const system = {
    ...sessionFixture,
    sessionScope: 'system',
    roles: ['super_admin'],
    tenantId: '',
    tenantName: '',
    tenantPlanName: '',
    companyId: 0,
    companyCode: '',
    companyNameAr: '',
    companyNameEn: '',
    companies: [],
    tenantSubscriptionStatus: '',
    tenantSubscriptionEndsOn: null,
    tenantReadOnly: false,
  };
  it('accepts an explicit system session without tenant or company', () => {
    expect(sessionSchema.parse({ isAuthenticated: true, user: system }).user.sessionScope).toBe(
      'system',
    );
  });
  it.each([
    { tenantId: 'borrowed' },
    { companyId: 1 },
    { roles: ['admin'] },
    { sessionScope: 'unknown' },
    { sessionScope: 'company' },
    { companies: [{ id: 1, companyCode: 'OTHER', nameAr: '', nameEn: '' }] },
  ])('rejects mixed or unauthorized scope %j', (change) => {
    expect(
      sessionSchema.safeParse({ isAuthenticated: true, user: { ...system, ...change } }).success,
    ).toBe(false);
  });
  it('keeps legacy company sessions compatible', () => {
    expect(
      sessionSchema.parse({ isAuthenticated: true, user: sessionFixture }).user.companyId,
    ).toBe(1);
  });
});
