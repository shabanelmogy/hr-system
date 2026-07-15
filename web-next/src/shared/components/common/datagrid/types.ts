import type {
  DataGridProps,
  GridApi,
  GridColDef,
  GridFeatureMode,
  GridRowId,
  GridRowIdGetter,
  GridRowsProp,
  GridSortModel,
} from "@mui/x-data-grid";
import type { RefObject } from "react";

export type NavigationUpdate = () => void;

export interface MyDataGridProps
  extends Omit<
    DataGridProps,
    | "apiRef"
    | "columns"
    | "filterMode"
    | "getRowId"
    | "initialState"
    | "onPaginationModelChange"
    | "paginationModel"
    | "rows"
    | "slots"
  > {
  rows?: GridRowsProp;
  columns?: GridColDef[];
  apiRef?: RefObject<GridApi | null> | null;
  sortModel?: GridSortModel;
  filterMode?: GridFeatureMode;
  addNewRow?: () => void;
  rowId?: GridRowIdGetter;
  showAddButton?: boolean;
  fileName?: string;
  reportPdfHeader?: string;
  showNavigationButtons?: boolean;
  onNavigationUpdate?: (updateFn: NavigationUpdate) => void;
  excludeColumnsFromExport?: string[];
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;
  lastAddedId?: GridRowId | null;
  lastEditedId?: GridRowId | null;
  lastDeletedIndex?: number | null;
}
