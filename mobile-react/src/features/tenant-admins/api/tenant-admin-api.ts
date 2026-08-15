import { z } from 'zod';

import { apiService, pageMetadataSchema, toPageQuery } from '@/src/core/api';
import type { PageQuery, PageResponse } from '@/src/core/api';
import type {
  TenantAdmin,
  TenantAdminRequest,
} from '@/src/features/tenant-admins/types/tenant-admin';

const tenantAdminSchema: z.ZodType<TenantAdmin> = z.object({
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

const endpoints = {
  getAll: 'tenantAdmins/getAll',
  getPage: 'tenantAdmins/getPage',
  create: 'tenantAdmins/create',
  update: (id: string) => `tenantAdmins/update/${id}`,
  delete: (id: string) => `tenantAdmins/delete/${id}`,
  restore: (id: string) => `tenantAdmins/restore/${id}`,
} as const;

export const tenantAdminApi = {
  async getPage(query: PageQuery): Promise<PageResponse<TenantAdmin>> {
    const queryString = toPageQuery(query);
    return z.object({
      items: z.array(tenantAdminSchema),
      metaData: pageMetadataSchema,
    }).parse(await apiService.get<unknown>(
      `${endpoints.getPage}${queryString ? `?${queryString}` : ''}`,
    ));
  },
  async getAll(): Promise<TenantAdmin[]> {
    return z.array(tenantAdminSchema).parse(
      await apiService.get<unknown>(endpoints.getAll),
    );
  },
  async create(request: TenantAdminRequest): Promise<TenantAdmin> {
    return tenantAdminSchema.parse(
      await apiService.post<unknown, TenantAdminRequest>(endpoints.create, request),
    );
  },
  async update(id: string, request: TenantAdminRequest): Promise<TenantAdmin> {
    return tenantAdminSchema.parse(
      await apiService.put<unknown, TenantAdminRequest>(endpoints.update(id), request),
    );
  },
  async delete(id: string): Promise<void> {
    await apiService.delete<void>(endpoints.delete(id));
  },
  async restore(id: string): Promise<TenantAdmin> {
    return tenantAdminSchema.parse(
      await apiService.post<unknown, undefined>(endpoints.restore(id), undefined),
    );
  },
};
