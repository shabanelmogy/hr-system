export interface Country {
  id: string | number;
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string | null;
  states?: SimpleState[];
  statesCount?: number;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface SimpleState {
  id: string | number;
  nameAr: string;
  nameEn: string;
  code?: string;
  isDeleted: boolean;
}

export interface CreateCountryRequest {
  nameEn: string;
  nameAr: string;
  alpha2Code?: string | null;
  alpha3Code?: string | null;
  phoneCode?: string | null;
  currencyCode?: string | null;
}

export interface UpdateCountryRequest extends CreateCountryRequest {
  id: string | number;
}

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
  selectedCountry?: Country | null;
  onClose: () => void;
  onSubmit: (data: CountryFormData) => void | Promise<void>;
  loading: boolean;
}
