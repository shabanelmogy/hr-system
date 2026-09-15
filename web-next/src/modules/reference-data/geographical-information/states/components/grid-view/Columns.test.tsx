import { describe, expect, it } from "vitest";
import { useStateColumns } from "./Columns";

describe("state grid columns", () => {
  it("only exposes sorting supported by the States list API", () => {
    const columns = useStateColumns({
      t: (key) => key,
      permissions: { canView: true, canCreate: false, canEdit: false, canDelete: false, canRestore: false },
      getActions: () => [],
    });
    const byField = new Map(columns.map((column) => [column.field, column]));

    for (const field of ["id", "districtsCount", "updatedOn", "isDeleted", "actions"]) {
      expect(byField.get(field)?.sortable, field).toBe(false);
    }
    for (const field of ["nameAr", "nameEn", "code", "country", "createdOn"]) {
      expect(byField.get(field)?.sortable, field).not.toBe(false);
    }
  });
});
