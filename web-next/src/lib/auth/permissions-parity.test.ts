import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { permissions } from "./permissions";

const backendPermissionsPath = new URL(
  "../../../../api/HrManagementSystem/Shared/Consts/Permissions.cs",
  import.meta.url,
);

describe("permission constants", () => {
  it("stays in exact parity with the backend constants", async () => {
    const source = await readFile(backendPermissionsPath, "utf8");
    const backendPermissions = Object.fromEntries(
      [...source.matchAll(/public\s+const\s+string\s+(\w+)\s*=\s*"([^"]+)"\s*;/g)]
        .map(([, name, value]) => [name, value]),
    );

    expect(backendPermissions).not.toEqual({});
    expect(permissions).toEqual(backendPermissions);
  });
});
