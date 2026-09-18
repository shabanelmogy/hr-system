import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

type QueryInvalidator = {
  invalidateQueries: (filters: { queryKey: QueryKey }) => Promise<unknown>;
};

export async function invalidateQueryKeys(
  queryClient: QueryInvalidator,
  invalidate: readonly QueryKey[],
) {
  await Promise.all(
    invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/**
 * Standard mutation wrapper for online-authoritative features. Business rules
 * remain inside the feature; this helper only standardizes cache reconciliation.
 */
export function useInvalidatingMutation<
  TData,
  TVariables,
  TContext = unknown,
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidate: readonly QueryKey[],
  options?: UseMutationOptions<TData, Error, TVariables, TContext>,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, mutationContext) => {
      await invalidateQueryKeys(queryClient, invalidate);
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
  });
}
