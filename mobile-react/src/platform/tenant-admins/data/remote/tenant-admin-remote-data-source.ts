import { apiService, toPageQuery } from '@/src/core/api';
import type {
  TenantAdmin,
  TenantAdminPage,
  TenantAdminPageQuery,
  TenantAdminRequest,
} from '../../domain/models/tenant-admin';
import { tenantAdminEndpoints } from './tenant-admin-endpoints';
import { tenantAdminPageSchema, tenantAdminSchema, tenantAdminsSchema } from './tenant-admin-schemas';

export interface TenantAdminRemoteDataSource {
  getAll(): Promise<TenantAdmin[]>;
  getPage(query: TenantAdminPageQuery): Promise<TenantAdminPage>;
  create(request: TenantAdminRequest): Promise<TenantAdmin>;
  update(id: string, request: TenantAdminRequest): Promise<TenantAdmin>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<TenantAdmin>;
}

export const tenantAdminRemoteDataSource: TenantAdminRemoteDataSource = {
  async getAll() {
    return tenantAdminsSchema.parse(await apiService.get<unknown>(tenantAdminEndpoints.getAll));
  },
  async getPage(query) {
    const queryString = toPageQuery(query);
    return tenantAdminPageSchema.parse(await apiService.get<unknown>(
      `${tenantAdminEndpoints.getPage}${queryString ? `?${queryString}` : ''}`,
    ));
  },
  async create(request) {
    return tenantAdminSchema.parse(await apiService.post<unknown, TenantAdminRequest>(
      tenantAdminEndpoints.create,
      request,
    ));
  },
  async update(id, request) {
    return tenantAdminSchema.parse(await apiService.put<unknown, TenantAdminRequest>(
      tenantAdminEndpoints.update(id),
      request,
    ));
  },
  async archive(id) {
    await apiService.delete<void>(tenantAdminEndpoints.archive(id));
  },
  async restore(id) {
    return tenantAdminSchema.parse(await apiService.post<unknown, undefined>(
      tenantAdminEndpoints.restore(id),
      undefined,
    ));
  },
};
