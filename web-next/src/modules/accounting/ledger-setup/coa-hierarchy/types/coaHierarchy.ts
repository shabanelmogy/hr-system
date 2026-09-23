import type { ManagementPageResponse } from "@/lib/api/pagination";

export type AccountRecordStatus = "active" | "archived" | "all";
export type AccountSearchField = "all" | "code" | "nameAr" | "nameEn";
export type AccountSearchOperator =
  | "contains"
  | "doesNotContain"
  | "equals"
  | "doesNotEqual"
  | "startsWith"
  | "endsWith";
export type AccountSortColumn = "code" | "nameAr" | "nameEn" | "createdOn";
export type AccountManualPostingPolicy = 1 | 2 | 3;
export type AccountCurrencyPolicy = 1 | 2 | 3;

export interface AccountListItem {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  accountHierarchyLevelId: number;
  parentAccountId: number | null;
  allowPosting: boolean;
  manualPostingPolicy: AccountManualPostingPolicy;
  currencyPolicy: AccountCurrencyPolicy;
  specificCurrencyId: number | null;
  isDeleted: boolean;
  createdOn: string;
  updatedOn: string | null;
  rowVersion: string;
}

export type AccountDetail = AccountListItem;

export interface AccountTreeNode {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  allowPosting: boolean;
  children: AccountTreeNode[];
}

export interface AccountTreeItem {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  allowPosting: boolean;
  parentAccountId: number | null;
}

export interface AccountLookup {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  allowPosting: boolean;
}

export interface ProposedAccountCode {
  code: string;
}

export interface AccountMutationRequest {
  code: string;
  nameAr: string;
  nameEn: string;
  accountHierarchyLevelId: number;
  parentAccountId: number | null;
  allowPosting: boolean;
  manualPostingPolicy: AccountManualPostingPolicy;
  currencyPolicy: AccountCurrencyPolicy;
  specificCurrencyId: number | null;
}

export interface AccountPageQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  searchField: AccountSearchField;
  searchOperator: AccountSearchOperator;
  recordStatus: AccountRecordStatus;
  sortBy: AccountSortColumn;
  sortDirection: "asc" | "desc";
}

export type AccountPageResponse = ManagementPageResponse<AccountListItem>;

export interface AccountHierarchyLevel {
  id: number;
  levelNumber: number;
  nameAr: string;
  nameEn: string;
  canPost: boolean;
  isDeleted: boolean;
  rowVersion: string;
}

export interface AccountHierarchyLevelMutationRequest {
  levelNumber: number;
  nameAr: string;
  nameEn: string;
  canPost: boolean;
}

export interface SelectOption {
  id: number | boolean;
  label: string;
}
