import { describe, expect, it } from '@jest/globals';

import {
  createServerListState,
  cycleServerListSort,
  serverListReducer,
  toApiPageNumber,
} from '../server-list-state';

type Column = 'name' | 'createdOn';
type Filters = { status: 'active' | 'archived' | 'all' };

const initial = createServerListState<Column, Filters>({
  pageSize: 5,
  filters: { status: 'active' },
  sort: { columnId: 'createdOn', direction: 'descending' },
});

describe('server list state', () => {
  it('uses zero-based UI pages and converts them for the API', () => {
    expect(toApiPageNumber(0)).toBe(1);
    expect(toApiPageNumber(4)).toBe(5);
    expect(toApiPageNumber(-3)).toBe(1);
  });

  it('resets the page when criteria or page size change', () => {
    const paged = serverListReducer(initial, { type: 'set-page', page: 3 });

    expect(serverListReducer(paged, { type: 'set-search', search: ' Egypt ' })).toMatchObject({
      page: 0,
      search: 'Egypt',
    });
    expect(serverListReducer(paged, {
      type: 'set-filters',
      filters: { status: 'archived' },
    })).toMatchObject({ page: 0, filters: { status: 'archived' } });
    expect(serverListReducer(paged, { type: 'set-page-size', pageSize: 25 })).toMatchObject({
      page: 0,
      pageSize: 25,
    });
  });

  it('cycles sort through ascending, descending, and natural order', () => {
    const ascending = cycleServerListSort<Column>(null, 'name');
    const descending = cycleServerListSort(ascending, 'name');
    const natural = cycleServerListSort(descending, 'name');

    expect(ascending).toEqual({ columnId: 'name', direction: 'ascending' });
    expect(descending).toEqual({ columnId: 'name', direction: 'descending' });
    expect(natural).toBeNull();
  });
});
