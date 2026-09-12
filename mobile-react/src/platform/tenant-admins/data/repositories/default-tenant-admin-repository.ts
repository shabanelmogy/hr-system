import type { TenantAdminRepository } from '../../domain/repositories/tenant-admin-repository';
import type { TenantAdminRemoteDataSource } from '../remote/tenant-admin-remote-data-source';

export class DefaultTenantAdminRepository implements TenantAdminRepository {
  constructor(
    private readonly remote: TenantAdminRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Tenant administration requires an internet connection.');
  }

  getAll() { this.requireOnline(); return this.remote.getAll(); }
  getPage(query: Parameters<TenantAdminRepository['getPage']>[0]) { this.requireOnline(); return this.remote.getPage(query); }
  create(request: Parameters<TenantAdminRepository['create']>[0]) { this.requireOnline(); return this.remote.create(request); }
  update(id: string, request: Parameters<TenantAdminRepository['update']>[1]) { this.requireOnline(); return this.remote.update(id, request); }
  async archive(id: string) { this.requireOnline(); await this.remote.archive(id); }
  restore(id: string) { this.requireOnline(); return this.remote.restore(id); }
}
