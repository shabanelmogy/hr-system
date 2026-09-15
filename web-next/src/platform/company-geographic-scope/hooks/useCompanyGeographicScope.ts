import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { companyGeographicScopeService } from "../services/companyGeographicScopeService";
import type {
  CompanyGeographicScope,
  UpdateCompanyGeographicScopeRequest,
} from "../types/CompanyGeographicScope";

export const companyGeographicScopeKeys = {
  all: ["company-geographic-scope"] as const,
  current: () => [...companyGeographicScopeKeys.all, "current"] as const,
};

export const useCompanyGeographicScope = (enabled: boolean) =>
  useQuery({
    queryKey: companyGeographicScopeKeys.current(),
    queryFn: companyGeographicScopeService.get,
    enabled,
    staleTime: 5 * 60_000,
  });

export const useUpdateCompanyGeographicScope = (
  options?: UseMutationOptions<
    CompanyGeographicScope,
    Error,
    UpdateCompanyGeographicScopeRequest
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: companyGeographicScopeService.update,
    ...options,
    onSuccess: async (data, variables, context, meta) => {
      queryClient.setQueryData(companyGeographicScopeKeys.current(), data);
      await queryClient.invalidateQueries({ queryKey: companyGeographicScopeKeys.all });
      await options?.onSuccess?.(data, variables, context, meta);
    },
  });
};
