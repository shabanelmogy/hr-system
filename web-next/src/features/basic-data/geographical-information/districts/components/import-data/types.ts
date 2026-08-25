import type { MyDataTableColumn } from "@/shared/components/data-grid";
import type { SpreadsheetImportRowStatus } from "@/shared/services/excelService";

export interface DistrictImportPreview {
  nameAr: string;
  nameEn: string;
  code: string;
  stateName: string;
  importStatus?: string;
  errorMessage?: string;
}

export interface ImportDistrict extends DistrictImportPreview {
  rowNumber: number;
  uploadStatus: SpreadsheetImportRowStatus;
  importStatus: string;
}

export type ColumnConfig = MyDataTableColumn<DistrictImportPreview>;
