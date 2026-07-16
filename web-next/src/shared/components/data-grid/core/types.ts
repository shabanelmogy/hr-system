import type {
  DataGridProps,
  GridRowId,
  GridSortModel,
  GridValidRowModel,
} from "@mui/x-data-grid";

export type MyDataGridProps<
  TRow extends GridValidRowModel = GridValidRowModel,
> = DataGridProps<TRow> & {
  initialSortModel?: GridSortModel;
  showNavigationButtons?: boolean;
  onToolbarAdd?: () => void;
  lastAddedId?: GridRowId | null;
  lastEditedId?: GridRowId | null;
  lastDeletedIndex?: number | null;
};
