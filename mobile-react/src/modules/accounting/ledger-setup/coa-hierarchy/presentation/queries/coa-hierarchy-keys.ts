import type { AccountPageQuery, AccountRecordStatus } from '../../domain/models/coa-hierarchy';

export const coaHierarchyKeys = {
  all: ['accounting', 'ledger-setup', 'coa-hierarchy'] as const,
  accounts: () => [...coaHierarchyKeys.all, 'accounts'] as const,
  accountList: (query: AccountPageQuery) => [...coaHierarchyKeys.accounts(), 'list', query] as const,
  accountTree: () => [...coaHierarchyKeys.accounts(), 'tree'] as const,
  accountDetail: (id: number) => [...coaHierarchyKeys.accounts(), 'detail', id] as const,
  accountLookup: () => [...coaHierarchyKeys.accounts(), 'lookup'] as const,
  accountCodeProposal: (session: number) => [...coaHierarchyKeys.accounts(), 'code-proposal', session] as const,
  hierarchyLevels: (recordStatus: AccountRecordStatus) => [...coaHierarchyKeys.all, 'hierarchy-levels', recordStatus] as const,
};
