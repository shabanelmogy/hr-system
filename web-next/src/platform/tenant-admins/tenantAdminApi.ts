import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type { TenantAdminRequest, TenantAdminResponse } from "./types";
import type { ManagementPageQuery, ManagementPageResponse } from "@/lib/api/pagination";
import {
  parseTenantAdminArrayResponse,
  parseTenantAdminPageResponse,
  parseTenantAdminResponse,
} from "./tenantAdminApiSchemas";

export { tenantAdminKeys } from "./tenantAdminQueryKeys";

export const tenantAdminApi = {
  getPage: async (query: ManagementPageQuery): Promise<ManagementPageResponse<TenantAdminResponse>> => {
    const response = await apiService.get<unknown>(
      apiRoutes.tenantAdmins.getPage,
      { ...query },
    );
    return parseTenantAdminPageResponse(response);
  },
  getAll: async (): Promise<TenantAdminResponse[]> => {
    const response = await apiService.get<unknown>(apiRoutes.tenantAdmins.getAll);
    return parseTenantAdminArrayResponse(response);
  },
  create: async (request: TenantAdminRequest): Promise<TenantAdminResponse> => {
    const response = await apiService.post<unknown>(apiRoutes.tenantAdmins.create, request);
    return parseTenantAdminResponse(response);
  },
  update: async (id: string, request: TenantAdminRequest): Promise<TenantAdminResponse> => {
    const response = await apiService.put<unknown>(
      apiRoutes.tenantAdmins.update(id),
      request,
    );
    return parseTenantAdminResponse(response);
  },
  delete: async (id: string) => {
    await apiService.delete(apiRoutes.tenantAdmins.delete(id));
  },
  restore: async (id: string): Promise<TenantAdminResponse> => {
    const response = await apiService.post<unknown>(apiRoutes.tenantAdmins.restore(id));
    return parseTenantAdminResponse(response);
  },
};
