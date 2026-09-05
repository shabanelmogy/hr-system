import type { ManagementPageResponse } from "@/lib/api/pagination";

export type FiscalPeriodFrequency = 1 | 2;
export type FiscalYearStatus = 1 | 2 | 3 | 4 | 5;
export type FiscalPeriodStatus = 1 | 2 | 3 | 4;
export type FiscalYearRecordStatus = "active" | "archived" | "all";
export type FiscalYearLifecycleFilter = "all" | "draft" | "open" | "closing" | "closed" | "locked";
export type FiscalYearSearchField = "all" | "code" | "nameAr" | "nameEn";
export type FiscalYearSearchOperator = "contains" | "doesNotContain" | "equals" | "doesNotEqual" | "startsWith" | "endsWith";
export type FiscalYearSortColumn = "code" | "nameAr" | "nameEn" | "startDate" | "endDate" | "status" | "createdOn";

export interface FiscalPeriod {
  id: number;
  sequence: number;
  code: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  status: FiscalPeriodStatus;
}

export interface FiscalYearListItem {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  periodFrequency: FiscalPeriodFrequency;
  status: FiscalYearStatus;
  periodsCount: number;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
  rowVersion: string;
}

export interface FiscalYearDetail extends Omit<FiscalYearListItem, "periodsCount"> {
  periods: FiscalPeriod[];
}

export interface FiscalYearLookup {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  status: FiscalYearStatus;
}

export interface FiscalYearMutationRequest {
  code: string;
  nameAr: string;
  nameEn: string;
  startDate: string;
  endDate: string;
  periodFrequency: FiscalPeriodFrequency;
}

export interface UpdateFiscalYearMutation {
  id: number;
  request: FiscalYearMutationRequest & { rowVersion: string };
}

export interface FiscalYearPageQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  searchField: FiscalYearSearchField;
  searchOperator: FiscalYearSearchOperator;
  recordStatus: FiscalYearRecordStatus;
  lifecycleStatus: FiscalYearLifecycleFilter;
  sortBy: FiscalYearSortColumn;
  sortDirection: "asc" | "desc";
}

export type FiscalYearPageResponse = ManagementPageResponse<FiscalYearListItem>;
export type FiscalYearLifecycleAction = "open" | "beginClosing" | "close" | "lock";

export interface FiscalYearPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageLifecycle: boolean;
}
