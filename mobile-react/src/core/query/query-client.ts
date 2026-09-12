import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount) => failureCount < 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
      // Server-authoritative writes must never become an implicit in-memory
      // offline queue. Features that support offline writes opt into the
      // persisted outbox explicitly and reconcile their own command semantics.
      networkMode: 'always',
    },
  },
});
