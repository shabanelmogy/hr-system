import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  AccountDetail,
  AccountHierarchyLevel,
  AccountHierarchyLevelMutationRequest,
  AccountLookup,
  AccountMutationRequest,
  AccountPageQuery,
  AccountPageResponse,
  AccountRecordStatus,
  AccountTreeNode,
  ProposedAccountCode,
} from "../types/coaHierarchy";

const routes = apiRoutes.ledgerSetup.accounts;

export function normalizeAccountRequest(
  request: AccountMutationRequest,
): AccountMutationRequest {
  return {
    ...request,
    code: request.code.trim().toUpperCase(),
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
    parentAccountId: request.parentAccountId || null,
    specificCurrencyId:
      request.currencyPolicy === 3 ? request.specificCurrencyId || null : null,
  };
}

export function normalizeHierarchyLevelRequest(
  request: AccountHierarchyLevelMutationRequest,
): AccountHierarchyLevelMutationRequest {
  return {
    ...request,
    nameAr: request.nameAr.trim(),
    nameEn: request.nameEn.trim(),
  };
}

export const coaHierarchyService = {
  getAccountPage(query: AccountPageQuery): Promise<AccountPageResponse> {
    return apiService.get(routes.base, { ...query });
  },
  getAccountTree(): Promise<AccountTreeNode[]> {
    return apiService.get(routes.tree);
  },
  getAccountLookup(): Promise<AccountLookup[]> {
    return apiService.get(routes.lookup);
  },
  getAccount(id: number): Promise<AccountDetail> {
    return apiService.get(routes.getById(id));
  },
  getCodeProposal(): Promise<ProposedAccountCode> {
    return apiService.get(routes.codeProposal);
  },
  createAccount(request: AccountMutationRequest): Promise<AccountDetail> {
    return apiService.post(routes.base, normalizeAccountRequest(request));
  },
  updateAccount({
    id,
    request,
    rowVersion,
  }: {
    id: number;
    request: AccountMutationRequest;
    rowVersion: string;
  }): Promise<AccountDetail> {
    return apiService.put(routes.update(id), {
      ...normalizeAccountRequest(request),
      rowVersion,
    });
  },
  async archiveAccount({
    id,
    rowVersion,
  }: {
    id: number;
    rowVersion: string;
  }): Promise<number> {
    await apiService.delete(routes.update(id), { rowVersion });
    return id;
  },
  restoreAccount({
    id,
    rowVersion,
  }: {
    id: number;
    rowVersion: string;
  }): Promise<AccountDetail> {
    return apiService.post(routes.restore(id), { rowVersion });
  },
  getHierarchyLevels(
    recordStatus: AccountRecordStatus,
  ): Promise<AccountHierarchyLevel[]> {
    return apiService.get(routes.hierarchyLevels, { recordStatus });
  },
  createHierarchyLevel(
    request: AccountHierarchyLevelMutationRequest,
  ): Promise<AccountHierarchyLevel> {
    return apiService.post(
      routes.hierarchyLevels,
      normalizeHierarchyLevelRequest(request),
    );
  },
  updateHierarchyLevel({
    id,
    request,
    rowVersion,
  }: {
    id: number;
    request: AccountHierarchyLevelMutationRequest;
    rowVersion: string;
  }): Promise<AccountHierarchyLevel> {
    return apiService.put(routes.hierarchyLevelById(id), {
      ...normalizeHierarchyLevelRequest(request),
      rowVersion,
    });
  },
  async archiveHierarchyLevel({
    id,
    rowVersion,
  }: {
    id: number;
    rowVersion: string;
  }): Promise<number> {
    await apiService.delete(routes.hierarchyLevelById(id), { rowVersion });
    return id;
  },
  restoreHierarchyLevel({
    id,
    rowVersion,
  }: {
    id: number;
    rowVersion: string;
  }): Promise<AccountHierarchyLevel> {
    return apiService.post(routes.hierarchyLevelRestore(id), { rowVersion });
  },
};
