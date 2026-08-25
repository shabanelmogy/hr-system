import type { ManagementPageResponse } from "@/lib/api/pagination";

export type AddressTypeStatus = "active" | "archived" | "all";
export type AddressTypeSearchField = "all" | "nameAr" | "nameEn";
export type AddressTypeSearchOperator = "contains" | "doesNotContain" | "equals" | "doesNotEqual" | "startsWith" | "endsWith";
export type AddressTypeSortColumn = "nameEn" | "nameAr" | "createdOn";

/** Server-managed criteria shared by Grid, Cards, and Chart. */
export interface AddressTypeListFilters {
  status: AddressTypeStatus;
  searchField: AddressTypeSearchField;
  searchOperator: AddressTypeSearchOperator;
}

export interface AddressType {
  id: number;
  nameAr: string;
  nameEn: string;
  addressesCount: number;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
}

export type AddressTypeDetail = Omit<AddressType, "addressesCount">;
export interface AddressTypeLookup { id: number; nameAr: string; nameEn: string; }
export interface AddressTypeAddress { id: number; buildingNumber: string; floor: string; apartmentNumber: string; postalCode: string; isDefault: boolean; isDeleted: boolean; }
export interface AddressTypeWithAddresses extends AddressTypeDetail { addresses: AddressTypeAddress[]; }
export interface CreateAddressTypeRequest { nameAr: string; nameEn: string; }
/** Compatibility input for existing form consumers; the API receives the ID in the route. */
export interface UpdateAddressTypeRequest extends CreateAddressTypeRequest { id: number; }
export interface BulkCreateAddressTypesResponse { createdCount: number; }
export interface BulkArchiveAddressTypesResponse { archivedCount: number; }
export interface AddressTypePageQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
  searchField: AddressTypeSearchField;
  searchOperator: AddressTypeSearchOperator;
  status: AddressTypeStatus;
  sortBy: AddressTypeSortColumn;
  sortDirection: "asc" | "desc";
}
export type AddressTypePageResponse = ManagementPageResponse<AddressType>;
export interface AddressTypeFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedItem?: AddressType | AddressTypeDetail | null;
  onClose: () => void;
  onSubmit: (data: CreateAddressTypeRequest) => void | Promise<void>;
  loading: boolean;
}
