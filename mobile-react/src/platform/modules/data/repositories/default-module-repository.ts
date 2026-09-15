import type { ModuleRepository } from '../../domain/repositories/module-repository';
import type { ModuleRemoteDataSource } from '../remote/module-remote-data-source';

export class DefaultModuleRepository implements ModuleRepository {
  constructor(
    private readonly remote: ModuleRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Module catalog requires an internet connection.');
  }

  getAccessible() {
    this.requireOnline();
    return this.remote.getAccessible();
  }

  getInstalled() {
    this.requireOnline();
    return this.remote.getInstalled();
  }

  getTenantEntitlements() {
    this.requireOnline();
    return this.remote.getTenantEntitlements();
  }
}
