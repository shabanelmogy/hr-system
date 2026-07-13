import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import AttachmentService from "../services/attachmentService";
import type { KanbanCardAttachment } from "../types/Attachment";

export const attachmentKeys = {
  all: ["kanbanCardAttachments"] as const,
  list: () => [...attachmentKeys.all, "list"] as const,
  byCard: (cardId: string | number) => [...attachmentKeys.all, "byCard", cardId] as const,
  detail: (id: string | number) => [...attachmentKeys.all, "detail", id] as const,
};

export const useAttachments = (options?: UseQueryOptions<KanbanCardAttachment[], Error>) =>
  useQuery({ queryKey: attachmentKeys.list(), queryFn: AttachmentService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useAttachmentsByCard = (cardId: string | number | null | undefined, options?: UseQueryOptions<KanbanCardAttachment[], Error>) =>
  useQuery({ queryKey: attachmentKeys.byCard(cardId as any), queryFn: () => AttachmentService.getByCard(cardId as any), enabled: !!cardId, staleTime: 5 * 60 * 1000, ...options });

export const useAttachment = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanCardAttachment, Error>) =>
  useQuery({ queryKey: attachmentKeys.detail(id as any), queryFn: () => AttachmentService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useAttachmentMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateAttachment = (options?: UseMutationOptions<KanbanCardAttachment, Error, Partial<KanbanCardAttachment>>) =>
  useAttachmentMutation(AttachmentService.create as any, options);

export const useUpdateAttachment = (options?: UseMutationOptions<KanbanCardAttachment, Error, Partial<KanbanCardAttachment>>) =>
  useAttachmentMutation(AttachmentService.update as any, options);

export const useDeleteAttachment = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useAttachmentMutation<string | number, string | number>(AttachmentService.delete as any, options);

export const useInvalidateAttachments = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: attachmentKeys.all }); };
