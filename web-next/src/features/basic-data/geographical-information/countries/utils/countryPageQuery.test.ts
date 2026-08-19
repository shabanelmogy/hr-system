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
      filters: { status: "archived", currencyCode: "EGP", hasStates: false },
    }, "Egypt")).toEqual({
      pageNumber: 3,
      pageSize: 25,
      search: "Egypt",
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
});
