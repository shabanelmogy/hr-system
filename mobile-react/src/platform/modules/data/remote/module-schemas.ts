import { z } from 'zod';
import type { ErpModule, ModuleSubmodule } from '../../domain/models/module';

export const moduleSubmoduleSchema: z.ZodType<ModuleSubmodule> = z.object({
  code: z.string(),
  name: z.string(),
  requiredPermissions: z.array(z.string()),
  entryPath: z.string().nullable().optional(),
});
export const erpModuleSchema: z.ZodType<ErpModule> = z.object({
  code: z.string(),
  name: z.string(),
  submodules: z.array(moduleSubmoduleSchema),
  isDefault: z.boolean().optional(),
});
export const erpModulesSchema: z.ZodType<ErpModule[]> = z.array(erpModuleSchema);
