import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getTrackChanges } from "../services/trackChangeService";
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
