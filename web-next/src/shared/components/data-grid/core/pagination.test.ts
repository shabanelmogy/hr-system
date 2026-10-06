import { describe, expect, it } from "vitest";
import {
  getLastControlledPage,
  getStableServerRowCount,
} from "./pagination";

describe("stable server row count", () => {
  it("keeps the authoritative total during a replacement-page load", () => {
    expect(getStableServerRowCount(12, 0, true)).toBe(12);
    expect(getStableServerRowCount(12, undefined, true)).toBe(12);
  });

  it("accepts the real total after loading, including an empty result", () => {
    expect(getStableServerRowCount(12, 8, false)).toBe(8);
    expect(getStableServerRowCount(12, 0, false)).toBe(0);
  });

  it("preserves MUI's unknown-total sentinel", () => {
    expect(getStableServerRowCount(12, -1, true)).toBe(-1);
  });
});

describe("controlled Data Grid pagination bounds", () => {
  it("never adds a second clamp for a server-owned page", () => {
    expect(getLastControlledPage({
      mode: "server",
      rowCount: 21,
      loadedRowCount: 1,
      pageSize: 10,
      loading: false,
    })).toBeNull();
  });

  it.each([undefined, -1])("does not infer a server total from loaded rows (%s)", (rowCount) => {
    expect(getLastControlledPage({
      mode: "server",
      rowCount,
      loadedRowCount: 3,
      pageSize: 10,
      loading: false,
    })).toBeNull();
  });

  it("continues to calculate client pages from the loaded collection", () => {
    expect(getLastControlledPage({
      mode: "client",
      rowCount: undefined,
      loadedRowCount: 11,
      pageSize: 5,
      loading: false,
    })).toBe(2);
  });
});
