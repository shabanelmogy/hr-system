import { describe, expect, it } from "vitest";
import {
  isServerListSearchPending,
  serverListReducer,
  type ServerListState,
} from "./useServerListState";

type Column = "name" | "createdOn";
type Filters = { status: "active" | "archived" };

const defaults: ServerListState<Column, Filters> = {
  page: 0,
  pageSize: 10,
  searchValue: "",
  columnName: "name",
  sortDirection: "ASC",
  filters: { status: "active" },
};

describe("useServerListState transitions", () => {
  it("keeps the UI page zero-based and clamps negative pages", () => {
    expect(serverListReducer(defaults, { type: "page", page: 3 }).page).toBe(3);
    expect(serverListReducer(defaults, { type: "page", page: -1 }).page).toBe(0);
  });

  it.each([
    { action: { type: "search", searchValue: "Egypt" } as const },
    { action: { type: "sort", columnName: "createdOn", sortDirection: "DESC" } as const },
    { action: { type: "filters", filters: { status: "archived" } } as const },
    { action: { type: "pageSize", pageSize: 25 } as const },
  ])("resets page when list criteria change", ({ action }) => {
    expect(serverListReducer({ ...defaults, page: 4 }, action).page).toBe(0);
  });

  it("restores every configured default", () => {
    const changed: ServerListState<Column, Filters> = {
      page: 5,
      pageSize: 50,
      searchValue: "x",
      columnName: "createdOn",
      sortDirection: "DESC",
      filters: { status: "archived" },
    };
    expect(serverListReducer(changed, { type: "reset", state: defaults })).toEqual(defaults);
  });

  it("reports pending search while the debounced value lags", () => {
    expect(isServerListSearchPending(" Egypt ", "")).toBe(true);
    expect(isServerListSearchPending(" Egypt ", "Egypt")).toBe(false);
  });
});
