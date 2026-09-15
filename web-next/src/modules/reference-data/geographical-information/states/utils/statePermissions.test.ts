import { describe, expect, it } from "vitest";
import { canRunStateAction, type StatePermissionSet } from "./statePermissions";

const all: StatePermissionSet = { canView: true, canCreate: true, canEdit: true, canDelete: true, canRestore: true };
describe("State action guards", () => {
  it("allows active edit/archive and archived restore only", () => {
    expect(canRunStateAction("edit", all, { isDeleted: false })).toBe(true);
    expect(canRunStateAction("archive", all, { isDeleted: false })).toBe(true);
    expect(canRunStateAction("restore", all, { isDeleted: false })).toBe(false);
    expect(canRunStateAction("edit", all, { isDeleted: true })).toBe(false);
    expect(canRunStateAction("archive", all, { isDeleted: true })).toBe(false);
    expect(canRunStateAction("restore", all, { isDeleted: true })).toBe(true);
  });
});
