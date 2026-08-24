export type CountryStatus = 'active' | 'archived' | 'all';

export type CountrySearchField =
  | 'all'
  | 'nameAr'
  | 'nameEn'
  | 'alpha2Code'
  | 'alpha3Code'
  | 'phoneCode'
  | 'currencyCode';

export type CountrySearchOperator =
  | 'contains'
  | 'doesNotContain'
  | 'equals'
  | 'doesNotEqual'
  | 'startsWith'
  | 'endsWith';

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
}

export interface CountryPageQuery extends CountryFilters {
  pageNumber: number;
  pageSize: number;
  search: string;
  searchField: CountrySearchField;
  searchOperator: CountrySearchOperator;
  sortBy: CountrySortColumn;
  sortDirection: 'asc' | 'desc';
}

export interface BulkArchiveCountriesResponse {
  archivedCount: number;
}
