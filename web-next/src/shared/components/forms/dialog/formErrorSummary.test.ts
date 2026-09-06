import { describe, expect, it } from "vitest";
import { getFormErrorSummary, toFormErrorMessages } from "./formErrorSummary";

describe("getFormErrorSummary", () => {
  it("returns readable field labels and keeps an unmapped field visible", () => {
    expect(getFormErrorSummary(
      { code: "Required", branchId: "Select a branch", empty: "" },
      { code: "Code" },
    )).toEqual([
      { field: "code", label: "Code", message: "Required" },
      { field: "branchId", label: "branchId", message: "Select a branch" },
    ]);
  });

  it("flattens nested field-array errors without exposing RHF metadata", () => {
    expect(toFormErrorMessages({
      title: { type: "required", message: "Title is required", ref: {} },
      lines: [{ positionId: { type: "min", message: "Select a position" } }],
    })).toEqual({
      title: "Title is required",
      "lines.0.positionId": "Select a position",
    });
  });
});
