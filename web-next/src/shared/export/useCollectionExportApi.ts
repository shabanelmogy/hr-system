import { useMemo } from "react";
import type {
  ExportColumn,
  ExportGridApiRef,
  ExportRow,
  ExportRowId,
} from "./types";

export function useCollectionExportApi<T extends object>(
  rows: readonly T[],
  columnFields: readonly string[],
): ExportGridApiRef {
  return useMemo(() => {
    const columns: ExportColumn[] = columnFields.map((field) => ({ field }));
    const rowModels = new Map<ExportRowId, ExportRow>();

    rows.forEach((row, index) => {
      const exportRow = { ...row } as ExportRow;
      const rowId = exportRow.id;
      const id: ExportRowId =
        typeof rowId === "string" || typeof rowId === "number" ? rowId : index;
      rowModels.set(id, exportRow);
    });

    return {
      current: {
        getAllColumns: () => columns,
        getVisibleColumns: () => columns,
        getRowModels: () => rowModels,
      },
    };
  }, [columnFields, rows]);
}
