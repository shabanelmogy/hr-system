import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import CardService from "../services/cardService";
import type { KanbanCard } from "../types/Card";

export const cardKeys = {
  all: ["kanbanCards"] as const,
  list: () => [...cardKeys.all, "list"] as const,
  detail: (id: string | number) => [...cardKeys.all, "detail", id] as const,
};

export const useCards = (options?: UseQueryOptions<KanbanCard[], Error>) =>
  useQuery({ queryKey: cardKeys.list(), queryFn: CardService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useCard = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanCard, Error>) =>
  useQuery({ queryKey: cardKeys.detail(id!), queryFn: () => CardService.getById(id!), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useCardMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateCard = (options?: UseMutationOptions<KanbanCard, Error, Partial<KanbanCard>>) =>
  useCardMutation(CardService.create as any, options);

export const useUpdateCard = (options?: UseMutationOptions<KanbanCard, Error, Partial<KanbanCard>>) =>
  useCardMutation(CardService.update as any, options);

export const useDeleteCard = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useCardMutation<string | number, string | number>(CardService.delete as any, options);

export const useInvalidateCards = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: cardKeys.all }); };
