export interface MyDataGridProps {
  rows?: any[];
  columns?: any[];
  loading?: boolean;
  apiRef?: any;
  sortModel?: any[];
  filterMode?: any;
  addNewRow?: () => void;
  rowId?: (row: any) => any;
  showAddButton?: boolean;
  fileName?: string;
  reportPdfHeader?: any;
  showNavigationButtons?: boolean;
  onNavigationUpdate?: (updateFn: any) => void;
  excludeColumnsFromExport?: string[];
  viewMode?: string;
  onViewModeChange?: (mode: string) => void;
  lastAddedId?: any;
  lastEditedId?: any;
  lastDeletedIndex?: number | null;
  [key: string]: any;
}
