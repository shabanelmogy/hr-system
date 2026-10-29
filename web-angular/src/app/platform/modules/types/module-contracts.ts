import * as z from 'zod/mini';

const code = z.string().check(z.regex(/^[a-z][a-z0-9-]*$/i));
const areaSchema = z.object({ code, name: z.string(), requiredPermissions: z.array(z.string()), entryPath: z.nullable(z.string()) });
const moduleSchema = z.object({ code, name: z.string(), isDefault: z.boolean(), submodules: z.array(areaSchema) });
const catalogSchema = z.array(moduleSchema);
export type AccessibleModule = z.infer<typeof moduleSchema>;

export function parseModuleCatalog(value: unknown): readonly AccessibleModule[] {
  const modules = catalogSchema.parse(value);
  const unique = (codes: readonly string[]) => new Set(codes.map(c => c.toLowerCase())).size === codes.length;
  if (!unique(modules.map(m => m.code)) || modules.some(m => !unique(m.submodules.map(a => a.code)))) {
    throw new Error('Duplicate module catalog identity.');
  }
  return modules.map(m => ({ ...m, code: m.code.toLowerCase(), submodules: m.submodules.map(a => ({ ...a, code: a.code.toLowerCase() })) }));
}
