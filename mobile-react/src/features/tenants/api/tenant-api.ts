import { z } from 'zod';

import { apiService, pageMetadataSchema, toPageQuery } from '@/src/core/api';
import type { PageQuery, PageResponse } from '@/src/core/api';
import { subscriptionStatuses } from '@/src/features/tenants/types/tenant';
import type {
  TenantManagementRequest,
  TenantManagementResponse,
} from '@/src/features/tenants/types/tenant';

const tenantSchema = z.object({
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
});

const tenantListSchema = z.array(tenantSchema);
const tenantPageSchema = z.object({
  items: tenantListSchema,
  metaData: pageMetadataSchema,
});

const TENANT_ENDPOINTS = {
  getAll: 'tenants/getAll',
  getPage: 'tenants/getPage',
  create: 'tenants/create',
  update: (id: string) => `tenants/update/${id}`,
  archive: (id: string) => `tenants/archive/${id}`,
  restore: (id: string) => `tenants/restore/${id}`,
} as const;

export const tenantApi = {
  async getPage(query: PageQuery): Promise<PageResponse<TenantManagementResponse>> {
    const queryString = toPageQuery(query);
    return tenantPageSchema.parse(await apiService.get<unknown>(
      `${TENANT_ENDPOINTS.getPage}${queryString ? `?${queryString}` : ''}`,
    ));
  },

  async getAll(): Promise<TenantManagementResponse[]> {
    return tenantListSchema.parse(await apiService.get<unknown>(TENANT_ENDPOINTS.getAll));
  },

  async create(request: TenantManagementRequest): Promise<TenantManagementResponse> {
    const response = await apiService.post<unknown, TenantManagementRequest>(
      TENANT_ENDPOINTS.create,
      request,
    );
    return tenantSchema.parse(response);
  },

  async update(
    id: string,
    request: TenantManagementRequest,
  ): Promise<TenantManagementResponse> {
    const response = await apiService.put<unknown, TenantManagementRequest>(
      TENANT_ENDPOINTS.update(id),
      request,
    );
    return tenantSchema.parse(response);
  },

  async archive(
    id: string,
    request: { reason: string; rowVersion: string; purgeScheduledOn?: string | null },
  ): Promise<TenantManagementResponse> {
    return tenantSchema.parse(await apiService.post<unknown, typeof request>(
      TENANT_ENDPOINTS.archive(id),
      request,
    ));
  },

  async restore(id: string, rowVersion: string): Promise<TenantManagementResponse> {
    return tenantSchema.parse(await apiService.post<unknown, { rowVersion: string }>(
      TENANT_ENDPOINTS.restore(id),
      { rowVersion },
    ));
  },
};
