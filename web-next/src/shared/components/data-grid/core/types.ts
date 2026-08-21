import type {
  DataGridProps,
  GridRowId,
  GridSortModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import type { ReactNode } from "react";

export interface DataGridToolbarSearchOption {
  value: string;
  label: string;
}

export interface DataGridToolbarSearchSelect {
  label: string;
  value: string;
  options: ReadonlyArray<DataGridToolbarSearchOption>;
  onChange: (value: string) => void;
}

export interface DataGridToolbarSearchConfig {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
  column?: DataGridToolbarSearchSelect;
  operator?: DataGridToolbarSearchSelect;
}

export type GridOptionsContent = (closeMenu: () => void) => ReactNode;

export type MyDataGridProps<
  TRow extends GridValidRowModel = GridValidRowModel,
> = DataGridProps<TRow> & {
  initialSortModel?: GridSortModel;
  showNavigationButtons?: boolean;
  showGridOptions?: boolean;
  gridOptionsContent?: GridOptionsContent;
  onToolbarAdd?: () => void;
  toolbarSearch?: DataGridToolbarSearchConfig;
  toolbarContent?: ReactNode;
  autoSelectFirstRow?: boolean;
  lastAddedId?: GridRowId | null;
  lastEditedId?: GridRowId | null;
  lastDeletedIndex?: number | null;
};
