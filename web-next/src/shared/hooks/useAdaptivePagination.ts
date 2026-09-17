import type { ManagementPageResponse } from "@/lib/api/pagination";
import { useQuery, type QueryKey } from "@tanstack/react-query";

export type AdaptivePaginationMode = "client" | "server";

interface PagedQuery {
  pageNumber: number;
  pageSize: number;
}

interface UseAdaptivePaginationOptions<TItem, TQuery extends PagedQuery> {
  query: TQuery;
  queryKey: (query: TQuery) => QueryKey;
  queryFn: (query: TQuery) => Promise<ManagementPageResponse<TItem>>;
  staleTime?: number;
}

export function useAdaptivePagination<TItem, TQuery extends PagedQuery>({
  query,
  queryKey,
  queryFn,
  staleTime = 60_000,
}: UseAdaptivePaginationOptions<TItem, TQuery>) {
  const page = useQuery({
    queryKey: queryKey(query),
    queryFn: () => queryFn(query),
    staleTime,
  });
  const items = page.data?.items ?? [];

  return {
    mode: "server" as const satisfies AdaptivePaginationMode,
    isReady: page.data != null,
    // Preserve the existing caller-facing shape. In server mode both collections
    // intentionally represent only the currently requested page.
    allItems: items,
    pageItems: items,
    totalCount: page.data?.metaData.totalCount ?? 0,
    error: page.error,
    isLoading: page.isLoading,
    isFetching: page.isFetching,
    refetch: page.refetch,
  };
}
