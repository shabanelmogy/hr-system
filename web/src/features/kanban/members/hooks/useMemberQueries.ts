import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import MemberService from "../services/memberService";
import type { KanbanBoardMember } from "../types/Member";

export const memberKeys = {
  all: ["kanbanBoardMembers"] as const,
  list: () => [...memberKeys.all, "list"] as const,
  byBoard: (boardId: string | number) => [...memberKeys.all, "byBoard", boardId] as const,
  detail: (id: string | number) => [...memberKeys.all, "detail", id] as const,
};

export const useMembers = (options?: UseQueryOptions<KanbanBoardMember[], Error>) =>
  useQuery({ queryKey: memberKeys.list(), queryFn: MemberService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useMembersByBoard = (boardId: string | number | null | undefined, options?: UseQueryOptions<KanbanBoardMember[], Error>) =>
  useQuery({ queryKey: memberKeys.byBoard(boardId as any), queryFn: () => MemberService.getByBoard(boardId as any), enabled: !!boardId, staleTime: 5 * 60 * 1000, ...options });

export const useMember = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanBoardMember, Error>) =>
  useQuery({ queryKey: memberKeys.detail(id as any), queryFn: () => MemberService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useMemberMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateMember = (options?: UseMutationOptions<KanbanBoardMember, Error, Partial<KanbanBoardMember>>) =>
  useMemberMutation(MemberService.create as any, options);

export const useUpdateMember = (options?: UseMutationOptions<KanbanBoardMember, Error, Partial<KanbanBoardMember>>) =>
  useMemberMutation(MemberService.update as any, options);

export const useDeleteMember = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useMemberMutation<string | number, string | number>(MemberService.delete as any, options);

export const useInvalidateMembers = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: memberKeys.all }); };
