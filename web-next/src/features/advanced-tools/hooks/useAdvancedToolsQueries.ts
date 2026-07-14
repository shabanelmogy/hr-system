import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { apiService } from "@/shared/services";
import { apiRoutes } from "@/config";

export const advancedToolsKeys = {
  all: ["advancedTools"] as const,
  localization: (culture: string) => [...advancedToolsKeys.all, "localization", culture] as const,
  trackChanges: () => [...advancedToolsKeys.all, "trackChanges"] as const,
};

// -- Localization Hooks --

export interface LocalizationEntry {
  id: number | string;
  key: string;
  value: string;
}

export const useLocalization = (culture: string, options?: UseQueryOptions<LocalizationEntry[], Error>) =>
  useQuery({
    queryKey: advancedToolsKeys.localization(culture),
    queryFn: async () => {
      const response = await apiService.get(`${apiRoutes.advancedTools.getLocalizationApi}/${culture}`);
      const data = response.value || response.data || response;
      return Object.keys(data).map((key, index) => ({
        id: index,
        key: key,
        value: data[key],
      }));
    },
    enabled: !!culture,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

export interface UpdateLocalizationRequest {
  Language: string;
  key: string;
  value: string;
}

export const useUpdateLocalization = (culture: string, options?: UseMutationOptions<any, Error, UpdateLocalizationRequest>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateLocalizationRequest) => {
      return await apiService.put(apiRoutes.advancedTools.updateLocalizationApi, {
        Language: data.Language || culture,
        Key: data.key,
        Value: data.value,
      });
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: advancedToolsKeys.localization(culture) });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, undefined as any);
      }
    },
    ...options,
  });
};

// -- Track Changes Hooks --

export interface TrackChangeLog {
  id: string;
  changeLogId: string | number;
  entityName: string;
  key: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  changedByPc: string;
}

export const useTrackChanges = (options?: UseQueryOptions<TrackChangeLog[], Error>) =>
  useQuery({
    queryKey: advancedToolsKeys.trackChanges(),
    queryFn: async () => {
      const response = await apiService.get("/api/v1/EntityChangeLogs/GetAllChangesLogs");
      const allChanges = response.data || response.value || response;
      return allChanges.map((row: any) => ({ ...row, id: crypto.randomUUID() }));
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
