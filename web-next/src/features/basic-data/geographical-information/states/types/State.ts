import type { ManagementPageResponse } from "@/lib/api/pagination";
import type { CountryLookup } from "../../countries/types/Country";

interface StateFields {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  countryId: number;
  country: SimpleCountry;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
}

export type SimpleCountry = CountryLookup;

export interface StateListItem extends StateFields {
  districtsCount: number;
}

export type StateDetail = StateFields;
export type State = StateListItem;

export interface StateLookup {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  countryId: number;
}

export interface StateDistrictListItem {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  isDeleted: boolean;
}

export interface StateWithDistricts extends StateDetail {
  districts: StateDistrictListItem[];
}

export interface CreateStateRequest {
  nameEn: string;
  nameAr: string;
  code: string;
  countryId: number;
}

export interface UpdateStateMutation {
  id: number;
  request: CreateStateRequest;
}

export interface BulkArchiveStatesResponse { archivedCount: number; }

export type StateSortColumn = "nameEn" | "nameAr" | "code" | "country" | "createdOn";
export type StateSearchField = "all" | "nameAr" | "nameEn" | "code" | "country";
export type StateSearchOperator =
  | "contains"
  | "doesNotContain"
  | "equals"
  | "doesNotEqual"
  | "startsWith"
  | "endsWith";
export type StateStatus = "active" | "archived" | "all";

export interface StatePageFilters {
  countryId?: number;
  hasDistricts?: boolean;
  searchField?: StateSearchField;
  searchOperator?: StateSearchOperator;
}

export interface StateListFilters extends StatePageFilters {
  status: StateStatus;
}

export interface StatePageQuery extends StatePageFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status: StateStatus;
  sortBy: StateSortColumn;
  sortDirection: "asc" | "desc";
}

export type StatePageResponse = ManagementPageResponse<StateListItem>;

export type StateFormData = CreateStateRequest;

export interface StateFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedState?: StateListItem | StateDetail | null;
  onClose: () => void;
  onSubmit: (data: StateFormData) => void | Promise<void>;
  loading: boolean;
  detailError?: string;
  onRetryDetails?: () => void;
}
