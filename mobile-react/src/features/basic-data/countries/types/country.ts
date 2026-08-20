export type CountryStatus = 'active' | 'archived' | 'all';

export type CountrySortColumn =
  | 'nameEn'
  | 'nameAr'
  | 'alpha2Code'
  | 'alpha3Code'
  | 'currencyCode'
  | 'createdOn';

export interface Country {
  id: number;
  nameAr: string;
  nameEn: string;
  alpha2Code: string | null;
  alpha3Code: string | null;
  phoneCode: string | null;
  currencyCode: string | null;
  statesCount: number;
  createdOn: string;
  updatedOn: string | null;
  isDeleted: boolean;
}

export type CountryDetail = Omit<Country, 'statesCount'>;

export interface CountryWithStates extends CountryDetail {
  states: { id: number; nameAr: string; nameEn: string; isDeleted: boolean }[];
}

export interface CountryRequest {
  nameAr: string;
  nameEn: string;
  alpha2Code: string | null;
  alpha3Code: string | null;
  phoneCode: string | null;
  currencyCode: string | null;
}

export interface CountryFilters {
  status: CountryStatus;
  currencyCode: string;
  hasStates: 'all' | 'withStates' | 'withoutStates';
}

export interface CountryPageQuery extends CountryFilters {
  pageNumber: number;
  pageSize: number;
  search: string;
  sortBy: CountrySortColumn;
  sortDirection: 'asc' | 'desc';
}

export interface BulkArchiveCountriesResponse {
  archivedCount: number;
}
