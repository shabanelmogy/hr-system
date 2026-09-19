import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/src/core/api';

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (!(error instanceof ApiError)) return failureCount < 1;
  return error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: true,
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
