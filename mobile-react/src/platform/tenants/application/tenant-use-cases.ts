import type {
  TenantManagementRequest,
  TenantManagementResponse,
  TenantPage,
  TenantPageQuery,
} from '../domain/models/tenant';
import type {
  TenantArchiveRequest,
  TenantRepository,
} from '../domain/repositories/tenant-repository';

export interface TenantUseCases {
  getAll(): Promise<TenantManagementResponse[]>;
  getPage(query: TenantPageQuery): Promise<TenantPage>;
  save(input: {
    id: string | null;
    request: TenantManagementRequest;
  }): Promise<TenantManagementResponse>;
  archive(id: string, request: TenantArchiveRequest): Promise<TenantManagementResponse>;
  restore(id: string, rowVersion: string): Promise<TenantManagementResponse>;
}

export function createTenantUseCases(repository: TenantRepository): TenantUseCases {
  return {
    getAll: () => repository.getAll(),
    getPage: (query) => repository.getPage(query),
    save: ({ id, request }) => (
      id ? repository.update(id, request) : repository.create(request)
    ),
    archive: (id, request) => repository.archive(id, request),
    restore: (id, rowVersion) => repository.restore(id, rowVersion),
  };
}
