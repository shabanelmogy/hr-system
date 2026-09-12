import { apiService } from '@/src/core/api';
import type { ErpModule } from '../../domain/models/module';
import { moduleEndpoints } from './module-endpoints';
import { erpModulesSchema } from './module-schemas';

export interface ModuleRemoteDataSource {
  getAccessible(): Promise<ErpModule[]>;
  getInstalled(): Promise<ErpModule[]>;
}

export const moduleRemoteDataSource: ModuleRemoteDataSource = {
  async getAccessible() {
    return erpModulesSchema.parse(await apiService.get<unknown>(moduleEndpoints.accessible));
  },
  async getInstalled() {
    return erpModulesSchema.parse(await apiService.get<unknown>(moduleEndpoints.installed));
  },
};
