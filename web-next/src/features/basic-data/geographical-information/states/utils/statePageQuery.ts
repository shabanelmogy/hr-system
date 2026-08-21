import type { ServerListState } from "@/shared/hooks/useServerListState";
import type { StateListFilters, StatePageQuery, StateSortColumn } from "../types/State";

export function toStatePageQuery(
  state: ServerListState<StateSortColumn, StateListFilters>,
  debouncedSearchValue: string,
): StatePageQuery {
  return {
    pageNumber: state.page + 1,
    pageSize: state.pageSize,
    search: debouncedSearchValue.trim() || undefined,
    searchField: state.filters.searchField ?? "all",
    searchOperator: state.filters.searchOperator ?? "contains",
    status: state.filters.status,
    countryId: state.filters.countryId,
    hasDistricts: state.filters.hasDistricts,
    sortBy: state.columnName,
    sortDirection: state.sortDirection.toLowerCase() as "asc" | "desc",
  };
}
