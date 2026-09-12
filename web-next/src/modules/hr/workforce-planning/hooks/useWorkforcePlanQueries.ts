import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import WorkforcePlanService from "../services/workforcePlanService";
import type { RejectWorkforcePlanMutation, WorkforcePlanActionMutation, WorkforcePlanDetail, WorkforcePlanMutationRequest, WorkforcePlanPageQuery, UpdateWorkforcePlanMutation } from "../types/WorkforcePlan";

export const workforcePlanKeys = {
  all: ["workforcePlans"] as const,
  page: (query: WorkforcePlanPageQuery) => [...workforcePlanKeys.all, "page", query] as const,
  detail: (id: number) => [...workforcePlanKeys.all, "detail", id] as const,
  revisions: (id: number) => [...workforcePlanKeys.all, "revisions", id] as const,
};

export const useWorkforcePlanPage = (query: WorkforcePlanPageQuery) => useQuery({ queryKey: workforcePlanKeys.page(query), queryFn: () => WorkforcePlanService.getPage(query), placeholderData: previous => previous });
export const useWorkforcePlan = (id?: number | null, enabled = true) => useQuery({ queryKey: workforcePlanKeys.detail(id ?? 0), queryFn: () => WorkforcePlanService.getById(id!), enabled: enabled && !!id });
export const useWorkforcePlanRevisions = (id?: number | null, enabled = true) => useQuery({ queryKey: workforcePlanKeys.revisions(id ?? 0), queryFn: () => WorkforcePlanService.getRevisions(id!), enabled: enabled && !!id });

function useInvalidatingMutation<TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, Error, TVariables>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, ...options, onSuccess: async (data, variables, context, mutationContext) => { await client.invalidateQueries({ queryKey: workforcePlanKeys.all }); await options?.onSuccess?.(data, variables, context, mutationContext); } });
}

export const useCreateWorkforcePlan = (options?: UseMutationOptions<WorkforcePlanDetail, Error, WorkforcePlanMutationRequest>) => useInvalidatingMutation(WorkforcePlanService.create, options);
export const useUpdateWorkforcePlan = (options?: UseMutationOptions<WorkforcePlanDetail, Error, UpdateWorkforcePlanMutation>) => useInvalidatingMutation(WorkforcePlanService.update, options);
export const useArchiveWorkforcePlan = (options?: UseMutationOptions<void, Error, WorkforcePlanActionMutation>) => useInvalidatingMutation(WorkforcePlanService.archive, options);
export const useRestoreWorkforcePlan = (options?: UseMutationOptions<WorkforcePlanDetail, Error, WorkforcePlanActionMutation>) => useInvalidatingMutation(WorkforcePlanService.restore, options);
export const useSubmitWorkforcePlan = (options?: UseMutationOptions<WorkforcePlanDetail, Error, WorkforcePlanActionMutation>) => useInvalidatingMutation(WorkforcePlanService.submit, options);
export const useBeginWorkforcePlanReview = (options?: UseMutationOptions<WorkforcePlanDetail, Error, WorkforcePlanActionMutation>) => useInvalidatingMutation(WorkforcePlanService.beginReview, options);
export const useApproveWorkforcePlan = (options?: UseMutationOptions<WorkforcePlanDetail, Error, WorkforcePlanActionMutation>) => useInvalidatingMutation(WorkforcePlanService.approve, options);
export const useRejectWorkforcePlan = (options?: UseMutationOptions<WorkforcePlanDetail, Error, RejectWorkforcePlanMutation>) => useInvalidatingMutation(WorkforcePlanService.reject, options);
export const useCreateWorkforcePlanRevision = (options?: UseMutationOptions<WorkforcePlanDetail, Error, WorkforcePlanActionMutation>) => useInvalidatingMutation(WorkforcePlanService.createRevision, options);
