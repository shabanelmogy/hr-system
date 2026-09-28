export interface ControlledPaginationBounds {
  mode: "client" | "server";
  rowCount: number | undefined;
  loadedRowCount: number;
  pageSize: number;
  loading: boolean;
}

/**
 * Keeps the last authoritative server total while a replacement page is
 * loading. MUI uses rowCount to validate the controlled page, so exposing a
 * transient zero/undefined total makes it reset the page before the request
 * completes.
 */
export function getStableServerRowCount(
  previousRowCount: number,
  nextRowCount: number | undefined,
  loading: boolean,
) {
  if (nextRowCount == null) return previousRowCount;
  if (nextRowCount < 0 || !loading) return nextRowCount;
  return previousRowCount;
}

/**
 * Returns the last page only for client-owned collections.
 *
 * MUI already validates controlled server pagination from its stable rowCount,
 * while each server-list controller owns the domain-aware out-of-range recovery
 * after an authoritative response arrives. Clamping here as well creates a
 * second page-state writer and can bounce a requested page during a fetch.
 */
export function getLastControlledPage({
  mode,
  loadedRowCount,
  pageSize,
}: ControlledPaginationBounds): number | null {
  if (mode === "server") return null;

  const effectiveRowCount = loadedRowCount;
  return Math.max(
    0,
    Math.ceil(Math.max(0, effectiveRowCount ?? 0) / Math.max(1, pageSize)) - 1,
  );
}
