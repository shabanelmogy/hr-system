export type CurrencyRecordStatus = 'active' | 'archived' | 'all';
export type CurrencySearchField = 'all' | 'currencyCode' | 'nameAr' | 'nameEn' | 'symbol';
export type CurrencySearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';
export type CurrencySortColumn = 'currencyCode' | 'nameAr' | 'nameEn' | 'symbol' | 'createdOn';

export interface Currency {
  id: number;
  currencyCode: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
  rowVersion: string;
}

export interface CurrencyLookup {
  id: number;
  currencyCode: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
}

export interface CurrencyRequest {
  currencyCode: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
}

export interface CurrencyFilters { recordStatus: CurrencyRecordStatus }
export interface CurrencyPageQuery extends CurrencyFilters {
  pageNumber: number;
  pageSize: number;
  search: string;
  searchField: CurrencySearchField;
  searchOperator: CurrencySearchOperator;
  sortBy: CurrencySortColumn;
  sortDirection: 'asc' | 'desc';
}
export interface CurrencyPageMetadata { currentPage: number; totalPages: number; pageSize: number; pageNumber: number; totalCount: number; hasPrev: boolean; hasNext: boolean }
export interface CurrencyPage { items: Currency[]; metaData: CurrencyPageMetadata }
