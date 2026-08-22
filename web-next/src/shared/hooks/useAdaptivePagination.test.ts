import { describe, expect, it } from "vitest";
import {
  getAdaptivePaginationMode,
  getClientPageItems,
  resolveAdaptivePaginationMode,
} from "./useAdaptivePagination";

describe("adaptive pagination", () => {
  it("uses client pagination through 5000 rows and server pagination above it", () => {
    expect(getAdaptivePaginationMode(undefined)).toBeNull();
    expect(getAdaptivePaginationMode(0)).toBe("client");
    expect(getAdaptivePaginationMode(5000)).toBe("client");
    expect(getAdaptivePaginationMode(5001)).toBe("server");
  });

  it("slices a loaded client collection using one-based API pages", () => {
    const items = Array.from({ length: 12 }, (_, index) => index + 1);

    expect(getClientPageItems(items, 1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getClientPageItems(items, 3, 5)).toEqual([11, 12]);
  });

  it("falls back to server pagination when an older API rejects the client collection request", () => {
    expect(resolveAdaptivePaginationMode("client", false)).toBe("client");
    expect(resolveAdaptivePaginationMode("client", true)).toBe("server");
    expect(resolveAdaptivePaginationMode("server", false)).toBe("server");
  });
});
