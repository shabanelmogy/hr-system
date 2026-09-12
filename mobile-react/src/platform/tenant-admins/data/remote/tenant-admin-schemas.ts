import { z } from 'zod';
import { pageMetadataSchema } from '@/src/core/api';
import type { TenantAdmin } from '../../domain/models/tenant-admin';

export const tenantAdminSchema: z.ZodType<TenantAdmin> = z.object({
  id: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  isDisabled: z.boolean(),
  isLocked: z.boolean(),
  defaultTenantId: z.string().min(1),
  tenants: z.array(z.object({
    id: z.string().min(1),
    identifier: z.string(),
    name: z.string(),
    isDefault: z.boolean(),
  })),
  companyIds: z.array(z.number().int().positive()),
  lifecycleStatus: z.enum(['active', 'archived']),
  archivedOn: z.string().nullable(),
  archiveReason: z.string().nullable(),
});

export const tenantAdminPageSchema = z.object({
  items: z.array(tenantAdminSchema),
  metaData: pageMetadataSchema,
});

export const tenantAdminsSchema = z.array(tenantAdminSchema);
