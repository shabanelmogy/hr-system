import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import BoardTaskService from "../services/boardTaskService";
import type { BoardTask } from "../types/BoardTask";

export const boardTaskKeys = {
  all: ["boardTasks"] as const,
  list: () => [...boardTaskKeys.all, "list"] as const,
  detail: (id: string | number) => [...boardTaskKeys.all, "detail", id] as const,
};

export const useBoardTasks = (options?: UseQueryOptions<BoardTask[], Error>) =>
  useQuery({ queryKey: boardTaskKeys.list(), queryFn: BoardTaskService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useBoardTask = (id: string | number | null | undefined, options?: UseQueryOptions<BoardTask, Error>) =>
  useQuery({ queryKey: boardTaskKeys.detail(id as any), queryFn: () => BoardTaskService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useBoardTaskMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: boardTaskKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateBoardTask = (options?: UseMutationOptions<BoardTask, Error, Partial<BoardTask>>) =>
  useBoardTaskMutation(BoardTaskService.create as any, options);

export const useUpdateBoardTask = (options?: UseMutationOptions<BoardTask, Error, Partial<BoardTask>>) =>
  useBoardTaskMutation(BoardTaskService.update as any, options);

export const useDeleteBoardTask = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useBoardTaskMutation<string | number, string | number>(BoardTaskService.delete as any, options);

export const useInvalidateBoardTasks = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: boardTaskKeys.all }); };
