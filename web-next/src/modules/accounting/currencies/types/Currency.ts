import type { ManagementPageResponse } from "@/lib/api/pagination";

export type CurrencyRecordStatus = "active" | "archived" | "all";
export type CurrencySearchField = "all" | "currencyCode" | "nameAr" | "nameEn" | "symbol";
export type CurrencySearchOperator = "contains" | "doesNotContain" | "equals" | "doesNotEqual" | "startsWith" | "endsWith";
export type CurrencySortColumn = "currencyCode" | "nameAr" | "nameEn" | "symbol" | "createdOn";

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

export interface CurrencyMutationRequest {
  currencyCode: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
}

export interface CurrencyPageQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  searchField: CurrencySearchField;
  searchOperator: CurrencySearchOperator;
  recordStatus: CurrencyRecordStatus;
  sortBy: CurrencySortColumn;
  sortDirection: "asc" | "desc";
}

export type CurrencyPageResponse = ManagementPageResponse<Currency>;
