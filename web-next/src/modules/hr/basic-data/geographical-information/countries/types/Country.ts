import type { ManagementPageResponse } from "@/lib/api/pagination";

interface CountryFields {
  /** Mirrors CountryResponse.Id (an integer) from the API. */
  id: number;
  nameAr: string;
  nameEn: string;
  alpha2Code: string | null;
  alpha3Code: string | null;
  phoneCode: string | null;
  currencyCode: string | null;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
}

export interface CountryListItem extends CountryFields {
  statesCount: number;
}

export type CountryDetail = CountryFields;

export interface CountryLookup {
  id: number;
  nameAr: string;
  nameEn: string;
  isDeleted: boolean;
}

export type CountrySortColumn =
  | "nameEn"
  | "nameAr"
  | "alpha2Code"
  | "alpha3Code"
  | "currencyCode"
  | "createdOn";

export type CountrySearchField =
  | "all"
  | "nameAr"
  | "nameEn"
  | "alpha2Code"
  | "alpha3Code"
  | "phoneCode"
  | "currencyCode";

export type CountrySearchOperator =
  | "contains"
  | "doesNotContain"
  | "equals"
  | "doesNotEqual"
  | "startsWith"
  | "endsWith";

export interface CountryPageFilters {
  currencyCode?: string;
  hasStates?: boolean;
  searchField?: CountrySearchField;
  searchOperator?: CountrySearchOperator;
}

export type CountryStatus = "active" | "archived" | "all";

export interface CountryListFilters extends CountryPageFilters {
  status: CountryStatus;
}

export interface CountryPageQuery extends CountryPageFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status: CountryStatus;
  sortBy: CountrySortColumn;
  sortDirection: "asc" | "desc";
}
export type CountryPageResponse = ManagementPageResponse<CountryListItem>;

export interface CreateCountryRequest {
  nameEn: string;
  nameAr: string;
  alpha2Code?: string | null;
  alpha3Code?: string | null;
  phoneCode?: string | null;
  currencyCode?: string | null;
}

export interface UpdateCountryMutation {
  id: number;
  request: CreateCountryRequest;
}

export interface BulkArchiveCountriesRequest {
  ids: number[];
}

export interface BulkArchiveCountriesResponse {
  archivedCount: number;
}

export const COUNTRY_BULK_ARCHIVE_LIMIT = 100;

export interface CountryFormData {
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string;
}

export interface CountryFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedCountry?: CountryListItem | CountryDetail | null;
  onClose: () => void;
  onSubmit: (data: CountryFormData) => void | Promise<void>;
  loading: boolean;
  detailError?: string;
  onRetryDetails?: () => void;
}
