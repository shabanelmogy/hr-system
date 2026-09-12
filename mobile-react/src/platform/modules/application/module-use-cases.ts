import type { ErpModule } from '../domain/models/module';
import type { ModuleRepository } from '../domain/repositories/module-repository';

export interface ModuleUseCases {
  getAccessible(): Promise<ErpModule[]>;
  getInstalled(): Promise<ErpModule[]>;
}

export function createModuleUseCases(repository: ModuleRepository): ModuleUseCases {
  return {
    getAccessible: () => repository.getAccessible(),
    getInstalled: () => repository.getInstalled(),
  };
}
