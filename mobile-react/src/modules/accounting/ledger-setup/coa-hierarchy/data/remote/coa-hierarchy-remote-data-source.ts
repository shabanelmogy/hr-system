import { apiService } from '@/src/core/api';
import type {
  Account,
  AccountHierarchyLevel,
  AccountHierarchyLevelRequest,
  AccountLookup,
  AccountPage,
  AccountPageQuery,
  AccountRecordStatus,
  AccountRequest,
  ProposedAccountCode,
} from '../../domain/models/coa-hierarchy';
import { coaHierarchyEndpoints } from './coa-hierarchy-endpoints';
import {
  accountHierarchyLevelListSchema,
  accountHierarchyLevelSchema,
  accountLookupSchema,
  accountPageSchema,
  accountSchema,
  accountTreeSchema,
  type AccountTreeTransport,
  proposedAccountCodeSchema,
} from './coa-hierarchy-schemas';

export interface CoaHierarchyRemoteDataSource {
  getAccountPage(query: AccountPageQuery): Promise<AccountPage>;
  getAccountTree(): Promise<AccountTreeTransport[]>;
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

export function toAccountPageQuery(query: AccountPageQuery): string {
  const params = new URLSearchParams({
    pageNumber: String(query.pageNumber),
    pageSize: String(query.pageSize),
    searchField: query.searchField,
    searchOperator: query.searchOperator,
    recordStatus: query.recordStatus,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  if (query.search.trim()) params.set('search', query.search.trim());
  return params.toString();
}

export const coaHierarchyRemoteDataSource: CoaHierarchyRemoteDataSource = {
  async getAccountPage(query) { return accountPageSchema.parse(await apiService.get<unknown>(`${coaHierarchyEndpoints.accounts}?${toAccountPageQuery(query)}`)); },
  async getAccountTree() { return accountTreeSchema.parse(await apiService.get<unknown>(coaHierarchyEndpoints.accountTree)); },
  async getAccount(id) { return accountSchema.parse(await apiService.get<unknown>(coaHierarchyEndpoints.account(id))); },
  async getAccountLookup() { return accountLookupSchema.parse(await apiService.get<unknown>(coaHierarchyEndpoints.accountLookup)); },
  async getAccountCodeProposal() { return proposedAccountCodeSchema.parse(await apiService.get<unknown>(coaHierarchyEndpoints.accountCodeProposal)); },
  async createAccount(request) { return accountSchema.parse(await apiService.post<unknown, AccountRequest>(coaHierarchyEndpoints.accounts, request)); },
  async updateAccount(id, request, rowVersion) { return accountSchema.parse(await apiService.put<unknown, AccountRequest & { rowVersion: string }>(coaHierarchyEndpoints.account(id), { ...request, rowVersion })); },
  async archiveAccount(id, rowVersion) { await apiService.delete<unknown>(coaHierarchyEndpoints.account(id), { data: { rowVersion } }); },
  async restoreAccount(id, rowVersion) { return accountSchema.parse(await apiService.post<unknown, { rowVersion: string }>(coaHierarchyEndpoints.accountRestore(id), { rowVersion })); },
  async getHierarchyLevels(recordStatus) { return accountHierarchyLevelListSchema.parse(await apiService.get<unknown>(`${coaHierarchyEndpoints.hierarchyLevels}?recordStatus=${encodeURIComponent(recordStatus)}`)); },
  async createHierarchyLevel(request) { return accountHierarchyLevelSchema.parse(await apiService.post<unknown, AccountHierarchyLevelRequest>(coaHierarchyEndpoints.hierarchyLevels, request)); },
  async updateHierarchyLevel(id, request, rowVersion) { return accountHierarchyLevelSchema.parse(await apiService.put<unknown, AccountHierarchyLevelRequest & { rowVersion: string }>(coaHierarchyEndpoints.hierarchyLevel(id), { ...request, rowVersion })); },
  async archiveHierarchyLevel(id, rowVersion) { await apiService.delete<unknown>(coaHierarchyEndpoints.hierarchyLevel(id), { data: { rowVersion } }); },
  async restoreHierarchyLevel(id, rowVersion) { return accountHierarchyLevelSchema.parse(await apiService.post<unknown, { rowVersion: string }>(coaHierarchyEndpoints.hierarchyLevelRestore(id), { rowVersion })); },
};
