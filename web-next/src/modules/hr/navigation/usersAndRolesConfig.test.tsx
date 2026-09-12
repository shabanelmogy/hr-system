import { describe, expect, it } from "vitest";
import { appRoutes } from "@/config/routes";
import { permissions } from "@/lib/auth/permissions";
import { getUsersAndRolesConfig } from "./usersAndRolesConfig";

describe("Administration navigation", () => {
  it("exposes Offline Operations only through the canonical manage permission", () => {
    const section = getUsersAndRolesConfig();
    const item = section.items?.find(({ path }) => path === appRoutes.auth.offlineOperationsPage);

    expect(item).toBeDefined();
    expect(item?.title).toBe("menu.offlineOperations");
    expect(item?.permissions).toEqual([permissions.ManageOfflineOperations]);
  });
});
