import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkforcePlanUseCases } from '../../composition/use-workforce-planning-use-cases';
import { useWorkforcePlanDraftPilot } from '../../composition/workforce-plan-draft-pilot';
import type { RejectWorkforcePlanAction, UpdateWorkforcePlanRequest, WorkforcePlanAction, WorkforcePlanDetail, WorkforcePlanPageQuery, WorkforcePlanRequest } from '../../domain/models/workforce-plan';
import type { WorkforcePlanEditingSnapshot } from '../../domain/models/workforce-plan-draft';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

export const workforcePlanKeys = { all: ['workforce-plans'] as const, list: (query: WorkforcePlanPageQuery) => [...workforcePlanKeys.all, 'list', query] as const, detail: (id: number) => [...workforcePlanKeys.all, 'detail', id] as const, revisions: (id: number) => [...workforcePlanKeys.all, 'revisions', id] as const, localDraft: (id: number) => [...workforcePlanKeys.all, 'local-draft', id] as const };
export const useWorkforcePlans = (query: WorkforcePlanPageQuery) => { const useCases = useWorkforcePlanUseCases(); return useQuery({ queryKey: workforcePlanKeys.list(query), queryFn: () => useCases.getPage(query), placeholderData: previous => previous }); };
export const useWorkforcePlan = (id: number | null, enabled = true) => { const useCases = useWorkforcePlanUseCases(); return useQuery({ queryKey: workforcePlanKeys.detail(id ?? 0), queryFn: () => useCases.getById(id!), enabled: enabled && !!id }); };
export const useWorkforcePlanRevisions = (id: number | null, enabled = true) => { const useCases = useWorkforcePlanUseCases(); return useQuery({ queryKey: workforcePlanKeys.revisions(id ?? 0), queryFn: () => useCases.getRevisions(id!), enabled: enabled && !!id }); };
function useInvalidatingMutation<T, TResult>(mutationFn: (value: T) => Promise<TResult>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async () => client.invalidateQueries({ queryKey: workforcePlanKeys.all }) }); }
export const useCreateWorkforcePlan = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((request: WorkforcePlanRequest) => useCases.create(request)); };
export const useUpdateWorkforcePlan = () => {
  const useCases = useWorkforcePlanUseCases();
  const { pilot, scope, isOnline, authenticated, canSaveDraft, canExecuteOfflineCommand } = useWorkforcePlanDraftPilot();
  const { isReadOnly } = useAppReadOnly();
  const client = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async ({ id, request, baseDetail, editingSnapshot, keepLocal }: { id: number; request: UpdateWorkforcePlanRequest; baseDetail: WorkforcePlanDetail; editingSnapshot: WorkforcePlanEditingSnapshot; keepLocal?: boolean }) => {
      if (isOnline && !keepLocal) return { kind: 'remote' as const, value: await useCases.update(id, request) };
      if (!pilot || !scope) throw new Error('Offline draft saving is available only on the native app in an authenticated company context.');
      if (!canSaveDraft) throw new Error('Offline draft saving is disabled by the current tenant/company policy.');
      if (isReadOnly) throw new Error('Workforce-plan changes are blocked while the tenant is read-only.');
      const value = await pilot.queue(scope, baseDetail, request, editingSnapshot, canExecuteOfflineCommand);
      if (canExecuteOfflineCommand && isOnline && authenticated) {
        await pilot.sync(scope, { authenticated: true, readOnly: false });
      }
      return { kind: canExecuteOfflineCommand ? 'queued' as const : 'draft' as const, value };
    },
    onSuccess: async (_, input) => {
      await client.invalidateQueries({ queryKey: workforcePlanKeys.localDraft(input.id) });
      if (isOnline) await client.invalidateQueries({ queryKey: workforcePlanKeys.all });
    },
  });
};
export const useWorkforcePlanLocalDraft = (id: number | null, enabled = true) => {
  const { pilot, scope } = useWorkforcePlanDraftPilot();
  return useQuery({
    queryKey: workforcePlanKeys.localDraft(id ?? 0),
    queryFn: () => pilot!.get(scope!, id!),
    enabled: enabled && !!id && !!pilot && !!scope,
    networkMode: 'always',
  });
};
export const useWorkforcePlanLocalDrafts = (enabled = true) => {
  const { pilot, scope } = useWorkforcePlanDraftPilot();
  return useQuery({
    queryKey: [...workforcePlanKeys.all, 'local-drafts'] as const,
    queryFn: () => pilot!.list(scope!),
    enabled: enabled && !!pilot && !!scope,
    networkMode: 'always',
  });
};
export const useDiscardWorkforcePlanLocalDraft = () => {
  const { pilot, scope } = useWorkforcePlanDraftPilot();
  const client = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (planId: number) => {
      if (!pilot || !scope) return;
      await pilot.discard(scope, planId);
    },
    onSuccess: async (_, planId) => client.invalidateQueries({ queryKey: workforcePlanKeys.localDraft(planId) }),
  });
};
export const useRetryWorkforcePlanLocalDraft = () => {
  const { pilot, scope, isOnline, authenticated, policyFresh } = useWorkforcePlanDraftPilot();
  const client = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: async (planId: number) => {
      if (!pilot || !scope) return null;
      const value = await pilot.retry(scope, planId);
      if (isOnline && authenticated && policyFresh) await pilot.sync(scope, { authenticated: true, readOnly: false });
      return value;
    },
    onSuccess: async (_, planId) => client.invalidateQueries({ queryKey: workforcePlanKeys.localDraft(planId) }),
  });
};
export const useArchiveWorkforcePlan = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: WorkforcePlanAction) => useCases.archive(action)); };
export const useRestoreWorkforcePlan = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: WorkforcePlanAction) => useCases.restore(action)); };
export const useSubmitWorkforcePlan = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: WorkforcePlanAction) => useCases.submit(action)); };
export const useBeginWorkforcePlanReview = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: WorkforcePlanAction) => useCases.beginReview(action)); };
export const useApproveWorkforcePlan = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: WorkforcePlanAction) => useCases.approve(action)); };
export const useRejectWorkforcePlan = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: RejectWorkforcePlanAction) => useCases.reject(action)); };
export const useCreateWorkforcePlanRevision = () => { const useCases = useWorkforcePlanUseCases(); return useInvalidatingMutation((action: WorkforcePlanAction) => useCases.createRevision(action)); };
