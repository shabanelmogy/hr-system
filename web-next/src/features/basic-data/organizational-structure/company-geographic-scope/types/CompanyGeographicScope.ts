export interface CompanyCountryOption {
  id: number;
  nameAr: string;
  nameEn: string;
  alpha2Code: string | null;
  alpha3Code: string | null;
  isSelected: boolean;
  isDefault: boolean;
}

export interface CompanyGeographicScope {
  companyId: number;
  defaultCountryId: number | null;
  countries: CompanyCountryOption[];
}

export interface UpdateCompanyGeographicScopeRequest {
  countryIds: number[];
  defaultCountryId: number;
}

export interface CompanyGeographicScopeFormValues {
  countryIds: number[];
  defaultCountryId: number;
}
