import { test } from "node:test";
import assert from "node:assert/strict";
import { collectSharedGridViolations } from "./shared-grid-policy.mjs";

test("features must use MyDataGrid, including aliases and dynamic library imports", () => {
  for (const source of [
    'import { DataGrid as LocalGrid } from "@mui/x-data-grid";',
    'import Grid from "@mui/x-data-grid/DataGrid";',
    'const Grid = import("@mui/x-data-grid");',
    'import { ClientDataGrid } from "@/shared/components/data-grid";',
    'import Grid from "@/shared/components/data-grid/core/ClientDataGrid";',
    'export { DataGrid as CustomGrid } from "@mui/x-data-grid";',
  ]) assert.equal(collectSharedGridViolations(source, "platform/example/Page.tsx").length, 1);
});

test("shared implementation, grid contracts and the approved consumer remain allowed", () => {
  assert.deepEqual(collectSharedGridViolations('import { DataGrid } from "@mui/x-data-grid";', "shared/components/data-grid/core/ClientDataGrid.tsx"), []);
  assert.deepEqual(collectSharedGridViolations('import type { DataGridProps } from "@mui/x-data-grid"; import { type GridColDef } from "@mui/x-data-grid";', "platform/example/Page.tsx"), []);
  assert.deepEqual(collectSharedGridViolations('import { MyDataGrid } from "@/shared/components/data-grid";', "platform/example/Page.tsx"), []);
});
