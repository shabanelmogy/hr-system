import { describe, expect, it } from "vitest";
import { permissions } from "@/lib/auth/permissions";
import { getTenantAdministrationLauncherEntries } from "./tenantAdministrationLauncher";

describe("tenant administration launcher", () => {
  it("shows no administration actions without view permissions", () => {
    expect(getTenantAdministrationLauncherEntries(() => false)).toEqual([]);
  });

  it("maps roles and users to their exact view permissions", () => {
    expect(
      getTenantAdministrationLauncherEntries((permission) => permission === permissions.ViewRoles),
    ).toMatchObject([
      {
        code: "tenant-roles-permissions",
        requiredPermission: permissions.ViewRoles,
      },
    ]);
    expect(
      getTenantAdministrationLauncherEntries((permission) => permission === permissions.ViewUsers),
    ).toMatchObject([
      { code: "tenant-users", requiredPermission: permissions.ViewUsers },
    ]);
  });
});
