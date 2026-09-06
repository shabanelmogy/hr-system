import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        // Reconcile invalidated/stale inactive queries when their screen mounts.
        // Disabling this globally can leave cross-feature lookup data stale after
        // a mutation completed while the consuming screen was unmounted.
        refetchOnMount: true
      },
      mutations: {
        retry: 1
      }
    }
  });
}
