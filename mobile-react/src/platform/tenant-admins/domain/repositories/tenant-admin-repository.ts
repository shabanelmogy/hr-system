import type {
  TenantAdmin,
  TenantAdminPage,
  TenantAdminPageQuery,
  TenantAdminRequest,
} from '../models/tenant-admin';

export interface TenantAdminRepository {
  getAll(): Promise<TenantAdmin[]>;
  getPage(query: TenantAdminPageQuery): Promise<TenantAdminPage>;
  create(request: TenantAdminRequest): Promise<TenantAdmin>;
  update(id: string, request: TenantAdminRequest): Promise<TenantAdmin>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<TenantAdmin>;
}
