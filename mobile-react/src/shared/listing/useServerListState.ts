import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import {
  createServerListState,
  cycleServerListSort,
  serverListReducer,
  type ServerListSort,
} from './server-list-state';

export interface UseServerListStateOptions<ColumnId extends string, Filters> {
  initialPageSize: number;
  initialFilters: Filters;
  initialSearch?: string;
  initialSort?: ServerListSort<ColumnId> | null;
  searchDebounceMs?: number;
}

export function useServerListState<ColumnId extends string, Filters>({
  initialPageSize,
  initialFilters,
  initialSearch = '',
  initialSort = null,
  searchDebounceMs = 350,
}: UseServerListStateOptions<ColumnId, Filters>) {
  const [initialState] = useState(() =>
    createServerListState<ColumnId, Filters>({
      pageSize: initialPageSize,
      filters: initialFilters,
      search: initialSearch,
      sort: initialSort,
    }),
  );
  const [state, dispatch] = useReducer(serverListReducer<ColumnId, Filters>, initialState);
  const [searchInput, setSearchInput] = useState(initialState.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'set-search', search: searchInput });
    }, Math.max(0, searchDebounceMs));

    return () => clearTimeout(timer);
  }, [searchDebounceMs, searchInput]);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'set-page', page });
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'set-page-size', pageSize });
  }, []);

  const setFilters = useCallback((filters: Filters) => {
    dispatch({ type: 'set-filters', filters });
  }, []);

  const setSort = useCallback((sort: ServerListSort<ColumnId> | null) => {
    dispatch({ type: 'set-sort', sort });
  }, []);

  const cycleSort = useCallback((columnId: ColumnId) => {
    dispatch({
      type: 'set-sort',
      sort: cycleServerListSort(state.sort, columnId),
    });
  }, [state.sort]);

  const reset = useCallback(() => {
    setSearchInput(initialState.search);
    dispatch({ type: 'reset', state: initialState });
  }, [initialState]);

  return useMemo(() => ({
    state,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
    setFilters,
    setSort,
    cycleSort,
    reset,
  }), [
    cycleSort,
    reset,
    searchInput,
    setFilters,
    setPage,
    setPageSize,
    setSort,
    state,
  ]);
}
