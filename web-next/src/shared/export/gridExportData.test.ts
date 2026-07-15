import { describe, expect, it } from "vitest";
import { getExportableColumns, prepareGridExport } from "./gridExportData";
import type { ExportGridApiRef, ExportRow } from "./types";

describe("grid export data", () => {
  it("uses visible data columns and applies exclusions case-insensitively", () => {
    const apiRef: ExportGridApiRef = {
      current: {
        getVisibleColumns: () => [
          { field: "id" },
          { field: "nameEn" },
          { field: "actions" },
          { field: "ProfilePicture" },
        ],
      },
    };

    expect(getExportableColumns(apiRef, ["ID"])).toEqual(["nameEn"]);
  });

  it("exports selected rows before filtered or full grid rows", () => {
    const selected = { id: 2, nameEn: "Selected", image: "ignored" };
    const apiRef = createApiRef(
      [[1, { id: 1, nameEn: "All" }]],
      [[2, selected]],
    );

    expect(prepareGridExport(apiRef, ["id", "nameEn", "image"], [])).toEqual({
      source: "selected",
      columns: ["id", "nameEn", "image"],
      rows: [{ id: 2, nameEn: "Selected" }],
    });
  });

  it("uses visible row ids when client filters are active", () => {
    const apiRef = createApiRef([
      [1, { id: 1, nameEn: "First" }],
      [2, { id: 2, nameEn: "Second" }],
    ]);
    apiRef.current!.state = {
      filter: { filterModel: { items: [{ field: "nameEn", value: "Second" }] } },
    };
    apiRef.current!.getVisibleRowIds = () => [2];

    expect(prepareGridExport(apiRef, ["id", "nameEn"], [])).toMatchObject({
      source: "filtered",
      rows: [{ id: 2, nameEn: "Second" }],
    });
  });

  it("sanitizes dates, large arrays, and excluded fields", () => {
    const row = {
      id: 1,
      createdOn: new Date("2026-01-02T03:04:05.000Z"),
      values: Array.from({ length: 101 }, (_, index) => index),
      blobData: "ignored",
    };
    const apiRef = createApiRef([[1, row]]);

    expect(prepareGridExport(apiRef, [], [])?.rows).toEqual([
      {
        id: 1,
        createdOn: "2026-01-02T03:04:05.000Z",
        values: "[Array with 101 items]",
      },
    ]);
  });
});

function createApiRef(
  rows: Array<[number, ExportRow]>,
  selectedRows: Array<[number, ExportRow]> = [],
): ExportGridApiRef {
  return {
    current: {
      getRowModels: () => new Map(rows),
      getSelectedRows: () => new Map(selectedRows),
    },
  };
}
