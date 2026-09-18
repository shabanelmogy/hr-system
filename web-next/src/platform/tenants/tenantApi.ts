import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type {
  TenantDashboardSummaryResponse,
  TenantManagementRequest,
  TenantManagementResponse,
} from "./types";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";
import {
  parseTenantArrayResponse,
  parseTenantDashboardSummaryResponse,
  parseTenantPageResponse,
  parseTenantResponse,
} from "./tenantApiSchemas";

export { tenantKeys } from "./tenantQueryKeys";

export const tenantApi = {
  getPage: async (query: ManagementPageQuery): Promise<ManagementPageResponse<TenantManagementResponse>> => {
    const response = await apiService.get<unknown>(
      apiRoutes.tenants.getPage,
      { ...query },
    );
    return parseTenantPageResponse(response);
  },
  getAll: async (): Promise<TenantManagementResponse[]> => {
    const response = await apiService.get<unknown>(apiRoutes.tenants.getAll);
    return parseTenantArrayResponse(response);
  },
  getDashboardSummary: async (): Promise<TenantDashboardSummaryResponse> => {
    const response = await apiService.get<unknown>(apiRoutes.tenants.getDashboardSummary);
    return parseTenantDashboardSummaryResponse(response);
  },
  create: async (request: TenantManagementRequest): Promise<TenantManagementResponse> => {
    const response = await apiService.post<unknown>(apiRoutes.tenants.create, request);
    return parseTenantResponse(response);
  },
  update: async (id: string, request: TenantManagementRequest): Promise<TenantManagementResponse> => {
    const response = await apiService.put<unknown>(apiRoutes.tenants.update(id), request);
    return parseTenantResponse(response);
  },
  archive: async (id: string, reason: string, rowVersion: string, purgeScheduledOn?: string): Promise<TenantManagementResponse> => {
    const response = await apiService.post<unknown>(apiRoutes.tenants.archive(id), {
      reason,
      rowVersion,
      purgeScheduledOn: purgeScheduledOn ?? null,
    });
    return parseTenantResponse(response);
  },
  restore: async (id: string, rowVersion: string): Promise<TenantManagementResponse> => {
    const response = await apiService.post<unknown>(apiRoutes.tenants.restore(id), { rowVersion });
    return parseTenantResponse(response);
  },
};
