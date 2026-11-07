export function systemAuditAllowed(
  actor: { readonly roles: readonly string[]; readonly permissions: readonly string[] } | null,
): boolean {
  return (
    !!actor &&
    actor.roles.some((role) => role.trim().toLowerCase() === 'super_admin') &&
    actor.permissions.includes('SystemAuditTrail:View')
  );
}
