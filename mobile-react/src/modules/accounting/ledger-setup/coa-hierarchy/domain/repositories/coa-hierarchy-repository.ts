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
} from '../models/coa-hierarchy';

export interface CoaHierarchyRepository {
  getAccountPage(query: AccountPageQuery): Promise<AccountPage>;
  getAccountTree(): Promise<AccountTreeNode[]>;
  getAccount(id: number): Promise<Account>;
  getAccountLookup(): Promise<AccountLookup[]>;
  getAccountCodeProposal(): Promise<ProposedAccountCode>;
  createAccount(request: AccountRequest): Promise<Account>;
  updateAccount(id: number, request: AccountRequest, rowVersion: string): Promise<Account>;
  archiveAccount(id: number, rowVersion: string): Promise<void>;
  restoreAccount(id: number, rowVersion: string): Promise<Account>;
  getHierarchyLevels(recordStatus: AccountRecordStatus): Promise<AccountHierarchyLevel[]>;
  createHierarchyLevel(request: AccountHierarchyLevelRequest): Promise<AccountHierarchyLevel>;
  updateHierarchyLevel(id: number, request: AccountHierarchyLevelRequest, rowVersion: string): Promise<AccountHierarchyLevel>;
  archiveHierarchyLevel(id: number, rowVersion: string): Promise<void>;
  restoreHierarchyLevel(id: number, rowVersion: string): Promise<AccountHierarchyLevel>;
}
