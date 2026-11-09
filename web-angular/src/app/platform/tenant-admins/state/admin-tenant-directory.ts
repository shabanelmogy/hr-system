import type { TenantAdmin } from '../types/tenant-admin';

interface TenantIdentity {
  readonly id: string;
  readonly name: string;
  readonly identifier: string;
}
export interface AdminTenantGroup {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly admins: readonly TenantAdmin[];
}
/** Lookup names take precedence; saved memberships remain visible when lookup is unavailable. */
export function adminTenantDirectory(
  admins: readonly TenantAdmin[],
  tenants: readonly TenantIdentity[],
  unassignedLabel: string,
): AdminTenantGroup[] {
  const groups = new Map<
    string,
    { id: string; label: string; description: string; admins: TenantAdmin[] }
  >();
  const add = (tenant: TenantIdentity) => {
    const id = 'tenant:' + tenant.id;
    let group = groups.get(id);
    if (!group) {
      group = { id, label: tenant.name, description: tenant.identifier, admins: [] };
      groups.set(id, group);
    }
    return group;
  };
  for (const tenant of tenants) add(tenant);
  const unassigned: TenantAdmin[] = [];
  for (const admin of admins) {
    if (!admin.tenants.length) unassigned.push(admin);
    for (const tenant of admin.tenants) add(tenant).admins.push(admin);
  }
  if (unassigned.length)
    groups.set('unassigned', {
      id: 'unassigned',
      label: unassignedLabel,
      description: '',
      admins: unassigned,
    });
  return [...groups.values()];
}
