import type { MyDataTableColumn } from "@/shared/components/data-grid";
import type { SpreadsheetImportRowStatus } from "@/shared/services/excelService";

export interface AddressTypeImportRow {
  rowNumber: number;
  nameAr: string;
  nameEn: string;
  uploadStatus: SpreadsheetImportRowStatus;
  importStatus: string;
  errorMessage?: string;
}

export type AddressTypeImportColumn = MyDataTableColumn<AddressTypeImportRow>;
