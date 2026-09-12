import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OrganizationalStructureUseCases } from '../../application/organizational-structure-use-cases';
import { useOrganizationalStructureUseCases } from '../../composition/use-organizational-structure-use-cases';
import type {
  OrganizationalResource,
  OrganizationalStructureQuery,
  OrganizationalStructureRequest,
} from '../../domain/models/organizational-structure';
import { organizationalStructureKeys } from './organizational-structure-keys';

export function useOrganizationalStructure(query: OrganizationalStructureQuery) {
  const useCases = useOrganizationalStructureUseCases();
  return useQuery({
    queryKey: organizationalStructureKeys.list(query),
    queryFn: () => useCases.getPage(query),
    placeholderData: (previous) => previous,
  });
}

export function useOrganizationalLookup(
  resource: OrganizationalResource,
  parentId?: number,
  enabled = true,
) {
  const useCases = useOrganizationalStructureUseCases();
  return useQuery({
    queryKey: organizationalStructureKeys.lookup(resource, parentId),
    queryFn: () => useCases.getLookup(resource, parentId),
    enabled,
    staleTime: 5 * 60_000,
  });
}

function useInvalidatingMutation<TVariables, TResult = unknown>(
  mutationFn: (variables: TVariables, useCases: OrganizationalStructureUseCases) => Promise<TResult>,
) {
  const useCases = useOrganizationalStructureUseCases();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: TVariables) => mutationFn(variables, useCases),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all }),
  });
}

export function useSaveOrganizationalItem() {
  return useInvalidatingMutation(
    (
      { resource, id, request }: { resource: OrganizationalResource; id: number | null; request: OrganizationalStructureRequest },
      useCases,
    ) => useCases.save({ resource, id, request }),
  );
}

export function useBulkCreateOrganizationalItems() {
  return useInvalidatingMutation(
    ({ resource, requests }: { resource: OrganizationalResource; requests: OrganizationalStructureRequest[] }, useCases) =>
      useCases.bulkCreate(resource, requests),
  );
}

export function useArchiveOrganizationalItem() {
  return useInvalidatingMutation(
    ({ resource, id }: { resource: OrganizationalResource; id: number }, useCases) => useCases.archive(resource, id),
  );
}

export function useRestoreOrganizationalItem() {
  return useInvalidatingMutation(
    ({ resource, id }: { resource: OrganizationalResource; id: number }, useCases) => useCases.restore(resource, id),
  );
}

export function useApproveJobDescription() {
  return useInvalidatingMutation(
    ({ id, effectiveDate, expiryDate }: { id: number; effectiveDate: string; expiryDate?: string }, useCases) =>
      useCases.approveJobDescription(id, { effectiveDate, expiryDate }),
  );
}

export function useRejectJobDescription() {
  return useInvalidatingMutation(
    ({ id, reason }: { id: number; reason: string }, useCases) => useCases.rejectJobDescription(id, reason),
  );
}

export function useOrganizationalChangeLogs(resource: OrganizationalResource, id?: number | null, enabled = true) {
  const useCases = useOrganizationalStructureUseCases();
  return useQuery({
    queryKey: id ? organizationalStructureKeys.changeLogs(resource, id) : ['disabled'],
    queryFn: () => useCases.getChangeLogs(resource, id!),
    enabled: Boolean(id && enabled),
    staleTime: 60_000,
  });
}
