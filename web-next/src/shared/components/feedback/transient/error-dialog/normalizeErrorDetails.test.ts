import { describe, expect, it } from "vitest";
import { normalizeErrorDetails } from "./normalizeErrorDetails";

describe("normalizeErrorDetails", () => {
  it("normalizes RFC problem details and removes duplicate messages", () => {
    const result = normalizeErrorDetails({
      response: {
        data: {
          title: "Validation failed",
          status: 400,
          traceId: "trace-1",
          errors: { name: ["Required", "Required"], code: "Invalid" },
        },
      },
    });

    expect(result).toMatchObject({
      title: "Validation failed",
      status: 400,
      traceId: "trace-1",
      messages: ["Required", "Invalid"],
    });
  });

  it("preserves details that were already normalized", () => {
    const result = normalizeErrorDetails(
      { reportId: "report-1", messages: ["Failure"], path: "/original" },
      "Fallback",
      { reportId: "report-2", path: "/current" },
    );

    expect(result).toMatchObject({
      reportId: "report-1",
      title: "Fallback",
      messages: ["Failure"],
      path: "/original",
    });
  });

  it("handles unknown values without inventing technical details", () => {
    expect(normalizeErrorDetails(null)).toEqual({ messages: [] });
  });
});
