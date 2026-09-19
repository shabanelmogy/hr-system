import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useWorkforceBudgetUseCases } from '../../composition/use-workforce-planning-use-cases';
import type { BudgetSourcePlan } from '../../domain/models/workforce-budget';
import { workforceBudgetKeys } from '../queries/use-workforce-budgets';

const PAGE_SIZE = 25;

export function useBudgetSourcePlanSelector(selectedId: number, enabled: boolean) {
  const useCases = useWorkforceBudgetUseCases();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const pages = useInfiniteQuery({
    queryKey: [...workforceBudgetKeys.all, 'source-plan-selector', debouncedSearch],
    enabled,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => useCases.getSourcePlans({
      pageNumber: pageParam,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    getNextPageParam: (lastPage) => lastPage.metaData.hasNext
      ? lastPage.metaData.pageNumber + 1
      : undefined,
  });
  const selected = useQuery({
    queryKey: workforceBudgetKeys.sourcePlan(selectedId),
    queryFn: () => useCases.getSourcePlanById(selectedId),
    enabled: enabled && selectedId > 0,
  });
  const plans = useMemo(() => {
    const byId = new Map<number, BudgetSourcePlan>();
    for (const page of pages.data?.pages ?? []) for (const plan of page.items) byId.set(plan.id, plan);
    if (selected.data) byId.set(selected.data.id, selected.data);
    return [...byId.values()];
  }, [pages.data?.pages, selected.data]);

  return {
    plans,
    selected: selected.data ?? null,
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
