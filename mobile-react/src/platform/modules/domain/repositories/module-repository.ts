import type { ErpModule } from '../models/module';

export interface ModuleRepository {
  getAccessible(): Promise<ErpModule[]>;
  getInstalled(): Promise<ErpModule[]>;
  getTenantEntitlements(): Promise<ErpModule[]>;
}
