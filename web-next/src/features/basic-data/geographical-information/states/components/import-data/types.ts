import type { MyDataTableColumn } from "@/shared/components/data-grid";
import type { SpreadsheetImportRowStatus } from "@/shared/services/excelService";

export interface State {
  nameAr: string;
  nameEn: string;
  code: string;
  countryName: string;
  importStatus?: string;
  errorMessage?: string;
}

export interface ImportState extends State {
  rowNumber: number;
  uploadStatus: SpreadsheetImportRowStatus;
  importStatus: string;
}

export type ColumnConfig = MyDataTableColumn<State>;
