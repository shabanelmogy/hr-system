import { appRoutes } from "@/config/routes";
import { permissions, type PermissionString } from "@/lib/auth/permissions";

export type TenantAdministrationLauncherEntry = {
  code: "tenant-roles-permissions" | "tenant-users";
  href: string;
  requiredPermission: PermissionString;
};

export const tenantAdministrationLauncherEntries: readonly TenantAdministrationLauncherEntry[] = [
  {
    code: "tenant-roles-permissions",
    href: appRoutes.platform.administration.roles,
    requiredPermission: permissions.ViewRoles,
  },
  {
    code: "tenant-users",
    href: appRoutes.platform.administration.users,
    requiredPermission: permissions.ViewUsers,
  },
];

export function getTenantAdministrationLauncherEntries(
  hasPermission: (permission: PermissionString) => boolean,
) {
  return tenantAdministrationLauncherEntries.filter((entry) =>
    hasPermission(entry.requiredPermission),
  );
}
