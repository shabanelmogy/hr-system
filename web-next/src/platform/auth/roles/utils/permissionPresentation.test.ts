import { describe, expect, it } from "vitest";
import {
  countChangedClaims,
  sortPermissionActions,
  summarizePermissionBusinessModules,
} from "./permissionPresentation";

describe("permission presentation", () => {
  it("keeps common CRUD actions in workflow order before specialized actions", () => {
    expect(sortPermissionActions(["Delete", "Export", "Edit", "View", "Create"])).toEqual([
      "View",
      "Create",
      "Edit",
      "Delete",
      "Export",
    ]);
  });

  it("counts selection changes against the last saved baseline", () => {
    const baseline = [
      { displayValue: "Users:View", moduleCode: "platform", isSelected: true },
      { displayValue: "Users:Edit", moduleCode: "platform", isSelected: false },
    ];
    const current = [
      { displayValue: "Users:View", moduleCode: "platform", isSelected: false },
      { displayValue: "Users:Edit", moduleCode: "platform", isSelected: true },
    ];

    expect(countChangedClaims(current, baseline)).toBe(2);
    expect(countChangedClaims(baseline, baseline)).toBe(0);
  });

  it("summarizes authoritative business modules without losing screen counts", () => {
    const summaries = summarizePermissionBusinessModules([
      { displayValue: "Users:View", moduleCode: "platform", isSelected: true },
      { displayValue: "Users:Edit", moduleCode: "platform", isSelected: false },
      { displayValue: "Roles:View", moduleCode: "platform", isSelected: true },
      { displayValue: "Accounts:View", moduleCode: "acc", isSelected: false },
    ]);

    expect(summaries).toEqual([
      { code: "acc", permissionCount: 1, screenCount: 1, selectedCount: 0 },
      { code: "platform", permissionCount: 3, screenCount: 2, selectedCount: 2 },
    ]);
  });
});
