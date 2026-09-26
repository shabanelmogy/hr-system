import { describe, expect, it } from "vitest";
import { countChangedClaims, sortPermissionActions } from "./permissionPresentation";

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
      { displayValue: "Users:View", isSelected: true },
      { displayValue: "Users:Edit", isSelected: false },
    ];
    const current = [
      { displayValue: "Users:View", isSelected: false },
      { displayValue: "Users:Edit", isSelected: true },
    ];

    expect(countChangedClaims(current, baseline)).toBe(2);
    expect(countChangedClaims(baseline, baseline)).toBe(0);
  });
});
