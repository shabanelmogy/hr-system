import type {
  TenantAdmin,
  TenantAdminPage,
  TenantAdminPageQuery,
  TenantAdminRequest,
} from '../domain/models/tenant-admin';
import type { TenantAdminRepository } from '../domain/repositories/tenant-admin-repository';

export interface TenantAdminUseCases {
  getAll(): Promise<TenantAdmin[]>;
  getPage(query: TenantAdminPageQuery): Promise<TenantAdminPage>;
  save(input: { id: string | null; request: TenantAdminRequest }): Promise<TenantAdmin>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<TenantAdmin>;
}

export function createTenantAdminUseCases(repository: TenantAdminRepository): TenantAdminUseCases {
  return {
    getAll: () => repository.getAll(),
    getPage: (query) => repository.getPage(query),
    save: ({ id, request }) => id ? repository.update(id, request) : repository.create(request),
    archive: (id) => repository.archive(id),
    restore: (id) => repository.restore(id),
  };
}
