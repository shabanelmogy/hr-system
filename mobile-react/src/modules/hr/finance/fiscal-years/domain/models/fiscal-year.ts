export type FiscalPeriodFrequency = 1 | 2;
export type FiscalYearStatus = 1 | 2 | 3 | 4 | 5;
export type FiscalPeriodStatus = 1 | 2 | 3 | 4;
export type FiscalYearRecordStatus = 'active' | 'archived' | 'all';
export type FiscalYearLifecycleFilter = 'all' | 'draft' | 'open' | 'closing' | 'closed' | 'locked';
export type FiscalYearSearchField = 'all' | 'code' | 'nameAr' | 'nameEn';
export type FiscalYearSearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';
export type FiscalYearSortColumn = 'code' | 'nameAr' | 'nameEn' | 'startDate' | 'endDate' | 'status' | 'createdOn';
export type FiscalYearLifecycleAction = 'open' | 'beginClosing' | 'close' | 'lock' | 'reopen';

export interface FiscalPeriod { id: number; sequence: number; code: string; nameAr: string; nameEn: string; startDate: string; endDate: string; status: FiscalPeriodStatus }
export interface FiscalYear {
  id: number; code: string; nameAr: string; nameEn: string; startDate: string; endDate: string; periodFrequency: FiscalPeriodFrequency; status: FiscalYearStatus;
  periodsCount: number; createdOn: string; updatedOn: string | null; isDeleted: boolean; rowVersion: string;
}
export interface FiscalYearDetail extends Omit<FiscalYear, 'periodsCount'> { periods: FiscalPeriod[] }
export interface FiscalYearLookup { id: number; code: string; nameAr: string; nameEn: string; startDate: string; endDate: string; status: FiscalYearStatus }
export interface FiscalYearRequest { code: string; nameAr: string; nameEn: string; startDate: string; endDate: string; periodFrequency: FiscalPeriodFrequency }
export interface FiscalYearFilters { recordStatus: FiscalYearRecordStatus; lifecycleStatus: FiscalYearLifecycleFilter }
export interface FiscalYearPageQuery extends FiscalYearFilters { pageNumber: number; pageSize: number; search: string; searchField: FiscalYearSearchField; searchOperator: FiscalYearSearchOperator; sortBy: FiscalYearSortColumn; sortDirection: 'asc' | 'desc' }
export interface FiscalYearPageMetadata { currentPage: number; totalPages: number; pageSize: number; pageNumber: number; totalCount: number; hasPrev: boolean; hasNext: boolean }
export interface FiscalYearPage { items: FiscalYear[]; metaData: FiscalYearPageMetadata }
