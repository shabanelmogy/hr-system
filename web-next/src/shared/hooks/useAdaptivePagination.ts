import type { ManagementPageResponse } from "@/lib/api/pagination";
import { CLIENT_PAGINATION_MAX_ROWS } from "@/shared/constants/pagination";
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
  clientRowLimit?: number;
  staleTime?: number;
}

export function getAdaptivePaginationMode(
  totalCount: number | undefined,
  clientRowLimit = CLIENT_PAGINATION_MAX_ROWS,
): AdaptivePaginationMode | null {
  if (totalCount == null) return null;
  return totalCount <= clientRowLimit ? "client" : "server";
}

export function getClientPageItems<TItem>(
  items: readonly TItem[],
  pageNumber: number,
  pageSize: number,
): TItem[] {
  const safePage = Math.max(1, pageNumber);
  const safePageSize = Math.max(1, pageSize);
  const start = (safePage - 1) * safePageSize;
  return items.slice(start, start + safePageSize);
}

export function resolveAdaptivePaginationMode(
  requestedMode: AdaptivePaginationMode | null,
  clientCollectionRejected: boolean,
): AdaptivePaginationMode {
  return requestedMode === "client" && !clientCollectionRejected
    ? "client"
    : "server";
}

export function useAdaptivePagination<TItem, TQuery extends PagedQuery>({
  query,
  queryKey,
  queryFn,
  clientRowLimit = CLIENT_PAGINATION_MAX_ROWS,
  staleTime = 60_000,
}: UseAdaptivePaginationOptions<TItem, TQuery>) {
  const probeQuery = {
    ...query,
    pageNumber: 1,
    pageSize: 1,
  } as TQuery;
  const clientQuery = {
    ...query,
    pageNumber: 1,
    pageSize: clientRowLimit,
  } as TQuery;

  const probe = useQuery({
    queryKey: queryKey(probeQuery),
    queryFn: () => queryFn(probeQuery),
    staleTime,
  });
  const totalCount = probe.data?.metaData.totalCount;
  const mode = getAdaptivePaginationMode(totalCount, clientRowLimit);

  const client = useQuery({
    queryKey: queryKey(clientQuery),
    queryFn: () => queryFn(clientQuery),
    enabled: mode === "client" && totalCount !== 0,
    retry: false,
    staleTime,
  });
  const effectiveMode = resolveAdaptivePaginationMode(mode, client.isError);
  const server = useQuery({
    queryKey: queryKey(query),
    queryFn: () => queryFn(query),
    enabled: mode === "server" || (mode === "client" && client.isError),
    staleTime,
  });

  const clientData = totalCount === 0 ? probe.data : client.data;
  const activeData = effectiveMode === "client" ? clientData : server.data;
  const allItems = activeData?.items ?? [];
  const pageItems = effectiveMode === "client"
    ? getClientPageItems(allItems, query.pageNumber, query.pageSize)
    : allItems;
  const activeQuery = effectiveMode === "client" ? client : server;

  const refetch = async () => {
    const probeResult = await probe.refetch();
    const refreshedMode = getAdaptivePaginationMode(
      probeResult.data?.metaData.totalCount,
      clientRowLimit,
    );
    if (refreshedMode === "client" && probeResult.data?.metaData.totalCount !== 0) {
      const clientResult = await client.refetch();
      if (clientResult.isError) {
        await server.refetch();
      }
    }
    if (refreshedMode === "server") {
      await server.refetch();
    }
  };

  return {
    mode: effectiveMode,
    isReady: mode !== null && (totalCount === 0 || activeData != null),
    allItems,
    pageItems,
    totalCount: totalCount ?? 0,
    error: probe.error ?? activeQuery.error,
    isLoading:
      probe.isLoading ||
      mode === null ||
      (effectiveMode === "client" && totalCount !== 0 && client.isLoading) ||
      (effectiveMode === "server" && server.isLoading),
    isFetching:
      probe.isFetching ||
      (effectiveMode === "client" ? client.isFetching : server.isFetching),
    refetch,
  };
}
