import type {
  TenantManagementRequest,
  TenantManagementResponse,
  TenantPage,
  TenantPageQuery,
} from '../models/tenant';

export interface TenantArchiveRequest {
  reason: string;
  rowVersion: string;
  purgeScheduledOn?: string | null;
}

export interface TenantRepository {
  getAll(): Promise<TenantManagementResponse[]>;
  getPage(query: TenantPageQuery): Promise<TenantPage>;
  create(request: TenantManagementRequest): Promise<TenantManagementResponse>;
  update(id: string, request: TenantManagementRequest): Promise<TenantManagementResponse>;
  archive(id: string, request: TenantArchiveRequest): Promise<TenantManagementResponse>;
  restore(id: string, rowVersion: string): Promise<TenantManagementResponse>;
}
