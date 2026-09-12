import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getTrackChanges, getEntityChangeLogs } from "../services/trackChangeService";
import type { TrackChangeLog } from "../types/trackChange";

const trackChangeKeys = {
  all: ["advancedTools", "trackChanges"] as const,
};

type TrackChangesQueryOptions = Omit<
  UseQueryOptions<TrackChangeLog[], Error>,
  "queryKey" | "queryFn"
>;

export default function useTrackChangesQuery(
  options?: TrackChangesQueryOptions,
) {
  return useQuery({
    ...options,
    queryKey: trackChangeKeys.all,
    queryFn: getTrackChanges,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
}

export function useEntityChangeLogsQuery(
  resource?: string,
  id?: number | string | null,
  options?: TrackChangesQueryOptions,
) {
  return useQuery({
    ...options,
    queryKey: ["organizational-structure", resource, id, "change-logs"] as const,
    queryFn: () => getEntityChangeLogs(resource!, id!),
    enabled: Boolean(resource && id) && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 30 * 1000,
  });
}
