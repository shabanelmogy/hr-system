export type ServerListSortDirection = 'ascending' | 'descending';

export interface ServerListSort<ColumnId extends string> {
  columnId: ColumnId;
  direction: ServerListSortDirection;
}

export interface ServerListState<ColumnId extends string, Filters> {
  page: number;
  pageSize: number;
  search: string;
  sort: ServerListSort<ColumnId> | null;
  filters: Filters;
}

export type ServerListAction<ColumnId extends string, Filters> =
  | { type: 'set-page'; page: number }
  | { type: 'set-page-size'; pageSize: number }
  | { type: 'set-search'; search: string }
  | { type: 'set-sort'; sort: ServerListSort<ColumnId> | null }
  | { type: 'set-filters'; filters: Filters }
  | { type: 'reset'; state: ServerListState<ColumnId, Filters> };

export function createServerListState<ColumnId extends string, Filters>({
  pageSize,
  filters,
  search = '',
  sort = null,
}: {
  pageSize: number;
  filters: Filters;
  search?: string;
  sort?: ServerListSort<ColumnId> | null;
}): ServerListState<ColumnId, Filters> {
  return {
    page: 0,
    pageSize: normalizePageSize(pageSize),
    search: search.trim(),
    sort,
    filters,
  };
}

export function serverListReducer<ColumnId extends string, Filters>(
  state: ServerListState<ColumnId, Filters>,
  action: ServerListAction<ColumnId, Filters>,
): ServerListState<ColumnId, Filters> {
  switch (action.type) {
    case 'set-page':
      return { ...state, page: normalizePage(action.page) };
    case 'set-page-size':
      return { ...state, page: 0, pageSize: normalizePageSize(action.pageSize) };
    case 'set-search':
      return { ...state, page: 0, search: action.search.trim() };
    case 'set-sort':
      return { ...state, page: 0, sort: action.sort };
    case 'set-filters':
      return { ...state, page: 0, filters: action.filters };
    case 'reset':
      return action.state;
  }
}

export function cycleServerListSort<ColumnId extends string>(
  current: ServerListSort<ColumnId> | null,
  columnId: ColumnId,
): ServerListSort<ColumnId> | null {
  if (current?.columnId !== columnId) {
    return { columnId, direction: 'ascending' };
  }

  if (current.direction === 'ascending') {
    return { columnId, direction: 'descending' };
  }

  return null;
}

/** Converts the zero-based UI page to the one-based page expected by the API. */
export function toApiPageNumber(page: number): number {
  return normalizePage(page) + 1;
}

function normalizePage(page: number): number {
  return Number.isFinite(page) ? Math.max(0, Math.trunc(page)) : 0;
}

function normalizePageSize(pageSize: number): number {
  return Number.isFinite(pageSize) ? Math.max(1, Math.trunc(pageSize)) : 1;
}
