import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import BoardTaskAttachmentService from "../services/boardTaskAttachmentService";
import type { BoardTaskAttachment } from "../types/BoardTaskAttachment";

export const boardTaskAttachmentKeys = {
  all: ["boardTaskAttachments"] as const,
  list: () => [...boardTaskAttachmentKeys.all, "list"] as const,
  byTask: (taskId: string | number) => [...boardTaskAttachmentKeys.all, "byTask", taskId] as const,
  detail: (id: string | number) => [...boardTaskAttachmentKeys.all, "detail", id] as const,
};

export const useBoardTaskAttachments = (options?: UseQueryOptions<BoardTaskAttachment[], Error>) =>
  useQuery({ queryKey: boardTaskAttachmentKeys.list(), queryFn: BoardTaskAttachmentService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useBoardTaskAttachmentsByTask = (taskId: string | number | null | undefined, options?: UseQueryOptions<BoardTaskAttachment[], Error>) =>
  useQuery({ queryKey: boardTaskAttachmentKeys.byTask(taskId as any), queryFn: () => BoardTaskAttachmentService.getByTask(taskId as any), enabled: !!taskId, staleTime: 5 * 60 * 1000, ...options });

export const useBoardTaskAttachment = (id: string | number | null | undefined, options?: UseQueryOptions<BoardTaskAttachment, Error>) =>
  useQuery({ queryKey: boardTaskAttachmentKeys.detail(id as any), queryFn: () => BoardTaskAttachmentService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useBoardTaskAttachmentMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: boardTaskAttachmentKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateBoardTaskAttachment = (options?: UseMutationOptions<BoardTaskAttachment, Error, Partial<BoardTaskAttachment>>) =>
  useBoardTaskAttachmentMutation(BoardTaskAttachmentService.create as any, options);

export const useUpdateBoardTaskAttachment = (options?: UseMutationOptions<BoardTaskAttachment, Error, Partial<BoardTaskAttachment>>) =>
  useBoardTaskAttachmentMutation(BoardTaskAttachmentService.update as any, options);

export const useDeleteBoardTaskAttachment = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useBoardTaskAttachmentMutation<string | number, string | number>(BoardTaskAttachmentService.delete as any, options);

export const useInvalidateBoardTaskAttachments = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: boardTaskAttachmentKeys.all }); };
