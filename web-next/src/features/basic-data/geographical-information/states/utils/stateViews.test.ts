import { describe, expect, it } from "vitest";
import { isStateManagementView, stateManagementViews } from "./stateViews";

describe("state management views", () => {
  it("keeps every approved server-list view registered", () => {
    expect(stateManagementViews).toEqual(["grid", "cards", "chart", "report", "import"]);
  });

  it("rejects unsupported or legacy views", () => {
    expect(isStateManagementView("chart")).toBe(true);
    expect(isStateManagementView("import")).toBe(true);
    expect(isStateManagementView("map")).toBe(false);
  });
});
