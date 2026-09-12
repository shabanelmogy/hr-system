import { z } from 'zod';

import { pageMetadataSchema } from '@/src/core/api';
import type {
  ManagedUser,
  RoleOption,
  RoleWithClaims,
  UserCompanyOption,
  UserInvitation,
} from '../../domain/models/administration';

export const managedUserSchema: z.ZodType<ManagedUser> = z.object({
  id: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  isDisabled: z.boolean(),
  isLocked: z.boolean(),
  profilePicture: z.string().nullable(),
  roles: z.array(z.string()),
  companyIds: z.array(z.number().int().positive()),
  defaultCompanyId: z.number().int().positive().nullable(),
  lifecycleStatus: z.enum(['active', 'archived']),
  archivedOn: z.string().nullable(),
  archiveReason: z.string().nullable(),
});

export const companyOptionSchema: z.ZodType<UserCompanyOption> = z.object({
  id: z.number().int().positive(),
  nameAr: z.string(),
  nameEn: z.string(),
  isActive: z.boolean(),
});

const roleClaimSchema = z.object({
  displayValue: z.string().trim().min(1),
  isSelected: z.boolean(),
});

const roleOptionObjectSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  isSystem: z.boolean(),
  isDeleted: z.boolean(),
  roleClaims: z.array(roleClaimSchema).nullable(),
});

export const roleOptionSchema: z.ZodType<RoleOption> = roleOptionObjectSchema;

export const roleWithClaimsSchema: z.ZodType<RoleWithClaims> = roleOptionObjectSchema.extend({
  roleClaims: z.array(roleClaimSchema),
});

export const userInvitationSchema: z.ZodType<UserInvitation> = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  companyIds: z.array(z.number().int().positive()),
  defaultCompanyId: z.number().int().positive(),
  status: z.enum(['pending', 'accepted', 'revoked', 'expired']),
  expiresOn: z.string(),
  createdOn: z.string(),
  acceptedOn: z.string().nullable(),
  revokedOn: z.string().nullable(),
});

export const managedUserPageSchema = z.object({
  items: z.array(managedUserSchema),
  metaData: pageMetadataSchema,
});
