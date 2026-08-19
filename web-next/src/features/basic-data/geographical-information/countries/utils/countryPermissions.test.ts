import { describe, expect, it } from "vitest";
import { canRunCountryAction, type CountryPermissionSet } from "./countryPermissions";

const all: CountryPermissionSet = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canRestore: true,
};

describe("country action guards", () => {
  it("allows archive/edit only for active rows and restore only for archived rows", () => {
    expect(canRunCountryAction("edit", all, { isDeleted: false })).toBe(true);
    expect(canRunCountryAction("archive", all, { isDeleted: false })).toBe(true);
    expect(canRunCountryAction("restore", all, { isDeleted: false })).toBe(false);
    expect(canRunCountryAction("edit", all, { isDeleted: true })).toBe(false);
    expect(canRunCountryAction("archive", all, { isDeleted: true })).toBe(false);
    expect(canRunCountryAction("restore", all, { isDeleted: true })).toBe(true);
  });

  it("fails closed when the permission is absent", () => {
    const none = Object.fromEntries(Object.keys(all).map((key) => [key, false])) as unknown as CountryPermissionSet;
    expect(canRunCountryAction("view", none)).toBe(false);
    expect(canRunCountryAction("create", none)).toBe(false);
    expect(canRunCountryAction("edit", none, { isDeleted: false })).toBe(false);
    expect(canRunCountryAction("archive", none, { isDeleted: false })).toBe(false);
    expect(canRunCountryAction("restore", none, { isDeleted: true })).toBe(false);
  });
});

