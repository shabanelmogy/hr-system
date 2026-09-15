import type { ServerListState } from "@/shared/hooks/useServerListState";
import type { AddressTypeListFilters, AddressTypePageQuery, AddressTypeSortColumn } from "../types/AddressType";

/** Converts the shared zero-based UI state into the one-based API contract. */
export function toAddressTypePageQuery(
  state: ServerListState<AddressTypeSortColumn, AddressTypeListFilters>,
  debouncedSearchValue: string,
): AddressTypePageQuery {
  return {
    pageNumber: state.page + 1,
    pageSize: state.pageSize,
    search: debouncedSearchValue.trim() || undefined,
    searchField: state.filters.searchField ?? "all",
    searchOperator: state.filters.searchOperator ?? "contains",
    status: state.filters.status,
    sortBy: state.columnName,
    sortDirection: state.sortDirection.toLowerCase() as "asc" | "desc",
  };
}
