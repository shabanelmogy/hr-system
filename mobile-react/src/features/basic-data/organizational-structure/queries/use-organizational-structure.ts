import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationalStructureApi } from '../api/organizational-structure-api';
import { organizationalStructureKeys } from './organizational-structure-keys';
import type { OrganizationalResource, OrganizationalStructureQuery, OrganizationalStructureRequest } from '../types/organizational-structure';

export function useOrganizationalStructure(query: OrganizationalStructureQuery) { return useQuery({ queryKey: organizationalStructureKeys.list(query), queryFn: () => organizationalStructureApi.getPage(query), placeholderData: (previous) => previous }); }
export function useOrganizationalLookup(resource: OrganizationalResource, parentId?: number, enabled = true) { return useQuery({ queryKey: organizationalStructureKeys.lookup(resource, parentId), queryFn: () => organizationalStructureApi.getLookup(resource, parentId), enabled, staleTime: 5 * 60_000 }); }
function useInvalidatingMutation<TVariables, TResult = unknown>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: async () => queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all }) });
}
export function useSaveOrganizationalItem() { return useInvalidatingMutation(({ resource, id, request }: { resource: OrganizationalResource; id: number | null; request: OrganizationalStructureRequest }) => id === null ? organizationalStructureApi.create(resource, request) : organizationalStructureApi.update(resource, id, request)); }
export function useBulkCreateOrganizationalItems() { return useInvalidatingMutation(({ resource, requests }: { resource: OrganizationalResource; requests: OrganizationalStructureRequest[] }) => organizationalStructureApi.bulkCreate(resource, requests)); }
export function useArchiveOrganizationalItem() { return useInvalidatingMutation(({ resource, id }: { resource: OrganizationalResource; id: number }) => organizationalStructureApi.archive(resource, id)); }
export function useRestoreOrganizationalItem() { return useInvalidatingMutation(({ resource, id }: { resource: OrganizationalResource; id: number }) => organizationalStructureApi.restore(resource, id)); }
export function useApproveJobDescription() { return useInvalidatingMutation(({ id, effectiveDate, expiryDate }: { id: number; effectiveDate: string; expiryDate?: string }) => organizationalStructureApi.approve(id, { effectiveDate, expiryDate })); }
export function useRejectJobDescription() { return useInvalidatingMutation(({ id, reason }: { id: number; reason: string }) => organizationalStructureApi.reject(id, reason)); }
export function useOrganizationalChangeLogs(resource: OrganizationalResource, id?: number | null, enabled = true) {
  return useQuery({
    queryKey: id ? organizationalStructureKeys.changeLogs(resource, id) : ['disabled'],
    queryFn: () => organizationalStructureApi.getChangeLogs(resource, id!),
    enabled: Boolean(id && enabled),
    staleTime: 60_000,
  });
}
