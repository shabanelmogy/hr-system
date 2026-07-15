import type {
  ExportGridApiRef,
  ExportRow,
  ExportRowId,
  PreparedExport,
} from "./types";

const systemColumns = ["__check__", "actions", "__detail_panel__"];
const mediaColumns = ["profilePicture", "avatar", "image", "photo", "thumbnail"];
const problematicFieldPatterns = [
  /picture/i,
  /image/i,
  /photo/i,
  /avatar/i,
  /thumbnail/i,
  /binary/i,
  /blob/i,
  /file/i,
];

export function getExportableColumns(
  apiRef: ExportGridApiRef,
  defaultExclusions: string[],
  requestExclusions: string[] = [],
) {
  const api = apiRef.current;
  const columns = api?.getVisibleColumns?.() ?? api?.getAllColumns?.() ?? [];
  const exclusions = new Set(
    [...defaultExclusions, ...requestExclusions, ...systemColumns, ...mediaColumns]
      .map((field) => field.toLowerCase()),
  );

  return columns
    .filter((column) => column.visible !== false)
    .filter((column) => !exclusions.has(column.field.toLowerCase()))
    .map((column) => column.field);
}

export function prepareGridExport(
  apiRef: ExportGridApiRef,
  columns: string[],
  defaultExclusions: string[],
): PreparedExport | null {
  const collected = collectRows(apiRef);
  if (collected.rows.length === 0) return null;

  const rows = collected.rows.map((row, index) => {
    if (!row || typeof row !== "object") {
      throw new Error(`Invalid row data at index ${index}`);
    }
    return filterRowColumns(row, columns, defaultExclusions);
  });

  try {
    JSON.stringify(rows);
  } catch {
    throw new Error("Export data contains non-serializable content");
  }

  return { rows, columns, source: collected.source };
}

function collectRows(apiRef: ExportGridApiRef): Pick<PreparedExport, "rows" | "source"> {
  const api = apiRef.current;
  if (!api) return { rows: [], source: "all" };

  const selectedRows = api.getSelectedRows?.();
  if (selectedRows && selectedRows.size > 0) {
    return { rows: Array.from(selectedRows.values()), source: "selected" };
  }

  const allRows = api.getRowModels?.();
  if (!(allRows instanceof Map)) return { rows: [], source: "all" };

  const filterModel = api.state?.filter?.filterModel;
  const hasActiveFilters =
    Boolean(filterModel?.items?.length) || Boolean(filterModel?.quickFilterValues?.length);

  if (hasActiveFilters) {
    if (api.props?.filterMode === "server") {
      return { rows: Array.from(allRows.values()), source: "filtered" };
    }

    const rowIds = api.getVisibleRowIds?.() ?? api.getSortedRowIds?.() ?? [];
    const rows = rowsForIds(allRows, rowIds);
    if (rows.length > 0) return { rows, source: "filtered" };
  }

  return { rows: Array.from(allRows.values()), source: "all" };
}

function rowsForIds(rows: Map<ExportRowId, ExportRow>, ids: ExportRowId[]) {
  return ids
    .map((id) => rows.get(id))
    .filter((row): row is ExportRow => row !== undefined);
}

function filterRowColumns(
  row: ExportRow,
  includeColumns: string[],
  defaultExclusions: string[],
) {
  const result: ExportRow = {};
  const exclusions = new Set(
    [...defaultExclusions, ...systemColumns, ...mediaColumns].map((field) => field.toLowerCase()),
  );
  const fields = includeColumns.length > 0 ? includeColumns : Object.keys(row);

  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(row, field)) continue;
    if (exclusions.has(field.toLowerCase())) continue;
    if (problematicFieldPatterns.some((pattern) => pattern.test(field))) continue;

    const value = sanitizeValue(row[field], field);
    if (value !== undefined) result[field] = value;
  }

  return result;
}

function sanitizeValue(value: unknown, fieldName: string): unknown {
  if (value == null) return null;
  if (["string", "number", "boolean"].includes(typeof value)) return value;
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    if (value.length > 100) return `[Array with ${value.length} items]`;
    return value.map((item) => sanitizeValue(item, `${fieldName}[]`));
  }

  if (typeof File !== "undefined" && value instanceof File) return undefined;
  if (typeof Blob !== "undefined" && value instanceof Blob) return undefined;

  if (typeof value === "object") {
    try {
      const serialized = JSON.stringify(value);
      return serialized.length > 1000
        ? `[Object - ${serialized.length} chars]`
        : value;
    } catch {
      return "[Unserializable Object]";
    }
  }

  return undefined;
}
