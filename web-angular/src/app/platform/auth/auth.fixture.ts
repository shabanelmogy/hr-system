import type { Session } from './types/auth-contracts';

/** Synthetic identity for deterministic acceptance only; contains no real credentials. */
export const sessionFixture: Session = {
  userId: 'fixture-user', tenantId: 'fixture-tenant', tenantName: 'Fixture Tenant', tenantPlanName: 'Fixture Plan',
  companyId: 1, companyCode: 'TEST', companyNameAr: 'شركة اختبار', companyNameEn: 'Fixture Company', companies: [],
  userName: 'fixture', email: 'fixture@example.test', firstName: 'Fixture', lastName: 'User', roles: ['user'], permissions: [],
  tenantSubscriptionStatus: 'Active', tenantSubscriptionEndsOn: null, tenantReadOnly: false, expiresAt: 2_000_000_000,
};
