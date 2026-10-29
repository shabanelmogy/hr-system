// Preserve current Next tenant-workspace policy: global super_admin uses its dedicated administration surface.
export function tenantWorkspaceAllowed(identity: { readonly roles: readonly string[]; readonly tenantId?: string | null } | null): boolean {
  return Boolean(identity?.tenantId?.trim()) && !identity?.roles.some(role => role.trim().toLowerCase() === 'super_admin');
}
