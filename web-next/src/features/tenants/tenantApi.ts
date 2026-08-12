import { apiRoutes } from "@/config/api";
import apiService from "@/shared/services/apiService";
import type {
  TenantManagementRequest,
  TenantManagementResponse,
} from "./types";

export const tenantKeys = {
  all: ["tenants"] as const,
};

export const tenantApi = {
  getAll: () =>
    apiService.get<TenantManagementResponse[]>(apiRoutes.tenants.getAll),
  create: (request: TenantManagementRequest) =>
    apiService.post<TenantManagementResponse>(apiRoutes.tenants.create, request),
  update: (id: string, request: TenantManagementRequest) =>
    apiService.put<TenantManagementResponse>(apiRoutes.tenants.update(id), request),
};
