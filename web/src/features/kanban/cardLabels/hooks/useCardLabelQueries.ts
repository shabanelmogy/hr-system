import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import CardLabelService from "../services/cardLabelService";
import type { KanbanCardLabelLink } from "../types/CardLabel";

export const cardLabelKeys = {
  all: ["kanbanCardLabels"] as const,
  list: () => [...cardLabelKeys.all, "list"] as const,
  byCard: (cardId: string | number) => [...cardLabelKeys.all, "byCard", cardId] as const,
  detail: (id: string | number) => [...cardLabelKeys.all, "detail", id] as const,
};

export const useCardLabels = (options?: UseQueryOptions<KanbanCardLabelLink[], Error>) =>
  useQuery({ queryKey: cardLabelKeys.list(), queryFn: CardLabelService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useCardLabelsByCard = (cardId: string | number | null | undefined, options?: UseQueryOptions<KanbanCardLabelLink[], Error>) =>
  useQuery({ queryKey: cardLabelKeys.byCard(cardId as any), queryFn: () => CardLabelService.getByCard(cardId as any), enabled: !!cardId, staleTime: 5 * 60 * 1000, ...options });

export const useCardLabel = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanCardLabelLink, Error>) =>
  useQuery({ queryKey: cardLabelKeys.detail(id as any), queryFn: () => CardLabelService.getById(id as any), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

function useCardLabelMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: cardLabelKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateCardLabel = (options?: UseMutationOptions<KanbanCardLabelLink, Error, Partial<KanbanCardLabelLink>>) =>
  useCardLabelMutation(CardLabelService.create as any, options);

export const useUpdateCardLabel = (options?: UseMutationOptions<KanbanCardLabelLink, Error, Partial<KanbanCardLabelLink>>) =>
  useCardLabelMutation(CardLabelService.update as any, options);

export const useDeleteCardLabel = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useCardLabelMutation<string | number, string | number>(CardLabelService.delete as any, options);

export const useInvalidateCardLabels = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: cardLabelKeys.all }); };
