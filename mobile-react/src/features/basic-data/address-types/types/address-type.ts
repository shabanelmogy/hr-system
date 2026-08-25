export type AddressTypeStatus = 'active' | 'archived' | 'all';
export type AddressTypeSearchField = 'all' | 'nameAr' | 'nameEn';
export type AddressTypeSearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';
export type AddressTypeSortColumn = 'nameEn' | 'nameAr' | 'createdOn';

export interface AddressType {
  id: number; nameAr: string; nameEn: string; addressesCount: number;
  createdOn: string; updatedOn: string | null; isDeleted: boolean;
}
export type AddressTypeDetail = Omit<AddressType, 'addressesCount'>;
export interface AddressTypeRequest { nameAr: string; nameEn: string; }
export interface AddressTypeFilters { status: AddressTypeStatus; }
export interface AddressTypePageQuery extends AddressTypeFilters {
  pageNumber: number; pageSize: number; search: string; searchField: AddressTypeSearchField;
  searchOperator: AddressTypeSearchOperator; sortBy: AddressTypeSortColumn; sortDirection: 'asc' | 'desc';
}
export interface BulkCreateAddressTypesResponse { createdCount: number; }
export interface BulkArchiveAddressTypesResponse { archivedCount: number; }
