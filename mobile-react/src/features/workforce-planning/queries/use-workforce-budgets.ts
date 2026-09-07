import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workforceBudgetApi } from '../api/workforce-budget-api';
import type { RejectWorkforceBudgetAction, UpdateWorkforceBudgetRequest, WorkforceBudgetAction, WorkforceBudgetPageQuery, WorkforceBudgetRequest } from '../types/workforce-budget';
import { workforcePlanKeys } from './use-workforce-plans';

export const workforceBudgetKeys = { all: ['workforce-budgets'] as const, list: (query: WorkforceBudgetPageQuery) => [...workforceBudgetKeys.all, 'list', query] as const, detail: (id: number) => [...workforceBudgetKeys.all, 'detail', id] as const, sourcePlans: (query: object) => [...workforceBudgetKeys.all, 'source-plans', query] as const, sourcePlan: (planId: number) => [...workforceBudgetKeys.all, 'source-plan', planId] as const };
export const positionEnvelopeKeys = { all: ['position-envelopes'] as const, list: (query: object) => [...positionEnvelopeKeys.all, 'list', query] as const, detail: (id: number) => [...positionEnvelopeKeys.all, 'detail', id] as const };
export const useWorkforceBudgets = (query: WorkforceBudgetPageQuery) => useQuery({ queryKey: workforceBudgetKeys.list(query), queryFn: () => workforceBudgetApi.getPage(query), placeholderData: previous => previous });
export const useWorkforceBudget = (id: number | null, enabled = true) => useQuery({ queryKey: workforceBudgetKeys.detail(id ?? 0), queryFn: () => workforceBudgetApi.getById(id!), enabled: enabled && !!id });
export const useBudgetSourcePlans = (query: { pageNumber: number; pageSize: number; fiscalYearId?: number; search?: string }, enabled = true) => useQuery({ queryKey: workforceBudgetKeys.sourcePlans(query), queryFn: () => workforceBudgetApi.getSourcePlans(query), enabled, placeholderData: previous => previous });
export const useBudgetSourcePlan = (planId: number | null, enabled = true) => useQuery({ queryKey: workforceBudgetKeys.sourcePlan(planId ?? 0), queryFn: () => workforceBudgetApi.getSourcePlanById(planId!), enabled: enabled && !!planId });
export const usePositionEnvelopes = (query: { pageNumber: number; pageSize: number; fiscalYearId?: number; search?: string; sortBy: string; sortDirection: 'asc' | 'desc' }) => useQuery({ queryKey: positionEnvelopeKeys.list(query), queryFn: () => workforceBudgetApi.getEnvelopePage(query), placeholderData: previous => previous });
export const usePositionEnvelope = (id: number | null, enabled = true) => useQuery({ queryKey: positionEnvelopeKeys.detail(id ?? 0), queryFn: () => workforceBudgetApi.getEnvelopeById(id!), enabled: enabled && !!id });
function useBudgetMutation<T, TResult>(mutationFn: (value: T) => Promise<TResult>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => client.invalidateQueries({ queryKey: workforceBudgetKeys.all }) }); }
function useApprovalMutation<T, TResult>(mutationFn: (value: T) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: workforceBudgetKeys.all });
      await client.invalidateQueries({ queryKey: positionEnvelopeKeys.all });
      await client.invalidateQueries({ queryKey: workforcePlanKeys.all });
    },
  });
}
export const useCreateWorkforceBudget = () => useBudgetMutation((request: WorkforceBudgetRequest) => workforceBudgetApi.create(request));
export const useUpdateWorkforceBudget = () => useBudgetMutation(({ id, request }: { id: number; request: UpdateWorkforceBudgetRequest }) => workforceBudgetApi.update(id, request));
export const useSubmitWorkforceBudget = () => useBudgetMutation((action: WorkforceBudgetAction) => workforceBudgetApi.submit(action));
export const useApproveWorkforceBudget = () => useApprovalMutation((action: WorkforceBudgetAction) => workforceBudgetApi.approve(action));
export const useRejectWorkforceBudget = () => useBudgetMutation((action: RejectWorkforceBudgetAction) => workforceBudgetApi.reject(action));
