import type { GridSortModel } from "@mui/x-data-grid";

/**
 * MUI observes the controlled sort-model reference and publishes a
 * sortModelChange when that reference changes. Its pagination feature then
 * navigates to page zero. Feature components commonly build the one-item model
 * inline, so use a semantic key to retain the same reference across unrelated
 * renders (loading, row replacement, selection, etc.).
 */
export function getGridSortModelKey(model: GridSortModel | undefined) {
  return JSON.stringify(model ?? null);
}
