import { apiService, toPageQuery } from '@/src/core/api';
import type {
  TenantManagementRequest,
  TenantManagementResponse,
  TenantPage,
  TenantPageQuery,
} from '../../domain/models/tenant';
import type { TenantArchiveRequest } from '../../domain/repositories/tenant-repository';
import { tenantEndpoints } from './tenant-endpoints';
import { tenantListSchema, tenantPageSchema, tenantSchema } from './tenant-schemas';

export interface TenantRemoteDataSource {
  getAll(): Promise<TenantManagementResponse[]>;
  getPage(query: TenantPageQuery): Promise<TenantPage>;
  create(request: TenantManagementRequest): Promise<TenantManagementResponse>;
  update(id: string, request: TenantManagementRequest): Promise<TenantManagementResponse>;
  archive(id: string, request: TenantArchiveRequest): Promise<TenantManagementResponse>;
  restore(id: string, rowVersion: string): Promise<TenantManagementResponse>;
}

export const tenantRemoteDataSource: TenantRemoteDataSource = {
  async getAll() {
    return tenantListSchema.parse(await apiService.get<unknown>(tenantEndpoints.getAll));
  },
  async getPage(query) {
    const queryString = toPageQuery(query);
    return tenantPageSchema.parse(await apiService.get<unknown>(
      `${tenantEndpoints.getPage}${queryString ? `?${queryString}` : ''}`,
    ));
  },
  async create(request) {
    return tenantSchema.parse(await apiService.post<unknown, TenantManagementRequest>(
      tenantEndpoints.create,
      request,
    ));
  },
  async update(id, request) {
    return tenantSchema.parse(await apiService.put<unknown, TenantManagementRequest>(
      tenantEndpoints.update(id),
      request,
    ));
  },
  async archive(id, request) {
    return tenantSchema.parse(await apiService.post<unknown, TenantArchiveRequest>(
      tenantEndpoints.archive(id),
      request,
    ));
  },
  async restore(id, rowVersion) {
    return tenantSchema.parse(await apiService.post<unknown, { rowVersion: string }>(
      tenantEndpoints.restore(id),
      { rowVersion },
    ));
  },
};
