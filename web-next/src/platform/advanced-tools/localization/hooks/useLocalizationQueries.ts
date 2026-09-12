import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  getLocalization,
  updateLocalization,
} from "../services/localizationService";
import type {
  LocalizationEntry,
  UpdateLocalizationRequest,
} from "../types/localization";

const localizationKeys = {
  all: ["advancedTools", "localization"] as const,
  byCulture: (culture: string) => [...localizationKeys.all, culture] as const,
};

type LocalizationQueryOptions = Omit<
  UseQueryOptions<LocalizationEntry[], Error>,
  "queryKey" | "queryFn"
>;

type UpdateLocalizationOptions = Omit<
  UseMutationOptions<unknown, Error, UpdateLocalizationRequest>,
  "mutationFn"
>;

export function useLocalizationQuery(
  culture: string,
  options?: LocalizationQueryOptions,
) {
  return useQuery({
    ...options,
    queryKey: localizationKeys.byCulture(culture),
    queryFn: () => getLocalization(culture),
    enabled: Boolean(culture) && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
}

export function useUpdateLocalizationMutation(
  culture: string,
  options?: UpdateLocalizationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateLocalization,
    onSuccess: (data, variables, context, mutationContext) => {
      void queryClient.invalidateQueries({
        queryKey: localizationKeys.byCulture(culture),
      });
      options?.onSuccess?.(data, variables, context, mutationContext);
    },
  });
}
