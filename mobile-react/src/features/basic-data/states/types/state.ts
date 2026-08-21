export type StateStatus = 'active' | 'archived' | 'all';
export type StateSortColumn = 'nameEn' | 'nameAr' | 'code' | 'country' | 'createdOn';
export type StateSearchField = 'all' | 'nameAr' | 'nameEn' | 'code' | 'country';
export type StateSearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';

export interface StateCountry { id: number; nameAr: string; nameEn: string; isDeleted: boolean; }
export interface State {
  id: number; nameAr: string; nameEn: string; code: string; countryId: number; country: StateCountry;
  districtsCount: number; createdOn: string; updatedOn: string | null; isDeleted: boolean;
}
export type StateDetail = Omit<State, 'districtsCount'>;
export interface StateWithDistricts extends StateDetail { districts: StateDistrict[]; }
export interface StateDistrict { id: number; nameAr: string; nameEn: string; code: string; isDeleted: boolean; }
export interface StateLookup { id: number; nameAr: string; nameEn: string; code: string; countryId: number; }
export interface StateRequest { nameAr: string; nameEn: string; code: string; countryId: number; }
export interface StateFilters { status: StateStatus; }
export interface StatePageQuery extends StateFilters {
  pageNumber: number; pageSize: number; search: string; searchField: StateSearchField; searchOperator: StateSearchOperator;
  sortBy: StateSortColumn; sortDirection: 'asc' | 'desc'; countryId?: number; hasDistricts?: boolean;
}
export interface BulkArchiveStatesResponse { archivedCount: number; }
