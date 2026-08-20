import type {
  DataGridProps,
  GridRowId,
  GridSortModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import type { ReactNode } from "react";

export interface DataGridToolbarSearchConfig {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export type MyDataGridProps<
  TRow extends GridValidRowModel = GridValidRowModel,
> = DataGridProps<TRow> & {
  initialSortModel?: GridSortModel;
  showNavigationButtons?: boolean;
  onToolbarAdd?: () => void;
  toolbarSearch?: DataGridToolbarSearchConfig;
  toolbarContent?: ReactNode;
  autoSelectFirstRow?: boolean;
  lastAddedId?: GridRowId | null;
  lastEditedId?: GridRowId | null;
  lastDeletedIndex?: number | null;
};
