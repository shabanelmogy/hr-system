import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import ColumnService from "../services/columnService";
import type { KanbanColumn } from "../types/Column";

export const columnKeys = {
  all: ["kanbanColumns"] as const,
  list: () => [...columnKeys.all, "list"] as const,
  detail: (id: string | number) => [...columnKeys.all, "detail", id] as const,
};

export const useColumns = (options?: UseQueryOptions<KanbanColumn[], Error>) =>
  useQuery({ queryKey: columnKeys.list(), queryFn: ColumnService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useColumn = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanColumn, Error>) =>
  useQuery({ queryKey: columnKeys.detail(id!), queryFn: () => ColumnService.getById(id!), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useColumnMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: columnKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateColumn = (options?: UseMutationOptions<KanbanColumn, Error, Partial<KanbanColumn>>) =>
  useColumnMutation(ColumnService.create as any, options);

export const useUpdateColumn = (options?: UseMutationOptions<KanbanColumn, Error, Partial<KanbanColumn>>) =>
  useColumnMutation(ColumnService.update as any, options);

export const useDeleteColumn = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useColumnMutation<string | number, string | number>(ColumnService.delete as any, options);

export const useInvalidateColumns = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: columnKeys.all }); };
