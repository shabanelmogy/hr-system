import { useCallback, useMemo, useReducer } from "react";
import useDebounce from "./useDebounce";

export type ServerListSortDirection = "ASC" | "DESC";

export interface ServerListState<TColumn extends string, TFilters extends object> {
  page: number;
  pageSize: number;
  searchValue: string;
  columnName: TColumn;
  sortDirection: ServerListSortDirection;
  filters: TFilters;
}

interface ServerListStateOptions<TColumn extends string, TFilters extends object> {
  defaultColumn: TColumn;
  defaultFilters: TFilters;
  defaultPageSize?: number;
  debounceMs?: number;
}

export type ServerListAction<TColumn extends string, TFilters extends object> =
  | { type: "page"; page: number }
  | { type: "pageSize"; pageSize: number }
  | { type: "search"; searchValue: string }
  | { type: "sort"; columnName: TColumn; sortDirection: ServerListSortDirection }
  | { type: "filters"; filters: TFilters }
  | { type: "reset"; state: ServerListState<TColumn, TFilters> };

export function serverListReducer<TColumn extends string, TFilters extends object>(
  state: ServerListState<TColumn, TFilters>,
  action: ServerListAction<TColumn, TFilters>,
): ServerListState<TColumn, TFilters> {
  switch (action.type) {
    case "page":
      return { ...state, page: Math.max(0, action.page) };
    case "pageSize":
      return { ...state, page: 0, pageSize: action.pageSize };
    case "search":
      return { ...state, page: 0, searchValue: action.searchValue };
    case "sort":
      return { ...state, page: 0, columnName: action.columnName, sortDirection: action.sortDirection };
    case "filters":
      return { ...state, page: 0, filters: action.filters };
    case "reset":
      return action.state;
  }
}

export function isServerListSearchPending(searchValue: string, debouncedSearchValue: string) {
  return searchValue.trim() !== debouncedSearchValue;
}

/**
 * Domain-neutral state for a server-managed collection. The UI page is
 * zero-based for MUI; each feature maps this state to its own HTTP contract.
 * Search, sort, filter, and page-size changes consistently reset page to zero.
 */
export function useServerListState<TColumn extends string, TFilters extends object>({
  defaultColumn,
  defaultFilters,
  defaultPageSize = 10,
  debounceMs = 300,
}: ServerListStateOptions<TColumn, TFilters>) {
  const initialState = useMemo<ServerListState<TColumn, TFilters>>(
    () => ({
      page: 0,
      pageSize: defaultPageSize,
      searchValue: "",
      columnName: defaultColumn,
      sortDirection: "ASC",
      filters: defaultFilters,
    }),
    [defaultColumn, defaultFilters, defaultPageSize],
  );
  const [state, dispatch] = useReducer(serverListReducer<TColumn, TFilters>, initialState);
  const debouncedSearchValue = useDebounce(state.searchValue.trim(), debounceMs);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "page", page });
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: "pageSize", pageSize });
  }, []);

  const setSearchValue = useCallback((searchValue: string) => {
    dispatch({ type: "search", searchValue });
  }, []);

  const setSort = useCallback((columnName: TColumn, sortDirection: ServerListSortDirection) => {
    dispatch({ type: "sort", columnName, sortDirection });
  }, []);

  const setFilters = useCallback((filters: TFilters) => {
    dispatch({ type: "filters", filters });
  }, []);

  const reset = useCallback(() => dispatch({ type: "reset", state: initialState }), [initialState]);

  return {
    state,
    debouncedSearchValue,
    isSearchPending: isServerListSearchPending(state.searchValue, debouncedSearchValue),
    setPage,
    setPageSize,
    setSearchValue,
    setSort,
    setFilters,
    reset,
  };
}
