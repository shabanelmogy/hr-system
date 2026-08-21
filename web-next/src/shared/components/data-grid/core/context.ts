import { createContext, useContext, type ReactNode } from "react";
import type { DataGridToolbarSearchConfig } from "./types";

export interface DataGridShellContextValue {
  showRecordNavigation: boolean;
  showColumnFilterButton: boolean;
  showGridOptions: boolean;
  onToolbarAdd?: () => void;
  toolbarSearch?: DataGridToolbarSearchConfig;
  toolbarContent?: ReactNode;
}

export const DataGridShellContext = createContext<DataGridShellContextValue>({
  showRecordNavigation: true,
  showColumnFilterButton: true,
  showGridOptions: false,
});

export function useDataGridShell() {
  return useContext(DataGridShellContext);
}
