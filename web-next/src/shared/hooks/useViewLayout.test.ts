import { describe, expect, it } from "vitest";
import { readStoredViewLayout } from "./useViewLayout";

const validLayouts = ["grid", "cards", "chart"] as const;

describe("readStoredViewLayout", () => {
  it("returns a valid persisted layout", () => {
    const storage = { getItem: () => "chart" };

    expect(readStoredViewLayout(storage, "countries-view", "grid", validLayouts)).toBe(
      "chart",
    );
  });

  it("falls back when the saved layout is missing or invalid", () => {
    expect(
      readStoredViewLayout({ getItem: () => null }, "countries-view", "grid", validLayouts),
    ).toBe("grid");
    expect(
      readStoredViewLayout({ getItem: () => "unknown" }, "countries-view", "grid", validLayouts),
    ).toBe("grid");
  });

  it("falls back when storage access fails", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
    };

    expect(readStoredViewLayout(storage, "countries-view", "grid", validLayouts)).toBe(
      "grid",
    );
  });
});
