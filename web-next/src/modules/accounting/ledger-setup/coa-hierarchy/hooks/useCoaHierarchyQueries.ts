import {
  useQuery,
  type QueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useInvalidatingMutation } from "@/shared/query";
import { coaHierarchyService } from "../services/coaHierarchyService";
import type {
  AccountDetail,
  AccountHierarchyLevel,
  AccountHierarchyLevelMutationRequest,
  AccountMutationRequest,
  AccountRecordStatus,
} from "../types/coaHierarchy";
import { coaHierarchyKeys } from "./coaHierarchyQueryKeys";

export { coaHierarchyKeys } from "./coaHierarchyQueryKeys";

export const accountDetailQueryOptions = (id: number) => ({
  queryKey: coaHierarchyKeys.accountDetail(id),
  queryFn: () => coaHierarchyService.getAccount(id),
  staleTime: 0,
});

export const fetchFreshAccountDetail = (
  queryClient: QueryClient,
  id: number,
) =>
  queryClient.fetchQuery({
    ...accountDetailQueryOptions(id),
    staleTime: 0,
  });

export const useAccountTree = (enabled = true) =>
  useQuery({
    queryKey: coaHierarchyKeys.accountTree(),
    queryFn: coaHierarchyService.getAccountTree,
    enabled,
  });

export const useAccountDetail = (
  id?: number | null,
  enabled = true,
) =>
  useQuery({
    ...accountDetailQueryOptions(id ?? 0),
    enabled: enabled && !!id,
  });

export const useAccountLookup = (enabled = true) =>
  useQuery({
    queryKey: coaHierarchyKeys.accountLookup(),
    queryFn: coaHierarchyService.getAccountLookup,
    enabled,
    staleTime: 60_000,
  });

export const useAccountCodeProposal = (enabled = true) =>
  useQuery({
    queryKey: coaHierarchyKeys.codeProposal(),
    queryFn: coaHierarchyService.getCodeProposal,
    enabled,
    staleTime: 0,
  });

export const useHierarchyLevels = (
  recordStatus: AccountRecordStatus,
  enabled = true,
) =>
  useQuery({
    queryKey: coaHierarchyKeys.hierarchyLevelList(recordStatus),
    queryFn: () => coaHierarchyService.getHierarchyLevels(recordStatus),
    enabled,
  });

export const useCreateAccount = (
  options?: UseMutationOptions<AccountDetail, Error, AccountMutationRequest>,
) =>
  useInvalidatingMutation(
    coaHierarchyService.createAccount,
    [coaHierarchyKeys.accounts()],
    options,
  );

export const useUpdateAccount = (
  options?: UseMutationOptions<
    AccountDetail,
    Error,
    { id: number; request: AccountMutationRequest; rowVersion: string }
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.updateAccount,
    [coaHierarchyKeys.accounts()],
    options,
  );

export const useArchiveAccount = (
  options?: UseMutationOptions<
    number,
    Error,
    { id: number; rowVersion: string }
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.archiveAccount,
    [coaHierarchyKeys.accounts()],
    options,
  );

export const useRestoreAccount = (
  options?: UseMutationOptions<
    AccountDetail,
    Error,
    { id: number; rowVersion: string }
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.restoreAccount,
    [coaHierarchyKeys.accounts()],
    options,
  );

export const useCreateHierarchyLevel = (
  options?: UseMutationOptions<
    AccountHierarchyLevel,
    Error,
    AccountHierarchyLevelMutationRequest
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.createHierarchyLevel,
    [coaHierarchyKeys.all],
    options,
  );

export const useUpdateHierarchyLevel = (
  options?: UseMutationOptions<
    AccountHierarchyLevel,
    Error,
    {
      id: number;
      request: AccountHierarchyLevelMutationRequest;
      rowVersion: string;
    }
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.updateHierarchyLevel,
    [coaHierarchyKeys.all],
    options,
  );

export const useArchiveHierarchyLevel = (
  options?: UseMutationOptions<
    number,
    Error,
    { id: number; rowVersion: string }
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.archiveHierarchyLevel,
    [coaHierarchyKeys.all],
    options,
  );

export const useRestoreHierarchyLevel = (
  options?: UseMutationOptions<
    AccountHierarchyLevel,
    Error,
    { id: number; rowVersion: string }
  >,
) =>
  useInvalidatingMutation(
    coaHierarchyService.restoreHierarchyLevel,
    [coaHierarchyKeys.all],
    options,
  );
