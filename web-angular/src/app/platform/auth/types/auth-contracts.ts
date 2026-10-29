import * as z from 'zod/mini';

const text = z.string();
const company = z.object({ id: z.int(), companyCode: text, nameAr: text, nameEn: text });
export const sessionSchema = z.strictObject({ isAuthenticated: z.literal(true), user: z.object({
  userId: text, tenantId: text, tenantName: text, tenantPlanName: text,
  companyId: z.int(), companyCode: text, companyNameAr: text, companyNameEn: text,
  companies: z.array(company), userName: text, email: text, firstName: text, lastName: text,
  roles: z.array(text), permissions: z.array(text), tenantSubscriptionStatus: text,
  tenantSubscriptionEndsOn: z.nullable(text), tenantReadOnly: z.boolean(), expiresAt: z.number(),
}) });
const tenantSchema = z.object({ isAuthenticated: z.literal(false), requiresTenantSelection: z.literal(true),
  tenantSelectionToken: z.string().check(z.minLength(1)), tenantSelectionTokenExpiration: text,
  tenants: z.array(z.object({ id: text, identifier: text, name: text })).check(z.minLength(1)),
});
const companySchema = z.object({ isAuthenticated: z.literal(false), requiresCompanySelection: z.literal(true),
  companySelectionToken: z.string().check(z.minLength(1)), companySelectionTokenExpiration: text,
  companies: z.array(company).check(z.minLength(1)),
});
export const loginResultSchema = z.union([sessionSchema, tenantSchema, companySchema]);
export type Session = z.infer<typeof sessionSchema>['user'];
export type LoginResult = z.infer<typeof loginResultSchema>;
export type Challenge = Exclude<LoginResult, z.infer<typeof sessionSchema>>;
export const csrfSchema = z.object({ requestToken: z.string().check(z.minLength(1)) });
export type Credentials = { userName: string; password: string };
