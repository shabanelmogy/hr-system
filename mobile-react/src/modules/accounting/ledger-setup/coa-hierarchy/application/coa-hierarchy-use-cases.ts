import type {
  Account,
  AccountHierarchyLevel,
  AccountHierarchyLevelRequest,
  AccountLookup,
  AccountPage,
  AccountPageQuery,
  AccountRecordStatus,
  AccountRequest,
  AccountTreeNode,
  ProposedAccountCode,
} from '../domain/models/coa-hierarchy';
import { normalizeAccountRequest, normalizeHierarchyLevelRequest } from '../domain/policies/coa-hierarchy-request-policy';
import type { CoaHierarchyRepository } from '../domain/repositories/coa-hierarchy-repository';

export interface SaveAccountInput { id: number | null; request: AccountRequest; rowVersion?: string }
export interface SaveHierarchyLevelInput { id: number | null; request: AccountHierarchyLevelRequest; rowVersion?: string }

export interface CoaHierarchyUseCases {
  getAccountPage(query: AccountPageQuery): Promise<AccountPage>;
  getAccountTree(): Promise<AccountTreeNode[]>;
  getAccount(id: number): Promise<Account>;
  getAccountLookup(): Promise<AccountLookup[]>;
  getAccountCodeProposal(): Promise<ProposedAccountCode>;
  saveAccount(input: SaveAccountInput): Promise<Account>;
  archiveAccount(id: number, rowVersion: string): Promise<void>;
  restoreAccount(id: number, rowVersion: string): Promise<Account>;
  getHierarchyLevels(recordStatus: AccountRecordStatus): Promise<AccountHierarchyLevel[]>;
  saveHierarchyLevel(input: SaveHierarchyLevelInput): Promise<AccountHierarchyLevel>;
  archiveHierarchyLevel(id: number, rowVersion: string): Promise<void>;
  restoreHierarchyLevel(id: number, rowVersion: string): Promise<AccountHierarchyLevel>;
}

export function createCoaHierarchyUseCases(repository: CoaHierarchyRepository): CoaHierarchyUseCases {
  return {
    getAccountPage: query => repository.getAccountPage(query),
    getAccountTree: () => repository.getAccountTree(),
    getAccount: id => repository.getAccount(id),
    getAccountLookup: () => repository.getAccountLookup(),
    getAccountCodeProposal: () => repository.getAccountCodeProposal(),
    saveAccount: ({ id, request, rowVersion }) => {
      const normalized = normalizeAccountRequest(request);
      if (id === null) return repository.createAccount(normalized);
      if (!rowVersion) throw new Error('Account rowVersion is required for update.');
      return repository.updateAccount(id, normalized, rowVersion);
    },
    archiveAccount: (id, rowVersion) => repository.archiveAccount(id, rowVersion),
    restoreAccount: (id, rowVersion) => repository.restoreAccount(id, rowVersion),
    getHierarchyLevels: recordStatus => repository.getHierarchyLevels(recordStatus),
    saveHierarchyLevel: ({ id, request, rowVersion }) => {
      const normalized = normalizeHierarchyLevelRequest(request);
      if (id === null) return repository.createHierarchyLevel(normalized);
      if (!rowVersion) throw new Error('Account hierarchy level rowVersion is required for update.');
      return repository.updateHierarchyLevel(id, normalized, rowVersion);
    },
    archiveHierarchyLevel: (id, rowVersion) => repository.archiveHierarchyLevel(id, rowVersion),
    restoreHierarchyLevel: (id, rowVersion) => repository.restoreHierarchyLevel(id, rowVersion),
  };
}
