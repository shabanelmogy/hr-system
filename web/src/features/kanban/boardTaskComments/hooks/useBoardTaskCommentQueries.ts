import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import BoardTaskCommentService from "../services/boardTaskCommentService";
import type { BoardTaskComment } from "../types/BoardTaskComment";

export const boardTaskCommentKeys = {
  all: ["boardTaskComments"] as const,
  list: () => [...boardTaskCommentKeys.all, "list"] as const,
  byTask: (taskId: string | number) => [...boardTaskCommentKeys.all, "byTask", taskId] as const,
  detail: (id: string | number) => [...boardTaskCommentKeys.all, "detail", id] as const,
};

export const useBoardTaskComments = (options?: UseQueryOptions<BoardTaskComment[], Error>) =>
  useQuery({ queryKey: boardTaskCommentKeys.list(), queryFn: BoardTaskCommentService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useBoardTaskCommentsByTask = (taskId: string | number | null | undefined, options?: UseQueryOptions<BoardTaskComment[], Error>) =>
  useQuery({ queryKey: boardTaskCommentKeys.byTask(taskId as any), queryFn: () => BoardTaskCommentService.getByTask(taskId as any), enabled: !!taskId, staleTime: 5 * 60 * 1000, ...options });

export const useBoardTaskComment = (id: string | number | null | undefined, options?: UseQueryOptions<BoardTaskComment, Error>) =>
  useQuery({ queryKey: boardTaskCommentKeys.detail(id as any), queryFn: () => BoardTaskCommentService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useBoardTaskCommentMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: boardTaskCommentKeys.all });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

export const useCreateBoardTaskComment = (options?: UseMutationOptions<BoardTaskComment, Error, Partial<BoardTaskComment>>) =>
  useBoardTaskCommentMutation(BoardTaskCommentService.create as any, options);

export const useUpdateBoardTaskComment = (options?: UseMutationOptions<BoardTaskComment, Error, Partial<BoardTaskComment>>) =>
  useBoardTaskCommentMutation(BoardTaskCommentService.update as any, options);

export const useDeleteBoardTaskComment = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useBoardTaskCommentMutation<string | number, string | number>(BoardTaskCommentService.delete as any, options);

export const useInvalidateBoardTaskComments = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: boardTaskCommentKeys.all }); };
