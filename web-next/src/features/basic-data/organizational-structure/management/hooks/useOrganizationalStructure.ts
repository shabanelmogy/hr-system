import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationalStructureService } from "../services/organizationalStructureService";
import type {
  OrganizationalResource,
  OrganizationalStructureMutation,
  OrganizationalStructurePageQuery,
  UpdateOrganizationalStructureMutation,
} from "../types/OrganizationalStructure";

export const organizationalStructureKeys = {
  all: ["organizational-structure"] as const,
  page: (query: OrganizationalStructurePageQuery) => [...organizationalStructureKeys.all, "page", query] as const,
  lookup: (resource: OrganizationalResource, parentId?: number) => [...organizationalStructureKeys.all, "lookup", resource, parentId ?? "all"] as const,
  changeLogs: (resource: OrganizationalResource, id: number) => [...organizationalStructureKeys.all, "changeLogs", resource, id] as const,
};

export const useOrganizationalStructurePage = (query: OrganizationalStructurePageQuery, enabled = true) => useQuery({
  queryKey: organizationalStructureKeys.page(query),
  queryFn: () => organizationalStructureService.getPage(query),
  placeholderData: (previous) => previous,
  enabled,
  staleTime: 30_000,
});

export const useOrganizationalLookup = (resource: OrganizationalResource, parentId?: number, enabled = true) => useQuery({
  queryKey: organizationalStructureKeys.lookup(resource, parentId),
  queryFn: () => organizationalStructureService.getLookup(resource, parentId),
  enabled,
  staleTime: 5 * 60_000,
  // Parent records can be created from a different organizational route (or
  // browser tab) while this form's previous lookup result is still fresh.
  // Always revalidate when the dependent form mounts so new branches,
  // departments, and divisions immediately enable their mock-data action.
  refetchOnMount: "always",
});

const useInvalidateMutation = <TData, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: organizationalStructureKeys.all }),
  });
};

export const useCreateOrganizationalItem = () => useInvalidateMutation(
  (variables: { resource: OrganizationalResource; request: OrganizationalStructureMutation }) => organizationalStructureService.create(variables),
);
export const useBulkCreateOrganizationalItems = () => useInvalidateMutation(
  (variables: { resource: OrganizationalResource; requests: OrganizationalStructureMutation[] }) => organizationalStructureService.bulkCreate(variables),
);
export const useUpdateOrganizationalItem = () => useInvalidateMutation(
  (variables: UpdateOrganizationalStructureMutation) => organizationalStructureService.update(variables),
);
export const useArchiveOrganizationalItem = () => useInvalidateMutation(
  (variables: { resource: OrganizationalResource; id: number }) => organizationalStructureService.archive(variables),
);
export const useRestoreOrganizationalItem = () => useInvalidateMutation(
  (variables: { resource: OrganizationalResource; id: number }) => organizationalStructureService.restore(variables),
);
export const useApproveJobDescription = () => useInvalidateMutation(
  (variables: { id: number; effectiveDate: string; expiryDate?: string }) => organizationalStructureService.approve(variables.id, variables.effectiveDate, variables.expiryDate),
);
export const useRejectJobDescription = () => useInvalidateMutation(
  (variables: { id: number; reason: string }) => organizationalStructureService.reject(variables.id, variables.reason),
);

export const useOrganizationalChangeLogs = (resource: OrganizationalResource, id?: number | null, enabled = true) => useQuery({
  queryKey: id ? organizationalStructureKeys.changeLogs(resource, id) : ["disabled"],
  queryFn: () => organizationalStructureService.getChangeLogs(resource, id!),
  enabled: Boolean(id && enabled),
  staleTime: 60_000,
});
