import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import AssigneeService from "../services/assigneeService";
import type { KanbanCardAssignee } from "../types/Assignee";

export const assigneeKeys = {
  all: ["kanbanCardAssignees"] as const,
  list: () => [...assigneeKeys.all, "list"] as const,
  byCard: (cardId: string | number) => [...assigneeKeys.all, "byCard", cardId] as const,
  byUser: (userId: string | number) => [...assigneeKeys.all, "byUser", userId] as const,
  detail: (id: string | number) => [...assigneeKeys.all, "detail", id] as const,
};

export const useAssignees = (options?: UseQueryOptions<KanbanCardAssignee[], Error>) =>
  useQuery({ queryKey: assigneeKeys.list(), queryFn: AssigneeService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useAssigneesByCard = (cardId: string | number | null | undefined, options?: UseQueryOptions<KanbanCardAssignee[], Error>) =>
  useQuery({ queryKey: assigneeKeys.byCard(cardId as any), queryFn: () => AssigneeService.getByCard(cardId as any), enabled: !!cardId, staleTime: 5 * 60 * 1000, ...options });

export const useAssigneesByUser = (userId: string | number | null | undefined, options?: UseQueryOptions<KanbanCardAssignee[], Error>) =>
  useQuery({ queryKey: assigneeKeys.byUser(userId as any), queryFn: () => AssigneeService.getByUser(userId as any), enabled: !!userId, staleTime: 5 * 60 * 1000, ...options });

export const useAssignee = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanCardAssignee, Error>) =>
  useQuery({ queryKey: assigneeKeys.detail(id as any), queryFn: () => AssigneeService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useAssigneeMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: assigneeKeys.all });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

export const useCreateAssignee = (options?: UseMutationOptions<KanbanCardAssignee, Error, Partial<KanbanCardAssignee>>) =>
  useAssigneeMutation(AssigneeService.create as any, options);

export const useUpdateAssignee = (options?: UseMutationOptions<KanbanCardAssignee, Error, Partial<KanbanCardAssignee>>) =>
  useAssigneeMutation(AssigneeService.update as any, options);

export const useDeleteAssignee = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useAssigneeMutation<string | number, string | number>(AssigneeService.delete as any, options);

export const useInvalidateAssignees = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: assigneeKeys.all }); };
