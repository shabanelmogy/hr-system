import { describe, expect, it } from "vitest";
import { toTenantPageQuery } from "./tenantPageQuery";

describe("toTenantPageQuery", () => {
  it("maps the zero-based UI page to the tenant API contract", () => {
    expect(toTenantPageQuery({
      page: 2,
      pageSize: 25,
      searchValue: "immediate value is ignored",
      columnName: "createdOn",
      sortDirection: "DESC",
      filters: { includeArchived: false },
    }, "Acme")).toEqual({
      pageNumber: 3,
      pageSize: 25,
      searchValue: "Acme",
      columnName: "createdOn",
      sortDirection: "DESC",
      includeArchived: false,
    });
  });

  it("omits an empty debounced search value", () => {
    expect(toTenantPageQuery({
      page: 0,
      pageSize: 10,
      searchValue: "",
      columnName: "name",
      sortDirection: "ASC",
      filters: { includeArchived: false },
    }, "").searchValue).toBeUndefined();
  });
});
