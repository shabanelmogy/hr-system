import { describe, expect, it } from "vitest";
import { useCountryColumns } from "./Columns";

describe("country grid columns", () => {
  it("only exposes sorting supported by the Countries list API", () => {
    const columns = useCountryColumns({
      t: (key) => key,
      permissions: { canView: true, canEdit: false, canDelete: false, canRestore: false },
      getActions: () => [],
    });
    const byField = new Map(columns.map((column) => [column.field, column]));

    for (const field of ["id", "phoneCode", "statesCount", "updatedOn", "isDeleted", "actions"]) {
      expect(byField.get(field)?.sortable, field).toBe(false);
    }
    for (const field of ["nameAr", "nameEn", "alpha2Code", "alpha3Code", "currencyCode", "createdOn"]) {
      expect(byField.get(field)?.sortable, field).not.toBe(false);
    }
  });
});
