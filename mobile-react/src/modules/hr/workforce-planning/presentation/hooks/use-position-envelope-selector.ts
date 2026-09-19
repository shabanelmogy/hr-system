import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import type { AppSelectOption } from '@/src/shared/components';
import { usePositionEnvelopeUseCases } from '../../composition/use-workforce-planning-use-cases';
import type { PositionEnvelope } from '../../domain/models/workforce-budget';
import { positionEnvelopeKeys } from '../queries/use-workforce-budgets';

const PAGE_SIZE = 25;

export function usePositionEnvelopeSelector(selectedId: number, availableOnly = false) {
  const useCases = usePositionEnvelopeUseCases();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const normalizedSearch = debouncedSearch;
  const pages = useInfiniteQuery({
    queryKey: [...positionEnvelopeKeys.all, 'selector', { search: normalizedSearch, availableOnly }],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => useCases.getPage({
      pageNumber: pageParam,
      pageSize: PAGE_SIZE,
      search: normalizedSearch || undefined,
      sortBy: 'envelopeCode',
      sortDirection: 'asc',
    }),
    getNextPageParam: (lastPage) => lastPage.metaData.hasNext
      ? lastPage.metaData.pageNumber + 1
      : undefined,
  });
  const selected = useQuery({
    queryKey: positionEnvelopeKeys.detail(selectedId),
    queryFn: () => useCases.getById(selectedId),
    enabled: selectedId > 0,
  });
  const options = useMemo<AppSelectOption<number>[]>(() => {
    const byId = new Map<number, PositionEnvelope>();
    for (const page of pages.data?.pages ?? []) {
      for (const envelope of page.items) {
        if (!availableOnly || envelope.availableHeadcount > 0 || envelope.id === selectedId) {
          byId.set(envelope.id, envelope);
        }
      }
    }
    if (selected.data) byId.set(selected.data.id, selected.data);
    return [...byId.values()].map((envelope) => ({
      value: envelope.id,
      label: `${envelope.envelopeCode} — ${envelope.availableHeadcount} / ${envelope.availableSalaryBudget} ${envelope.currencyCode}`,
      icon: 'cube-outline',
    }));
  }, [availableOnly, pages.data?.pages, selected.data, selectedId]);

  return {
    options,
    search,
    setSearch,
    loading: pages.isLoading || selected.isLoading,
    loadingMore: pages.isFetchingNextPage,
    hasMore: Boolean(pages.hasNextPage),
    loadMore: () => pages.fetchNextPage(),
    error: pages.error ?? selected.error,
    retry: () => selectedId > 0
      ? Promise.all([pages.refetch(), selected.refetch()])
      : pages.refetch(),
  };
}
