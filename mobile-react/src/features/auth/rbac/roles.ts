export const appRoles = {
  superAdmin: 'super_admin',
  admin: 'admin',
  user: 'user',
} as const;

export type AppRole = (typeof appRoles)[keyof typeof appRoles];

export function hasAnyRole(
  userRoles: readonly string[],
  requiredRoles: readonly string[],
): boolean {
  const normalizedRoles = new Set(userRoles.map((role) => role.toLowerCase()));
  return requiredRoles.some((role) => normalizedRoles.has(role.toLowerCase()));
}
