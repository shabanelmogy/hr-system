import { z } from 'zod';

import type {
  AuthResponse,
  CompanySelectionResponse,
  TenantSelectionResponse,
  LoginOutcome,
  SessionResponse,
  UserPhoto,
} from '@/src/features/auth/types/auth';

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)));
const claimString = z.string().trim().min(1);

const authResponseSchema: z.ZodType<AuthResponse> = z.object({
  id: z.string().min(1),
  userName: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  tenantId: z.string().min(1),
  tenantName: z.string().trim().min(1),
  tenantPlanName: z.string().trim().min(1),
  companyId: z.number().int().positive(),
  token: z.string().min(1),
  tokenExpiration: dateString,
  refreshToken: z.string().min(1),
  refreshTokenExpiration: dateString,
});

const tenantSelectionSchema: z.ZodType<TenantSelectionResponse> = z.object({
  isAuthenticated: z.literal(false),
  requiresTenantSelection: z.literal(true),
  tenantSelectionToken: z.string().min(1),
  tenantSelectionTokenExpiration: dateString,
  tenants: z.array(z.object({
    id: z.string().min(1),
    identifier: z.string().min(1),
    name: z.string().min(1),
  })).min(2),
});

const companySelectionSchema: z.ZodType<CompanySelectionResponse> = z
  .object({
    isAuthenticated: z.literal(false),
    requiresCompanySelection: z.literal(true),
    companySelectionToken: z.string().min(1),
    companySelectionTokenExpiration: dateString,
    companies: z
      .array(
        z.object({
          id: z.number().int().positive(),
          nameAr: z.string(),
          nameEn: z.string(),
        }),
      )
      .min(2),
  })
  .superRefine((value, context) => {
    if (new Set(value.companies.map((company) => company.id)).size !== value.companies.length) {
      context.addIssue({
        code: 'custom',
        path: ['companies'],
        message: 'Company identifiers must be unique.',
      });
    }
  });

const sessionResponseSchema: z.ZodType<SessionResponse> = z.object({
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  tenantName: z.string().trim().min(1),
  tenantPlanName: z.string().trim().min(1),
  companyId: z.number().int().positive(),
  userName: z.string().min(1),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(claimString),
  permissions: z.array(claimString),
  tenantSubscriptionStatus: z.string().min(1),
  tenantSubscriptionEndsOn: dateString.nullable(),
  tenantReadOnly: z.boolean(),
  expiresAt: z.number().positive(),
});

const userPhotoSchema = z.object({
  profilePicture: z.string().nullable().optional(),
  contentType: z.string().nullable().optional(),
});

export function parseLoginOutcome(value: unknown): LoginOutcome {
  const authenticated = authResponseSchema.safeParse(value);
  if (authenticated.success) {
    return { kind: 'authenticated', response: authenticated.data };
  }
  const tenantSelection = tenantSelectionSchema.safeParse(value);
  if (tenantSelection.success) {
    return { kind: 'tenant-selection', response: tenantSelection.data };
  }


  const selection = companySelectionSchema.safeParse(value);
  if (selection.success) {
    return { kind: 'company-selection', response: selection.data };
  }

  throw new Error('The login response does not match the API contract.');
}

export const parseAuthResponse = (value: unknown): AuthResponse => authResponseSchema.parse(value);
export const parseSessionResponse = (value: unknown): SessionResponse =>
  sessionResponseSchema.parse(value);
export function parseUserPhoto(value: unknown): UserPhoto {
  const photo = userPhotoSchema.parse(value);

  return {
    profilePicture: photo.profilePicture ?? null,
    contentType: photo.contentType ?? null,
  };
}
