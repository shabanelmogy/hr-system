import { describe, expect, it } from "vitest";
import { accountingModuleDefinition } from "./moduleDefinition";

describe("Accounting frontend module definition", () => {
  it("matches the current backend catalog code without inventing business submodules", () => {
    expect(accountingModuleDefinition.code).toBe("acc");
    expect(accountingModuleDefinition.submodules).toEqual([]);
  });

  it("lazy-loads English and Arabic module translations", async () => {
    await expect(accountingModuleDefinition.loadTranslations?.("en")).resolves.toEqual({
      name: "Accounting",
    });
    await expect(accountingModuleDefinition.loadTranslations?.("ar")).resolves.toEqual({
      name: "الحسابات",
    });
  });
});
