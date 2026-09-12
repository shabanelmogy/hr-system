import type { MyDataTableColumn } from "@/shared/components/data-grid";
import type { SpreadsheetImportRowStatus } from "@/shared/services/excelService";

export interface Country {
  nameAr: string;
  nameEn: string;
  alpha2Code: string;
  alpha3Code: string;
  phoneCode: string;
  currencyCode: string | null;
  importStatus?: string;
  errorMessage?: string;
}

export interface ImportCountry extends Country {
  rowNumber: number;
  uploadStatus: SpreadsheetImportRowStatus;
  importStatus: string;
}

export type ColumnConfig = MyDataTableColumn<Country>;
