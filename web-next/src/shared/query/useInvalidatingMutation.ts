import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

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
      await Promise.all(
        invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
  });
}
