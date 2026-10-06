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

function keepPaginationMetadata<TItem>(
  previous: ManagementPageResponse<TItem> | undefined,
) {
  if (!previous) return undefined;

  // Keep the authoritative total while the next server page is loading, but do
  // not expose the previous page's row IDs. The shared record navigator waits
  // for the requested page and then activates the correct row.
  return { ...previous, items: [] };
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
    placeholderData: keepPaginationMetadata,
    staleTime,
  });
  const items = page.data?.items ?? [];

  return {
    mode: "server" as const satisfies AdaptivePaginationMode,
    // Placeholder metadata keeps rowCount stable while a different page is in
    // flight, but it is not an authoritative response for the requested page.
    // Callers may clamp an out-of-range page only after the real response
    // arrives; treating placeholder data as ready can bounce a valid request
    // back to the previous page.
    isReady: page.data != null && !page.isPlaceholderData,
    // Preserve the existing caller-facing shape. In server mode both collections
    // intentionally represent only the currently requested page.
    allItems: items,
    pageItems: items,
    totalCount: page.data?.metaData.totalCount ?? 0,
    error: page.error,
    isLoading: page.isLoading || page.isPlaceholderData,
    isFetching: page.isFetching,
    refetch: page.refetch,
  };
}
