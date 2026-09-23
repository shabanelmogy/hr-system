export type AccountRecordStatus = 'active' | 'archived' | 'all';
export type AccountSearchField = 'all' | 'code' | 'nameAr' | 'nameEn';
export type AccountSearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';
export type AccountSortColumn = 'code' | 'nameAr' | 'nameEn' | 'createdOn';
export type SortDirection = 'asc' | 'desc';
export type ManualPostingPolicy = 1 | 2 | 3;
export type AccountCurrencyPolicy = 1 | 2 | 3;

export interface Account {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  accountHierarchyLevelId: number;
  parentAccountId: number | null;
  allowPosting: boolean;
  manualPostingPolicy: ManualPostingPolicy;
  currencyPolicy: AccountCurrencyPolicy;
  specificCurrencyId: number | null;
  isDeleted: boolean;
  createdOn: string;
  updatedOn: string | null;
  rowVersion: string;
}

export interface AccountLookup {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  allowPosting: boolean;
}

export interface AccountTreeNode {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  allowPosting: boolean;
  parentAccountId: number | null;
}

export interface ProposedAccountCode { code: string }

export interface AccountRequest {
  code: string;
  nameAr: string;
  nameEn: string;
  accountHierarchyLevelId: number;
  parentAccountId: number | null;
  allowPosting: boolean;
  manualPostingPolicy: ManualPostingPolicy;
  currencyPolicy: AccountCurrencyPolicy;
  specificCurrencyId: number | null;
}

export interface AccountPageQuery {
  pageNumber: number;
  pageSize: number;
  search: string;
  searchField: AccountSearchField;
  searchOperator: AccountSearchOperator;
  recordStatus: AccountRecordStatus;
  sortBy: AccountSortColumn;
  sortDirection: SortDirection;
}

export interface AccountPageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface AccountPage { items: Account[]; metaData: AccountPageMetadata }

export interface AccountHierarchyLevel {
  id: number;
  levelNumber: number;
  nameAr: string;
  nameEn: string;
  canPost: boolean;
  isDeleted: boolean;
  rowVersion: string;
}

export interface AccountHierarchyLevelRequest {
  levelNumber: number;
  nameAr: string;
  nameEn: string;
  canPost: boolean;
}
