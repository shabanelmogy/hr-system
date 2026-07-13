import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import CommentService from "../services/commentService";
import type { KanbanCardComment } from "../types/Comment";

export const commentKeys = {
  all: ["kanbanCardComments"] as const,
  list: () => [...commentKeys.all, "list"] as const,
  byCard: (cardId: string | number) => [...commentKeys.all, "byCard", cardId] as const,
  detail: (id: string | number) => [...commentKeys.all, "detail", id] as const,
};

export const useComments = (options?: UseQueryOptions<KanbanCardComment[], Error>) =>
  useQuery({ queryKey: commentKeys.list(), queryFn: CommentService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useCommentsByCard = (cardId: string | number | null | undefined, options?: UseQueryOptions<KanbanCardComment[], Error>) =>
  useQuery({ queryKey: commentKeys.byCard(cardId as any), queryFn: () => CommentService.getByCard(cardId as any), enabled: !!cardId, staleTime: 5 * 60 * 1000, ...options });

export const useComment = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanCardComment, Error>) =>
  useQuery({ queryKey: commentKeys.detail(id as any), queryFn: () => CommentService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useCommentMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateComment = (options?: UseMutationOptions<KanbanCardComment, Error, Partial<KanbanCardComment>>) =>
  useCommentMutation(CommentService.create as any, options);

export const useUpdateComment = (options?: UseMutationOptions<KanbanCardComment, Error, Partial<KanbanCardComment>>) =>
  useCommentMutation(CommentService.update as any, options);

export const useDeleteComment = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useCommentMutation<string | number, string | number>(CommentService.delete as any, options);

export const useInvalidateComments = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: commentKeys.all }); };
