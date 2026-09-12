import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type {
  TenantManagementRequest,
  TenantManagementResponse,
} from "./types";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";

export const tenantKeys = {
  all: ["tenants"] as const,
  pages: () => [...tenantKeys.all, "page"] as const,
  page: (query: ManagementPageQuery) => [...tenantKeys.pages(), query] as const,
};

export const tenantApi = {
  getPage: (query: ManagementPageQuery) =>
    apiService.get<ManagementPageResponse<TenantManagementResponse>>(
      apiRoutes.tenants.getPage,
      { ...query },
    ),
  getAll: () =>
    apiService.get<TenantManagementResponse[]>(apiRoutes.tenants.getAll),
  create: (request: TenantManagementRequest) =>
    apiService.post<TenantManagementResponse>(apiRoutes.tenants.create, request),
  update: (id: string, request: TenantManagementRequest) =>
    apiService.put<TenantManagementResponse>(apiRoutes.tenants.update(id), request),
  archive: (id: string, reason: string, rowVersion: string, purgeScheduledOn?: string) =>
    apiService.post<TenantManagementResponse>(apiRoutes.tenants.archive(id), {
      reason,
      rowVersion,
      purgeScheduledOn: purgeScheduledOn ?? null,
    }),
  restore: (id: string, rowVersion: string) =>
    apiService.post<TenantManagementResponse>(apiRoutes.tenants.restore(id), { rowVersion }),
};
