import type { ManagementPageResponse } from "@/lib/api/pagination";
import type { StateLookup } from "../../states/types/State";

interface DistrictFields {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  stateId: number;
  state: SimpleState;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
}

export type SimpleState = StateLookup;

export interface DistrictListItem extends DistrictFields {
  addressesCount: number;
}

export type DistrictDetail = DistrictFields;
export type District = DistrictListItem;

export interface DistrictLookup {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  stateId: number;
}

export interface DistrictAddressListItem {
  id: number;
  buildingNumber: string;
  floor: string;
  apartmentNumber: string;
  postalCode: string;
  isDefault: boolean;
  isDeleted: boolean;
}

export interface DistrictWithAddresses extends DistrictDetail {
  addresses: DistrictAddressListItem[];
}

export interface CreateDistrictRequest {
  nameEn: string;
  nameAr: string;
  code: string;
  stateId: number;
}

export interface CreateDistrictsRequest {
  districts: CreateDistrictRequest[];
}

export interface CreateDistrictsResponse {
  createdCount: number;
}

export interface UpdateDistrictMutation {
  id: number;
  request: CreateDistrictRequest;
}

export interface BulkArchiveDistrictsResponse {
  archivedCount: number;
}

export const DISTRICT_BULK_ARCHIVE_LIMIT = 100;

export type DistrictSortColumn = "nameEn" | "nameAr" | "code" | "state" | "createdOn";
export type DistrictSearchField = "all" | "nameAr" | "nameEn" | "code" | "state";
export type DistrictSearchOperator =
  | "contains"
  | "doesNotContain"
  | "equals"
  | "doesNotEqual"
  | "startsWith"
  | "endsWith";
export type DistrictStatus = "active" | "archived" | "all";

export interface DistrictPageFilters {
  stateId?: number;
  hasAddresses?: boolean;
  searchField?: DistrictSearchField;
  searchOperator?: DistrictSearchOperator;
}

export interface DistrictListFilters extends DistrictPageFilters {
  status: DistrictStatus;
}

export interface DistrictPageQuery extends DistrictPageFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status: DistrictStatus;
  sortBy: DistrictSortColumn;
  sortDirection: "asc" | "desc";
}

export type DistrictPageResponse = ManagementPageResponse<DistrictListItem>;
export type DistrictFormData = CreateDistrictRequest;

export interface DistrictFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedDistrict?: DistrictListItem | DistrictDetail | null;
  onClose: () => void;
  onSubmit: (data: DistrictFormData) => void | Promise<void>;
  loading: boolean;
  detailError?: string;
  onRetryDetails?: () => void;
}
