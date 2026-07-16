import { createContext, useContext } from "react";

export interface DataGridShellContextValue {
  showRecordNavigation: boolean;
  onToolbarAdd?: () => void;
}

export const DataGridShellContext = createContext<DataGridShellContextValue>({
  showRecordNavigation: true,
});

export function useDataGridShell() {
  return useContext(DataGridShellContext);
}
