import { describe, expect, it } from "vitest";

import type { ErpModule } from "@/platform/modules";
import {
  createDefaultEntitlements,
  hydrateEntitlements,
  toggleModuleEntitlement,
} from "./entitlements";

const modules: ErpModule[] = [
  {
    code: "hr",
    name: "HR",
    isDefault: true,
    submodules: [
      { code: "basic-data", name: "Basic data", requiredPermissions: [], entryPath: null },
      { code: "recruitment", name: "Recruitment", requiredPermissions: [], entryPath: null },
    ],
  },
  { code: "acc", name: "Accounting", isDefault: false, submodules: [] },
];

describe("tenant module entitlements", () => {
  it("uses catalog defaults for a new tenant", () => {
    expect(createDefaultEntitlements(modules)).toEqual([
      { moduleCode: "hr", submoduleCodes: ["basic-data", "recruitment"] },
    ]);
  });

  it("keeps HR submodules when Accounting is selected", () => {
    const initial = createDefaultEntitlements(modules);
    const updated = toggleModuleEntitlement(initial, modules[1], true);

    expect(updated).toEqual([
      { moduleCode: "hr", submoduleCodes: ["basic-data", "recruitment"] },
      { moduleCode: "acc", submoduleCodes: [] },
    ]);
  });

  it("drops modules and submodules absent from the tenant entitlement catalog", () => {
    expect(hydrateEntitlements([
      { moduleCode: "hr", submoduleCodes: ["basic-data", "geography"] },
      { moduleCode: "platform", submoduleCodes: ["identity"] },
    ], modules)).toEqual([
      { moduleCode: "hr", submoduleCodes: ["basic-data"] },
    ]);
  });
});
