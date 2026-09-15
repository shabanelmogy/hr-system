import { describe, expect, it } from "vitest";
import { toStatePageQuery } from "./statePageQuery";

describe("toStatePageQuery", () => {
  it("converts the zero-based State list and sends the selected search controls", () => {
    expect(toStatePageQuery({
      page: 2, pageSize: 25, searchValue: "immediate", columnName: "country", sortDirection: "DESC",
      filters: { status: "archived", searchField: "nameEn", searchOperator: "startsWith", countryId: 7, hasDistricts: true },
    }, " Cairo ")).toEqual({
      pageNumber: 3, pageSize: 25, search: "Cairo", searchField: "nameEn", searchOperator: "startsWith",
      status: "archived", countryId: 7, hasDistricts: true, sortBy: "country", sortDirection: "desc",
    });
  });

  it("uses documented all-column contains defaults", () => {
    expect(toStatePageQuery({ page: 0, pageSize: 10, searchValue: "", columnName: "createdOn", sortDirection: "DESC", filters: { status: "active" } }, "")).toMatchObject({
      pageNumber: 1, searchField: "all", searchOperator: "contains", sortBy: "createdOn", sortDirection: "desc",
    });
  });
});
