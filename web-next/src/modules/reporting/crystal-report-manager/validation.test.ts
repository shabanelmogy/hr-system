import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";
import { getCrystalReportCreateSchema } from "./validation";

const t = ((key: string) => key) as TFunction;

describe("managed Crystal report create validation", () => {
  const schema = getCrystalReportCreateSchema(t);

  it("requires a supported entity selection and report file", () => {
    const result = schema.safeParse({ entityKey: "", description: "", file: null });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.map((issue) => issue.path[0])).toContain("entityKey");
    expect(result.error.issues.map((issue) => issue.path[0])).toContain("file");
  });

  it("accepts a bounded rpt file and trims form text", () => {
    const file = new File(["report"], "Countries.rpt", { type: "application/octet-stream" });

    const result = schema.parse({ entityKey: " countries ", description: " summary ", file });

    expect(result).toMatchObject({ entityKey: "countries", description: "summary", file });
  });

  it("rejects a non-rpt source", () => {
    const file = new File(["report"], "Countries.pdf", { type: "application/pdf" });
    expect(schema.safeParse({ entityKey: "countries", description: "", file }).success).toBe(false);
  });
});
