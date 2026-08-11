import { z } from 'zod';

import { apiService } from '@/src/core/api';
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
});

const tenantListSchema = z.array(tenantSchema);

const TENANT_ENDPOINTS = {
  getAll: 'tenants/getAll',
  create: 'tenants/create',
  update: (id: string) => `tenants/update/${id}`,
} as const;

export const tenantApi = {
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
};
