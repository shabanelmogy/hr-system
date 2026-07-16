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

export const useUpdateLocalization = (culture: string, options?: UseMutationOptions<unknown, Error, UpdateLocalizationRequest>) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, UpdateLocalizationRequest>({
    ...options,
    mutationFn: async (data: UpdateLocalizationRequest) => {
      return await apiService.put(apiRoutes.advancedTools.updateLocalizationApi, {
        Language: data.Language || culture,
        Key: data.key,
        Value: data.value,
      });
    },
    onSuccess: (data, variables, context, mutationContext) => {
      queryClient.invalidateQueries({ queryKey: advancedToolsKeys.localization(culture) });
      options?.onSuccess?.(data, variables, context, mutationContext);
    },
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
      const allChanges: unknown = response.data || response.value || response;
      return Array.isArray(allChanges)
        ? allChanges.map((row): TrackChangeLog => {
            const record = isRecord(row) ? row : {};
            return {
              id: crypto.randomUUID(),
              changeLogId: asStringOrNumber(record.changeLogId ?? record.ChangeLogId),
              entityName: asString(record.entityName ?? record.EntityName),
              key: asString(record.key ?? record.Key),
              oldValue: asString(record.oldValue ?? record.OldValue),
              newValue: asString(record.newValue ?? record.NewValue),
              changedBy: asString(record.changedBy ?? record.ChangedBy),
              changedAt: asString(record.changedAt ?? record.ChangedAt),
              changedByPc: asString(record.changedByPc ?? record.ChangedByPc),
            };
          })
        : [];
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringOrNumber(value: unknown): string | number {
  return typeof value === "number" || typeof value === "string" ? value : "";
}
