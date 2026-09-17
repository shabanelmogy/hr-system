import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import WorkforceBudgetService from "../services/workforceBudgetService";
import type {
  BudgetSourcePlan,
  BudgetSourcePlanPageQuery,
  PositionEnvelopeDetail,
  PositionEnvelopePageQuery,
  RejectWorkforceBudgetMutation,
  UpdateWorkforceBudgetMutation,
  WorkforceBudgetActionMutation,
  WorkforceBudgetDetail,
  WorkforceBudgetMutationRequest,
  WorkforceBudgetPageQuery,
} from "../types/WorkforceBudget";
import {
  positionEnvelopeKeys,
  workforceBudgetKeys,
  workforcePlanKeys,
} from "./workforceQueryKeys";

export { positionEnvelopeKeys, workforceBudgetKeys } from "./workforceQueryKeys";

export const useWorkforceBudgetPage = (query: WorkforceBudgetPageQuery) => useQuery({ queryKey: workforceBudgetKeys.page(query), queryFn: () => WorkforceBudgetService.getPage(query), placeholderData: previous => previous });
export const useWorkforceBudget = (id?: number | null, enabled = true) => useQuery({ queryKey: workforceBudgetKeys.detail(id ?? 0), queryFn: () => WorkforceBudgetService.getById(id!), enabled: enabled && !!id });
export const useBudgetSourcePlans = (query: BudgetSourcePlanPageQuery, enabled = true) => useQuery({ queryKey: workforceBudgetKeys.sourcePlans(query), queryFn: () => WorkforceBudgetService.getSourcePlans(query), enabled, placeholderData: previous => previous });
export const useBudgetSourcePlan = (planId?: number | null, enabled = true) => useQuery({ queryKey: workforceBudgetKeys.sourcePlan(planId ?? 0), queryFn: () => WorkforceBudgetService.getSourcePlanById(planId!), enabled: enabled && !!planId });
export const usePositionEnvelopePage = (query: PositionEnvelopePageQuery) => useQuery({ queryKey: positionEnvelopeKeys.page(query), queryFn: () => WorkforceBudgetService.getEnvelopePage(query), placeholderData: previous => previous });
export const usePositionEnvelope = (id?: number | null, enabled = true) => useQuery({ queryKey: positionEnvelopeKeys.detail(id ?? 0), queryFn: () => WorkforceBudgetService.getEnvelopeById(id!), enabled: enabled && !!id });

function useBudgetMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, Error, TVariables>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, mutationContext) => {
      await client.invalidateQueries({ queryKey: workforceBudgetKeys.all });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
  });
}

function useApprovalMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, Error, TVariables>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: async (data, variables, context, mutationContext) => {
      await client.invalidateQueries({ queryKey: workforceBudgetKeys.all });
      await client.invalidateQueries({ queryKey: positionEnvelopeKeys.all });
      await client.invalidateQueries({ queryKey: workforcePlanKeys.all });
      await options?.onSuccess?.(data, variables, context, mutationContext);
    },
  });
}

export const useCreateWorkforceBudget = (options?: UseMutationOptions<WorkforceBudgetDetail, Error, WorkforceBudgetMutationRequest>) => useBudgetMutation(WorkforceBudgetService.create, options);
export const useUpdateWorkforceBudget = (options?: UseMutationOptions<WorkforceBudgetDetail, Error, UpdateWorkforceBudgetMutation>) => useBudgetMutation(WorkforceBudgetService.update, options);
export const useSubmitWorkforceBudget = (options?: UseMutationOptions<WorkforceBudgetDetail, Error, WorkforceBudgetActionMutation>) => useBudgetMutation(WorkforceBudgetService.submit, options);
export const useApproveWorkforceBudget = (options?: UseMutationOptions<WorkforceBudgetDetail, Error, WorkforceBudgetActionMutation>) => useApprovalMutation(WorkforceBudgetService.approve, options);
export const useRejectWorkforceBudget = (options?: UseMutationOptions<WorkforceBudgetDetail, Error, RejectWorkforceBudgetMutation>) => useBudgetMutation(WorkforceBudgetService.reject, options);
export const useBudgetSourcePlanForForm = (planId?: number | null, enabled = true): { data?: BudgetSourcePlan; isLoading: boolean; isFetching: boolean } => {
  const query = useBudgetSourcePlan(planId, enabled);
  return { data: query.data, isLoading: query.isLoading, isFetching: query.isFetching };
};
export type { PositionEnvelopeDetail };
