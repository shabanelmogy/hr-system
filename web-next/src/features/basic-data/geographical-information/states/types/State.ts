// State types and interfaces
export interface State {
  id: string | number;
  nameAr: string;
  nameEn: string;
  code: string;
  countryId: number;
  country?: SimpleCountry;
  createdOn: string;
  updatedOn: string;
  isDeleted?: boolean;
  [key: string]: any;
}

export interface SimpleCountry {
  id: number;
  nameAr: string;
  nameEn: string;
  code?: string;
}

export interface CreateStateRequest {
  nameEn: string;
  nameAr: string;
  code?: string | null;
  countryId: number;
}

export interface UpdateStateRequest extends CreateStateRequest {
  id: string | number;
}

export interface StateResponse {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  country: SimpleCountry;
  createdOn: string;
  updatedOn?: string;
  isDeleted: boolean;
}

export interface StateFilters {
  search?: string;
  countryId?: number;
  isActive?: boolean;
}

export interface StateQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: StateFilters;
}