import { describe, expect, it } from "vitest";
import { getGridSortModelKey } from "./controlledModels";

describe("controlled Data Grid models", () => {
  it("uses semantic sort content instead of array identity", () => {
    const first = [{ field: "createdOn", sort: "desc" as const }];
    const second = [{ field: "createdOn", sort: "desc" as const }];

    expect(first).not.toBe(second);
    expect(getGridSortModelKey(first)).toBe(getGridSortModelKey(second));
  });

  it("changes when the server sort really changes", () => {
    expect(getGridSortModelKey([{ field: "createdOn", sort: "desc" }]))
      .not.toBe(getGridSortModelKey([{ field: "createdOn", sort: "asc" }]));
  });
});
