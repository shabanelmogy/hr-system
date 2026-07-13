export interface Country {
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string | null;
}

export interface ColumnConfig {
  field: string;
  headerName: string;
  mobileHeader: string;
  icon: React.ReactNode;
  type?: string;
}
