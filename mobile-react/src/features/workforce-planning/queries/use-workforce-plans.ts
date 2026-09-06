import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workforcePlanApi } from '../api/workforce-plan-api';
import type { RejectWorkforcePlanAction, UpdateWorkforcePlanRequest, WorkforcePlanAction, WorkforcePlanPageQuery, WorkforcePlanRequest } from '../types/workforce-plan';

export const workforcePlanKeys = { all: ['workforce-plans'] as const, list: (query: WorkforcePlanPageQuery) => [...workforcePlanKeys.all, 'list', query] as const, detail: (id: number) => [...workforcePlanKeys.all, 'detail', id] as const, revisions: (id: number) => [...workforcePlanKeys.all, 'revisions', id] as const };
export const useWorkforcePlans = (query: WorkforcePlanPageQuery) => useQuery({ queryKey: workforcePlanKeys.list(query), queryFn: () => workforcePlanApi.getPage(query), placeholderData: previous => previous });
export const useWorkforcePlan = (id: number | null, enabled = true) => useQuery({ queryKey: workforcePlanKeys.detail(id ?? 0), queryFn: () => workforcePlanApi.getById(id!), enabled: enabled && !!id });
export const useWorkforcePlanRevisions = (id: number | null, enabled = true) => useQuery({ queryKey: workforcePlanKeys.revisions(id ?? 0), queryFn: () => workforcePlanApi.getRevisions(id!), enabled: enabled && !!id });
function useInvalidatingMutation<T, TResult>(mutationFn: (value: T) => Promise<TResult>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => client.invalidateQueries({ queryKey: workforcePlanKeys.all }) }); }
export const useCreateWorkforcePlan = () => useInvalidatingMutation((request: WorkforcePlanRequest) => workforcePlanApi.create(request));
export const useUpdateWorkforcePlan = () => useInvalidatingMutation(({ id, request }: { id: number; request: UpdateWorkforcePlanRequest }) => workforcePlanApi.update(id, request));
export const useArchiveWorkforcePlan = () => useInvalidatingMutation((action: WorkforcePlanAction) => workforcePlanApi.archive(action));
export const useRestoreWorkforcePlan = () => useInvalidatingMutation((action: WorkforcePlanAction) => workforcePlanApi.restore(action));
export const useSubmitWorkforcePlan = () => useInvalidatingMutation((action: WorkforcePlanAction) => workforcePlanApi.submit(action));
export const useBeginWorkforcePlanReview = () => useInvalidatingMutation((action: WorkforcePlanAction) => workforcePlanApi.beginReview(action));
export const useApproveWorkforcePlan = () => useInvalidatingMutation((action: WorkforcePlanAction) => workforcePlanApi.approve(action));
export const useRejectWorkforcePlan = () => useInvalidatingMutation((action: RejectWorkforcePlanAction) => workforcePlanApi.reject(action));
export const useCreateWorkforcePlanRevision = () => useInvalidatingMutation((action: WorkforcePlanAction) => workforcePlanApi.createRevision(action));
