import { createContext, useContext, type ReactNode } from "react";
import type { GridRowId } from "@mui/x-data-grid";
import type { DataGridToolbarSearchConfig, GridOptionsContent } from "./types";

export interface DataGridShellContextValue {
  showRecordNavigation: boolean;
  showColumnFilterButton: boolean;
  showGridOptions: boolean;
  gridOptionsContent?: GridOptionsContent;
  onToolbarAdd?: () => void;
  toolbarSearch?: DataGridToolbarSearchConfig;
  toolbarContent?: ReactNode;
  activeRowId: GridRowId | null;
  setActiveRowId: (id: GridRowId | null) => void;
  syncActiveRowSelection: boolean;
}

export const DataGridShellContext = createContext<DataGridShellContextValue>({
  showRecordNavigation: true,
  showColumnFilterButton: true,
  showGridOptions: false,
  activeRowId: null,
  setActiveRowId: () => undefined,
  syncActiveRowSelection: true,
});

export function useDataGridShell() {
  return useContext(DataGridShellContext);
}
