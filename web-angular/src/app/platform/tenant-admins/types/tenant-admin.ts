import * as z from 'zod/mini';

const id = z.string().check(
  z.minLength(1),
  z.maxLength(200),
  z.refine((value) => value.trim() === value),
);
const timestamp = z
  .string()
  .check(
    z.refine((value) => /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))),
  );
const tenant = z.object({ id, identifier: z.string(), name: z.string(), isDefault: z.boolean() });
const admin = z.object({
  id,
  firstName: z.string(),
  lastName: z.string(),
  userName: z.string(),
  email: z.string(),
  isDisabled: z.boolean(),
  isLocked: z.boolean(),
  defaultTenantId: z.union([z.literal(''), id]),
  tenants: z.array(tenant),
  companyIds: z.array(z.int().check(z.minimum(1))),
  lifecycleStatus: z.enum(['active', 'archived']),
  archivedOn: z.nullable(timestamp),
  archiveReason: z.nullable(z.string()),
});
export type TenantAdmin = z.infer<typeof admin>;
export function parseTenantAdmin(value: unknown): TenantAdmin {
  const record = admin.parse(value);
  const defaults = record.tenants.filter((tenant) => tenant.isDefault);
  if (
    record.defaultTenantId
      ? defaults.length !== 1 || defaults[0]?.id !== record.defaultTenantId
      : defaults.length !== 0
  )
    throw Error('Invalid administrator default membership');
  if (
    new Set(record.tenants.map((item) => item.id)).size !== record.tenants.length ||
    new Set(record.companyIds).size !== record.companyIds.length
  )
    throw Error('Invalid administrator assignment identities');
  return record;
}
export function parseTenantAdmins(value: unknown): readonly TenantAdmin[] {
  const entries = z.array(z.unknown()).parse(value).map(parseTenantAdmin);
  if (
    new Set(entries.map((entry) => entry.id)).size !== entries.length ||
    entries.some((entry) => entry.lifecycleStatus !== 'active')
  )
    throw Error('Invalid administrator collection');
  return entries;
}
export function tenantAdminId(value: unknown): string {
  return id.parse(value);
}
export function tenantAdminAllowed(actor: { readonly roles: readonly string[] } | null): boolean {
  return !!actor && actor.roles.some((role) => role.trim().toLowerCase() === 'super_admin');
}
