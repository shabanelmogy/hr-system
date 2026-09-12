import type { TenantRepository } from '../../domain/repositories/tenant-repository';
import type { TenantRemoteDataSource } from '../remote/tenant-remote-data-source';

export class DefaultTenantRepository implements TenantRepository {
  constructor(
    private readonly remote: TenantRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Tenant administration requires an internet connection.');
  }

  getAll() {
    this.requireOnline();
    return this.remote.getAll();
  }

  getPage(query: Parameters<TenantRepository['getPage']>[0]) {
    this.requireOnline();
    return this.remote.getPage(query);
  }

  create(request: Parameters<TenantRepository['create']>[0]) {
    this.requireOnline();
    return this.remote.create(request);
  }

  update(id: string, request: Parameters<TenantRepository['update']>[1]) {
    this.requireOnline();
    return this.remote.update(id, request);
  }

  archive(id: string, request: Parameters<TenantRepository['archive']>[1]) {
    this.requireOnline();
    return this.remote.archive(id, request);
  }

  restore(id: string, rowVersion: string) {
    this.requireOnline();
    return this.remote.restore(id, rowVersion);
  }
}
