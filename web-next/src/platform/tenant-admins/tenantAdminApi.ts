import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type { TenantAdminRequest, TenantAdminResponse } from "./types";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";

export const tenantAdminKeys = {
  all: ["tenant-admins"] as const,
};

export const tenantAdminApi = {
  getPage: (query: ManagementPageQuery) =>
    apiService.get<ManagementPageResponse<TenantAdminResponse>>(
      apiRoutes.tenantAdmins.getPage,
      { ...query },
    ),
  getAll: () =>
    apiService.get<TenantAdminResponse[]>(apiRoutes.tenantAdmins.getAll),
  create: (request: TenantAdminRequest) =>
    apiService.post<TenantAdminResponse>(apiRoutes.tenantAdmins.create, request),
  update: (id: string, request: TenantAdminRequest) =>
    apiService.put<TenantAdminResponse>(
      apiRoutes.tenantAdmins.update(id),
      request,
    ),
  delete: async (id: string) => {
    await apiService.delete(apiRoutes.tenantAdmins.delete(id));
  },
  restore: (id: string) =>
    apiService.post<TenantAdminResponse>(apiRoutes.tenantAdmins.restore(id)),
};
