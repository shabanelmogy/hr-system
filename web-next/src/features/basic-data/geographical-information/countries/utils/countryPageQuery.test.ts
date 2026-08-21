import { describe, expect, it } from "vitest";
import { toCountryPageQuery } from "./countryPageQuery";

describe("toCountryPageQuery", () => {
  it("maps zero-based UI state to the exact Countries HTTP query", () => {
    expect(toCountryPageQuery({
      page: 2,
      pageSize: 25,
      searchValue: "ignored immediate value",
      columnName: "createdOn",
      sortDirection: "DESC",
      filters: {
        status: "archived",
        currencyCode: "EGP",
        hasStates: false,
        searchField: "nameEn",
        searchOperator: "startsWith",
      },
    }, "Egypt")).toEqual({
      pageNumber: 3,
      pageSize: 25,
      search: "Egypt",
      searchField: "nameEn",
      searchOperator: "startsWith",
      status: "archived",
      currencyCode: "EGP",
      hasStates: false,
      sortBy: "createdOn",
      sortDirection: "desc",
    });
  });

  it("does not send an incomplete exact currency filter", () => {
    expect(toCountryPageQuery({
      page: 0,
      pageSize: 10,
      searchValue: "",
      columnName: "nameEn",
      sortDirection: "ASC",
      filters: { status: "active", currencyCode: "EG" },
    }, "").currencyCode).toBeUndefined();
  });

  it("uses the global contains search defaults when no search controls are selected", () => {
    expect(toCountryPageQuery({
      page: 0,
      pageSize: 10,
      searchValue: "",
      columnName: "nameEn",
      sortDirection: "ASC",
      filters: { status: "active" },
    }, "")).toMatchObject({
      searchField: "all",
      searchOperator: "contains",
    });
  });
});
