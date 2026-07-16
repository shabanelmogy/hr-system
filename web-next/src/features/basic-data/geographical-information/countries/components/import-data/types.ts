export interface Country {
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string | null;
  importStatus?: string;
}

export type ColumnConfig = MyDataTableColumn<Country>;
import type { MyDataTableColumn } from "@/shared/components/data-grid/MyDataTable";
