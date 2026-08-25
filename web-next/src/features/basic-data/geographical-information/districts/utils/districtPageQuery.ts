import type { ServerListState } from "@/shared/hooks/useServerListState";
import type { DistrictListFilters, DistrictPageQuery, DistrictSortColumn } from "../types/District";

export function toDistrictPageQuery(
  state: ServerListState<DistrictSortColumn, DistrictListFilters>,
  debouncedSearchValue: string,
): DistrictPageQuery {
  return {
    pageNumber: state.page + 1,
    pageSize: state.pageSize,
    search: debouncedSearchValue.trim() || undefined,
    searchField: state.filters.searchField ?? "all",
    searchOperator: state.filters.searchOperator ?? "contains",
    status: state.filters.status,
    stateId: state.filters.stateId,
    hasAddresses: state.filters.hasAddresses,
    sortBy: state.columnName,
    sortDirection: state.sortDirection.toLowerCase() as "asc" | "desc",
  };
}
