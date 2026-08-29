export type DistrictStatus = 'active' | 'archived' | 'all';
export type DistrictSortColumn = 'nameEn' | 'nameAr' | 'code' | 'state' | 'createdOn';
export type DistrictSearchField = 'all' | 'nameAr' | 'nameEn' | 'code' | 'state';
export type DistrictSearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';

export interface DistrictState { id: number; nameAr: string; nameEn: string; isDeleted: boolean; }
export interface District {
  id: number; nameAr: string; nameEn: string; code: string; stateId: number; state: DistrictState;
  addressesCount: number; createdOn: string; updatedOn: string | null; isDeleted: boolean;
}
export type DistrictDetail = Omit<District, 'addressesCount'>;
export interface DistrictWithAddresses extends DistrictDetail { addresses: DistrictAddress[]; }
export interface DistrictAddress { id: number; buildingNumber: string | null; floor: string | null; apartmentNumber: string | null; postalCode: string | null; isDeleted: boolean; }
export interface DistrictLookup { id: number; nameAr: string; nameEn: string; code: string; stateId: number; }
export interface DistrictRequest { nameAr: string; nameEn: string; code: string; stateId: number; }
export interface BulkCreateDistrictsResponse { createdCount: number; }
export interface DistrictFilters { status: DistrictStatus; }
export interface DistrictPageQuery extends DistrictFilters {
  pageNumber: number; pageSize: number; search: string; searchField: DistrictSearchField; searchOperator: DistrictSearchOperator;
  sortBy: DistrictSortColumn; sortDirection: 'asc' | 'desc'; stateId?: number; hasAddresses?: boolean;
}
export interface BulkArchiveDistrictsResponse { archivedCount: number; }
