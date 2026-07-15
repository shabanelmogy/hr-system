export type ExportRow = Record<string, unknown>;
export type ExportRowId = string | number;

export type ExportColumn = {
  field: string;
  visible?: boolean;
};

export type ExportFilterItem = {
  field?: string;
  operator?: string;
  value?: unknown;
};

export type ExportGridApi = {
  getAllColumns?: () => ExportColumn[];
  getVisibleColumns?: () => ExportColumn[];
  getSelectedRows?: () => Map<ExportRowId, ExportRow>;
  getRowModels?: () => Map<ExportRowId, ExportRow>;
  getVisibleRowIds?: () => ExportRowId[];
  getSortedRowIds?: () => ExportRowId[];
  state?: {
    filter?: {
      filterModel?: {
        items?: ExportFilterItem[];
        quickFilterValues?: unknown[];
      };
    };
  };
  props?: { filterMode?: "client" | "server" | string };
};

export type ExportGridApiRef = {
  current?: ExportGridApi;
};

export type ExportRunOptions = {
  fileName?: string;
  culture?: string;
  excludeColumns?: string[];
  includeColumns?: string[] | null;
};

export type ExportMenuOption = {
  id: string;
  label: string;
  format?: "excel" | "pdf" | "csv" | "print";
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

export type PreparedExport = {
  rows: ExportRow[];
  columns: string[];
  source: "selected" | "filtered" | "all";
};

export type ExportFormatAdapter<TFormatOptions extends object> = {
  extension: string;
  export: (
    rows: ExportRow[],
    options: Required<Pick<ExportRunOptions, "fileName" | "culture">> & TFormatOptions,
  ) => Promise<Blob>;
};
