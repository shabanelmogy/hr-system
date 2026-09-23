import type {
  AccountPageQuery,
  AccountRecordStatus,
} from "../types/coaHierarchy";

export const coaHierarchyKeys = {
  all: ["ledger-setup-coa-hierarchy"] as const,
  accounts: () => [...coaHierarchyKeys.all, "accounts"] as const,
  accountPages: () => [...coaHierarchyKeys.accounts(), "page"] as const,
  accountPage: (query: AccountPageQuery) =>
    [...coaHierarchyKeys.accountPages(), query] as const,
  accountTree: () => [...coaHierarchyKeys.accounts(), "tree"] as const,
  accountLookup: () => [...coaHierarchyKeys.accounts(), "lookup"] as const,
  accountDetails: () => [...coaHierarchyKeys.accounts(), "detail"] as const,
  accountDetail: (id: number) =>
    [...coaHierarchyKeys.accountDetails(), id] as const,
  codeProposal: () => [...coaHierarchyKeys.accounts(), "code-proposal"] as const,
  hierarchyLevels: () => [...coaHierarchyKeys.all, "hierarchy-levels"] as const,
  hierarchyLevelList: (recordStatus: AccountRecordStatus) =>
    [...coaHierarchyKeys.hierarchyLevels(), recordStatus] as const,
};
