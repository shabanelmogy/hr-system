import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/platform/auth';

import { useErrorLogUseCases } from '../../composition/use-error-log-use-cases';
import type { ErrorLogCriteria, ErrorLogScope } from '../../domain/models/error-log';

export const errorLogKeys = {
  all: ['platform-tools', 'error-logs'] as const,
  list: (scope: ErrorLogScope, criteria: ErrorLogCriteria) => [...errorLogKeys.all, scope, 'list', criteria] as const,
  detail: (scope: ErrorLogScope, id: string) => [...errorLogKeys.all, scope, 'detail', id] as const,
  settings: () => [...errorLogKeys.all, 'system', 'settings'] as const,
};

export function useErrorLogs(scope: ErrorLogScope, criteria: ErrorLogCriteria, enabled: boolean) {
  const cases = useErrorLogUseCases();
  const actor = useErrorLogActor();
  return useQuery({ queryKey: [...errorLogKeys.list(scope, criteria), actor.key], queryFn: () => cases.list(scope, criteria), enabled: enabled && actor.allowed, staleTime: 0 });
}
export function useErrorLogDetail(scope: ErrorLogScope, id: string | null, enabled: boolean) {
  const cases = useErrorLogUseCases();
  const actor = useErrorLogActor();
  return useQuery({ queryKey: [...errorLogKeys.detail(scope, id ?? ''), actor.key], queryFn: () => cases.detail(scope, id!), enabled: enabled && actor.allowed && Boolean(id), staleTime: 0 });
}
export function useExportErrorLogs() {
  const cases = useErrorLogUseCases();
  return useMutation({ mutationFn: ({ scope, criteria }: { scope: ErrorLogScope; criteria: ErrorLogCriteria }) => cases.export(scope, criteria) });
}
export function useErrorLogSettings(enabled: boolean) {
  const cases = useErrorLogUseCases();
  const actor = useErrorLogActor();
  return useQuery({ queryKey: [...errorLogKeys.settings(), actor.key], queryFn: cases.settings, enabled: enabled && actor.allowed, staleTime: 0 });
}
export function useSaveErrorLogSettings() {
  const cases = useErrorLogUseCases();
  const client = useQueryClient();
  const actor = useErrorLogActor();
  return useMutation({
    mutationFn: ({ retentionDays, expectedRevision }: { retentionDays: number; expectedRevision: number }) => cases.saveSettings(retentionDays, expectedRevision),
    onSuccess: (settings) => client.setQueryData([...errorLogKeys.settings(), actor.key], settings),
  });
}

function useErrorLogActor() {
  const { session, isServerAuthenticated, isSwitchingCompany } = useAuth();
  return { key: [session?.userId, session?.tenantId, session?.companyId], allowed: isServerAuthenticated && !isSwitchingCompany };
}
