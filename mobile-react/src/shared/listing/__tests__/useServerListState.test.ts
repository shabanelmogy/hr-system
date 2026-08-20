import { act, renderHook } from '@testing-library/react-native';

import { useServerListState } from '../useServerListState';

describe('useServerListState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces server search and resets the active page when it is applied', async () => {
    const { result } = await renderHook(() => useServerListState<'name', { active: boolean }>({
      initialPageSize: 5,
      initialFilters: { active: true },
      searchDebounceMs: 350,
    }));

    await act(() => {
      result.current.setPage(3);
      result.current.setSearchInput('Egypt');
    });

    expect(result.current.state).toMatchObject({ page: 3, search: '' });

    await act(() => {
      jest.advanceTimersByTime(349);
    });
    expect(result.current.state).toMatchObject({ page: 3, search: '' });

    await act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.state).toMatchObject({ page: 0, search: 'Egypt' });
  });

  it('restores the initial state and visible search input', async () => {
    const { result } = await renderHook(() => useServerListState<'name', { active: boolean }>({
      initialPageSize: 10,
      initialFilters: { active: true },
      initialSearch: 'initial',
      initialSort: { columnId: 'name', direction: 'ascending' },
      searchDebounceMs: 0,
    }));

    await act(() => {
      result.current.setPage(2);
      result.current.setFilters({ active: false });
      result.current.setSearchInput('changed');
      result.current.reset();
    });

    expect(result.current.searchInput).toBe('initial');
    expect(result.current.state).toEqual({
      page: 0,
      pageSize: 10,
      search: 'initial',
      sort: { columnId: 'name', direction: 'ascending' },
      filters: { active: true },
    });
  });
});
