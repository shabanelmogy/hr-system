import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import LabelService from "../services/labelService";
import type { KanbanLabel } from "../types/Label";

export const labelKeys = {
  all: ["kanbanLabels"] as const,
  list: () => [...labelKeys.all, "list"] as const,
  detail: (id: string | number) => [...labelKeys.all, "detail", id] as const,
};

export const useLabels = (options?: UseQueryOptions<KanbanLabel[], Error>) =>
  useQuery({ queryKey: labelKeys.list(), queryFn: LabelService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useLabel = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanLabel, Error>) =>
  useQuery({ queryKey: labelKeys.detail(id!), queryFn: () => LabelService.getById(id!), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useLabelMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: labelKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateLabel = (options?: UseMutationOptions<KanbanLabel, Error, Partial<KanbanLabel>>) =>
  useLabelMutation(LabelService.create as any, options);

export const useUpdateLabel = (options?: UseMutationOptions<KanbanLabel, Error, Partial<KanbanLabel>>) =>
  useLabelMutation(LabelService.update as any, options);

export const useDeleteLabel = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useLabelMutation<string | number, string | number>(LabelService.delete as any, options);

export const useInvalidateLabels = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: labelKeys.all }); };
