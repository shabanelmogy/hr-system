import type { ManagementPageQuery } from "@/lib/api/pagination";
import type { ServerListState } from "@/shared/hooks/useServerListState";
import type { TenantListFilters, TenantSortColumn } from "./types";

export function toTenantPageQuery(
  state: ServerListState<TenantSortColumn, TenantListFilters>,
  debouncedSearchValue: string,
): ManagementPageQuery {
  return {
    pageNumber: state.page + 1,
    pageSize: state.pageSize,
    searchValue: debouncedSearchValue || undefined,
    columnName: state.columnName,
    sortDirection: state.sortDirection,
    includeArchived: state.filters.includeArchived,
  };
}
