import type { ModuleRepository } from '../../domain/repositories/module-repository';
import type { ModuleRemoteDataSource } from '../remote/module-remote-data-source';
import type { ErpModule } from '../../domain/models/module';

export const MODULE_CATALOG_CACHE_NAMESPACE = 'platform.module-catalog';
export class ModuleCatalogUnavailableError extends Error {
  constructor(message = 'Module catalog is unavailable offline.') {
    super(message);
    this.name = 'ModuleCatalogUnavailableError';
  }
}

export interface ModuleCatalogCache {
  read(key: string): Promise<ErpModule[] | null>;
  write(key: string, modules: ErpModule[]): Promise<void>;
}

export class DefaultModuleRepository implements ModuleRepository {
  constructor(
    private readonly remote: ModuleRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
    private readonly cache?: ModuleCatalogCache,
  ) {}

  private async readThrough(key: string, load: () => Promise<ErpModule[]>): Promise<ErpModule[]> {
    if (this.isOnline()) {
      const modules = await load();
      await this.cache?.write(key, modules);
      return modules;
    }
    const cached = await this.cache?.read(key);
    if (cached) return cached;
    throw new ModuleCatalogUnavailableError();
  }

  getAccessible() {
    return this.readThrough('accessible', () => this.remote.getAccessible());
  }

  getInstalled() {
    return this.readThrough('installed', () => this.remote.getInstalled());
  }

  getTenantEntitlements() {
    return this.readThrough('tenant-entitlements', () => this.remote.getTenantEntitlements());
  }
}
