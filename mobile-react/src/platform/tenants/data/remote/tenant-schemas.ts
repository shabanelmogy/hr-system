import { z } from 'zod';

import { pageMetadataSchema } from '@/src/core/api';
import { subscriptionStatuses } from '../../domain/models/tenant';
import type { TenantManagementResponse } from '../../domain/models/tenant';

export const tenantSchema: z.ZodType<TenantManagementResponse> = z.object({
  id: z.string().min(1),
  identifier: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  subscriptionStatus: z.enum(subscriptionStatuses),
  subscriptionStartedOn: z.string(),
  subscriptionEndsOn: z.string().nullable(),
  planName: z.string().nullable(),
  maxAdmins: z.number().int().nonnegative(),
  maxUsers: z.number().int().nonnegative(),
  adminCount: z.number().int().nonnegative(),
  userCount: z.number().int().nonnegative(),
  totalUserCount: z.number().int().nonnegative(),
  companyCount: z.number().int().nonnegative(),
  billingEmail: z.string().nullable(),
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
  notes: z.string().nullable(),
  createdOn: z.string(),
  updatedOn: z.string().nullable(),
  lifecycleStatus: z.enum(['active', 'archived', 'purgeScheduled']),
  archivedOn: z.string().nullable(),
  archiveReason: z.string().nullable(),
  purgeScheduledOn: z.string().nullable(),
  rowVersion: z.string(),
  entitlements: z.array(z.object({
    moduleCode: z.string(),
    submoduleCodes: z.array(z.string()),
  })).nullable().optional(),
});

export const tenantListSchema = z.array(tenantSchema);

export const tenantPageSchema = z.object({
  items: tenantListSchema,
  metaData: pageMetadataSchema,
});
