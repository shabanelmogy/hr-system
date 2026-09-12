import type { ServerListState } from "@/shared/hooks/useServerListState";
import type {
  CountryListFilters,
  CountryPageQuery,
  CountrySortColumn,
} from "../types/Country";

export function toCountryPageQuery(
  state: ServerListState<CountrySortColumn, CountryListFilters>,
  debouncedSearchValue: string,
): CountryPageQuery {
  const currencyCode = state.filters.currencyCode?.trim().toUpperCase();
  return {
    pageNumber: state.page + 1,
    pageSize: state.pageSize,
    search: debouncedSearchValue || undefined,
    searchField: state.filters.searchField ?? "all",
    searchOperator: state.filters.searchOperator ?? "contains",
    status: state.filters.status,
    currencyCode: currencyCode?.length === 3 ? currencyCode : undefined,
    hasStates: state.filters.hasStates,
    sortBy: state.columnName,
    sortDirection: state.sortDirection.toLowerCase() as "asc" | "desc",
  };
}
