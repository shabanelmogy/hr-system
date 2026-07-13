import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import BoardService from "../services/boardService";
import type { KanbanBoard } from "../types/Board";

export const boardKeys = {
  all: ["kanbanBoards"] as const,
  list: () => [...boardKeys.all, "list"] as const,
  detail: (id: string | number) => [...boardKeys.all, "detail", id] as const,
};

export const useBoards = (options?: UseQueryOptions<KanbanBoard[], Error>) =>
  useQuery({ queryKey: boardKeys.list(), queryFn: BoardService.getAll, staleTime: 5 * 60 * 1000, ...options });

export const useBoard = (id: string | number | null | undefined, options?: UseQueryOptions<KanbanBoard, Error>) =>
  useQuery({ queryKey: boardKeys.detail(id!), queryFn: () => BoardService.getById(id!), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

export const useBoardSearch = (term: string, existing: KanbanBoard[] = []) =>
  useMemo(() => { if (!term.trim()) return existing; return BoardService.search(existing, term); }, [term, existing]);

function useBoardMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export const useCreateBoard = (options?: UseMutationOptions<KanbanBoard, Error, Partial<KanbanBoard>>) =>
  useBoardMutation(BoardService.create as any, options);

export const useUpdateBoard = (options?: UseMutationOptions<KanbanBoard, Error, Partial<KanbanBoard>>) =>
  useBoardMutation(BoardService.update as any, options);

export const useDeleteBoard = (options?: UseMutationOptions<string | number, Error, string | number>) =>
  useBoardMutation<string | number, string | number>(BoardService.delete as any, options);

export const useInvalidateBoards = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: boardKeys.all }); };
